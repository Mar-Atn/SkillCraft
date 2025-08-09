import type { Scenario, ScenarioData } from '../types/scenario';

class ScenarioService {
  private scenarioData: ScenarioData | null = null;
  private cachedScenarios: Scenario[] | null = null;

  /**
   * Clear cached data to force reload
   */
  clearCache(): void {
    this.scenarioData = null;
    this.cachedScenarios = null;
    console.log('🔄 Scenario cache cleared');
  }

  /**
   * Load scenarios - prioritizes localStorage (admin-modified) over .md file
   */
  async loadScenarios(): Promise<ScenarioData> {
    // Check localStorage first for admin-created/modified scenarios
    const backup = localStorage.getItem('skillcraft_scenarios_backup');
    if (backup) {
      try {
        const adminScenarios = JSON.parse(backup) as Scenario[];
        console.log('✅ Loaded', adminScenarios.length, 'scenarios from localStorage (admin-modified)');
        
        this.scenarioData = {
          scenarios: adminScenarios,
          totalScenarios: adminScenarios.length,
          difficultyRange: "Levels 1, 3, and 5",
          focusArea: "Setting Expectations conversations for team leads"
        };
        return this.scenarioData;
      } catch (error) {
        console.warn('⚠️ Failed to parse localStorage scenarios, falling back to file:', error);
      }
    }

    // If no localStorage data or it failed, load from file
    if (this.scenarioData) {
      return this.scenarioData;
    }

    try {
      // Fetch the Scenarios.md file from the project root
      const response = await fetch('/Scenarios.md');
      if (!response.ok) {
        throw new Error('Failed to load Scenarios.md');
      }
      
      const content = await response.text();
      this.scenarioData = this.parseScenarios(content);
      console.log('📄 Loaded', this.scenarioData.scenarios.length, 'scenarios from Scenarios.md file');
      
      // Save to localStorage for future use (so admin modifications persist)
      localStorage.setItem('skillcraft_scenarios_backup', JSON.stringify(this.scenarioData.scenarios));
      console.log('💾 Saved file scenarios to localStorage for future modifications');
      
      return this.scenarioData;
    } catch (error) {
      console.error('Error loading scenarios from file:', error);
      // If file loading fails and no localStorage, return empty
      this.scenarioData = {
        scenarios: [],
        totalScenarios: 0,
        difficultyRange: "Levels 1, 3, and 5",
        focusArea: "Setting Expectations conversations for team leads"
      };
      return this.scenarioData;
    }
  }

