// Scenario-Character Assignment Service
// Handles persistent storage of character assignments for scenarios

interface ScenarioCharacterAssignment {
  scenarioId: number;
  assignedCharacterId: number;
  assignedCharacterName: string;
  assignedAt: string;
}

class ScenarioCharacterService {
  private readonly STORAGE_KEY = 'skillcraft_scenario_character_assignments';

  /**
   * Get all scenario-character assignments
   */
  getAllAssignments(): Record<number, ScenarioCharacterAssignment> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load scenario character assignments:', error);
      return {};
    }
  }

  /**
   * Get character assignment for a specific scenario
   */
  getAssignment(scenarioId: number): ScenarioCharacterAssignment | null {
    const assignments = this.getAllAssignments();
    return assignments[scenarioId] || null;
  }

  /**
   * Save character assignment for a scenario
   */
  saveAssignment(scenarioId: number, characterId: number, characterName: string): void {
    try {
      const assignments = this.getAllAssignments();
      
      assignments[scenarioId] = {
        scenarioId,
        assignedCharacterId: characterId,
        assignedCharacterName: characterName,
        assignedAt: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assignments));
      console.log('✅ Saved character assignment:', {
        scenarioId,
        characterId,
        characterName
      });
    } catch (error) {
      console.error('Failed to save scenario character assignment:', error);
      throw new Error('Failed to save character assignment');
    }
  }

  /**
   * Remove character assignment for a scenario
   */
  removeAssignment(scenarioId: number): void {
    try {
      const assignments = this.getAllAssignments();
      delete assignments[scenarioId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assignments));
      console.log('✅ Removed character assignment for scenario:', scenarioId);
    } catch (error) {
      console.error('Failed to remove scenario character assignment:', error);
      throw new Error('Failed to remove character assignment');
    }
  }

  /**
   * Apply saved assignments to a list of scenarios
   */
  applyAssignments(scenarios: any[]): any[] {
    const assignments = this.getAllAssignments();
    
    return scenarios.map(scenario => {
      const assignment = assignments[scenario.id];
      if (assignment) {
        return {
          ...scenario,
          assignedCharacterId: assignment.assignedCharacterId,
          assignedCharacterName: assignment.assignedCharacterName
        };
      }
      return scenario;
    });
  }
}

export const scenarioCharacterService = new ScenarioCharacterService();