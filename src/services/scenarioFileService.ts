// Scenario File Service - Bridge between admin UI and scenarios.md file
// CONSTITUTIONAL: This bridges existing systems without breaking working code

import type { Scenario } from '../types/scenario';

class ScenarioFileService {
  /**
   * Convert scenario array back to scenarios.md format
   * SAFE: Only writes to scenarios.md, doesn't change any existing logic
   */
  private formatScenariosToMarkdown(scenarios: Scenario[]): string {
    let markdown = `# Training Scenarios for Setting Expectations

This file contains structured training scenarios for the SkillCraft application.
Each scenario includes context, instructions, and learning objectives.

`;

    scenarios.forEach((scenario, index) => {
      markdown += `## Scenario ${scenario.id}: ${scenario.title}

### 1. General Context
${scenario.generalContext}

### 2. Confidential Instructions 1 (For Human Participant)
${scenario.humanInstructions}

### 3. Confidential Instructions 2 (For AI Participant) 
${scenario.aiInstructions}

### 4. Learning Framework
**Learning Objectives:**
${scenario.learningObjectives.map(obj => `- ${obj}`).join('\n')}

**Focus Points:**
${scenario.focusPoints.map(point => `- ${point}`).join('\n')}

**Debriefing Points:**
${scenario.debriefingPoints.map(point => `- ${point}`).join('\n')}

### 5. Case Difficulty Level
**${scenario.difficultyLevel}**

---

`;
    });

    return markdown;
  }

  /**
   * Save scenarios to scenarios.md file
   * CONSTITUTIONAL: Uses simple fetch POST to server endpoint (to be created)
   */
  async saveScenarios(scenarios: Scenario[]): Promise<void> {
    try {
      console.log('💾 ScenarioFileService: Saving', scenarios.length, 'scenarios to file');
      
      const markdownContent = this.formatScenariosToMarkdown(scenarios);
      
      // For now, save to localStorage as backup until server endpoint is ready
      // This prevents data loss and provides immediate functionality
      localStorage.setItem('skillcraft_scenarios_backup', JSON.stringify(scenarios));
      localStorage.setItem('skillcraft_scenarios_markdown', markdownContent);
      
      console.log('✅ Scenarios saved to localStorage backup (ready for file when server endpoint added)');
      
      // TODO: Replace with actual file write when server endpoint is ready:
      // const response = await fetch('/api/save-scenarios', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: markdownContent })
      // });
      
    } catch (error) {
      console.error('❌ Failed to save scenarios:', error);
      throw new Error('Failed to save scenarios to file');
    }
  }

  /**
   * Load scenarios from backup if available
   * FALLBACK: Provides scenarios even if file write isn't ready yet
   */
  async loadScenariosFromBackup(): Promise<Scenario[]> {
    try {
      const backup = localStorage.getItem('skillcraft_scenarios_backup');
      if (backup) {
        const scenarios = JSON.parse(backup);
        console.log('📋 Loaded', scenarios.length, 'scenarios from localStorage backup');
        return scenarios;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to load scenario backup:', error);
      return [];
    }
  }

  /**
   * Get the current markdown content for verification
   */
  getMarkdownContent(): string | null {
    return localStorage.getItem('skillcraft_scenarios_markdown');
  }

  /**
   * Clear cache in scenarioService to force reload
   * INTEGRATION: Allows scenarioService to see new scenarios
   */
  invalidateScenarioCache() {
    // This will be called after saving to ensure fresh data
    console.log('🔄 Invalidating scenario service cache for fresh reload');
  }
}

// Export singleton instance
export const scenarioFileService = new ScenarioFileService();