  /**
   * Parse the markdown content and extract scenario information
   */
  private parseScenarios(content: string): ScenarioData {
    const scenarios: Scenario[] = [];
    const scenarioBlocks = content.split(/## Scenario \d+:/);
    
    // Remove the header block (everything before first scenario)
    scenarioBlocks.shift();

    scenarioBlocks.forEach((block, index) => {
      try {
        const scenario = this.parseScenarioBlock(block, index + 1);
        scenarios.push(scenario);
      } catch (error) {
        console.warn(`Failed to parse scenario ${index + 1}:`, error);
      }
    });

    return {
      scenarios,
      totalScenarios: scenarios.length,
      difficultyRange: "Levels 1, 3, and 5",
      focusArea: "Setting Expectations conversations for team leads"
    };
  }

  /**
   * Parse an individual scenario block
   */
  private parseScenarioBlock(block: string, id: number): Scenario {
    const lines = block.split('\n');
    
    // Extract title from the first line
    const title = lines[0]?.trim() || `Scenario ${id}`;
    
    // Extract sections using regex patterns
    const generalContext = this.extractSection(block, /### 1\. General Context\s*\n([\s\S]*?)(?=\n### 2\.|$)/);
    const humanInstructions = this.extractSection(block, /### 2\. Confidential Instructions 1 \(For Human Participant[^)]*\)\s*\n([\s\S]*?)(?=\n### 3\.|$)/);
    const aiInstructions = this.extractSection(block, /### 3\. Confidential Instructions 2 \(For AI Participant[^)]*\)\s*\n([\s\S]*?)(?=\n### 4\.|$)/);
    
    // Extract learning objectives, focus points, and debriefing points
    const learningObjectives = this.extractBulletPoints(block, /\*\*Learning Objectives:\*\*\s*\n([\s\S]*?)(?=\*\*Focus Points:\*\*|$)/);
    const focusPoints = this.extractBulletPoints(block, /\*\*Focus Points:\*\*\s*\n([\s\S]*?)(?=\*\*Debriefing Points:\*\*|$)/);
    const debriefingPoints = this.extractBulletPoints(block, /\*\*Debriefing Points:\*\*\s*\n([\s\S]*?)(?=### 5\.|$)/);
    
    // Extract difficulty level
    const difficultyMatch = block.match(/### 5\. Case Difficulty Level\s*\n\*\*(\d+)\*\*/);
    const difficultyLevel = difficultyMatch ? parseInt(difficultyMatch[1]) : 1;

    return {
      id,
      title,
      generalContext: generalContext.trim(),
      humanInstructions: humanInstructions.trim(),
      aiInstructions: aiInstructions.trim(),
      learningObjectives,
      focusPoints,
      debriefingPoints,
      difficultyLevel
    };
  }

  /**
   * Extract a section of text using regex
   */
  private extractSection(text: string, regex: RegExp): string {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract bullet points from a section
   */
  private extractBulletPoints(text: string, regex: RegExp): string[] {
    const match = text.match(regex);
    if (!match) return [];
    
    const section = match[1];
    const bulletPoints = section
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- '))
      .map(line => line.substring(2).trim())
      .filter(line => line.length > 0);
    
    return bulletPoints;
  }

  /**
   * Get a specific scenario by ID
   * BRIDGE: Uses merged scenarios (file + admin) to find scenario
   */
  async getScenario(id: number): Promise<Scenario | null> {
    const allScenarios = await this.getAllScenarios();
    return allScenarios.find(scenario => scenario.id === id) || null;
  }

  /**
   * Get all available scenarios
   * Loads scenarios (localStorage priority) + applies persistent character assignments
   */
  async getAllScenarios(): Promise<Scenario[]> {
    // Use cached scenarios if available
    if (this.cachedScenarios) {
      return this.cachedScenarios;
    }

    try {
      // Load scenarios (localStorage first, then file)
      const scenarioData = await this.loadScenarios();
      let allScenarios = [...scenarioData.scenarios];
      
      // Apply persistent character assignments
      const { scenarioCharacterService } = await import('../services/scenarioCharacterService');
      allScenarios = scenarioCharacterService.applyAssignments(allScenarios);
      
      // FALLBACK: Assign default characters to scenarios that still don't have character assignments
      const { characterService } = await import('../services/characterService');
      const scenariosWithCharacters = await Promise.all(
        allScenarios.map(async (scenario) => {
          if (!scenario.assignedCharacterId) {
            const defaultChar = await characterService.getDefaultCharacterForScenario(scenario.difficultyLevel);
            if (defaultChar) {
              console.log('🎭 Assigning default character to scenario:', {
                scenario: scenario.title,
                character: defaultChar.name,
                characterId: defaultChar.id
              });
              return {
                ...scenario,
                assignedCharacterId: defaultChar.id,
                assignedCharacterName: defaultChar.name
              };
            }
          }
          return scenario;
        })
      );
      
      // Cache the result
      this.cachedScenarios = scenariosWithCharacters;
      return scenariosWithCharacters;
    } catch (error) {
      console.error('❌ Failed to load scenarios:', error);
      return [];
    }
  }

  /**
   * Get scenario context for the voice conversation
   * This formats the scenario data for the VoiceConversation component
   */
  async getScenarioContext(scenarioId: number, roleType: 'human' | 'ai'): Promise<{
    generalContext: string;
    roleInstructions: string;
    scenarioTitle: string;
  } | null> {
    const scenario = await this.getScenario(scenarioId);
    if (!scenario) return null;

    return {
      generalContext: scenario.generalContext,
      roleInstructions: roleType === 'human' ? scenario.humanInstructions : scenario.aiInstructions,
      scenarioTitle: scenario.title
    };
  }
}

// Export a singleton instance
export const scenarioService = new ScenarioService();