import type { Scenario, ScenarioData } from '../types/scenario';

class ScenarioService {
  private scenarioData: ScenarioData | null = null;

  /**
   * Parse the Scenarios.md content and extract structured scenario data
   */
  async loadScenarios(): Promise<ScenarioData> {
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
      return this.scenarioData;
    } catch (error) {
      console.error('Error loading scenarios:', error);
      throw new Error('Failed to load scenario data');
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
   */
  async getScenario(id: number): Promise<Scenario | null> {
    const data = await this.loadScenarios();
    return data.scenarios.find(scenario => scenario.id === id) || null;
  }

  /**
   * Get all available scenarios
   */
  async getAllScenarios(): Promise<Scenario[]> {
    const data = await this.loadScenarios();
    return data.scenarios;
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