// Character Service - Manages AI characters for scenarios
// Handles character data loading from AI_characters.md and provides character selection

export interface Character {
  id: number;
  name: string;
  personalContext: string;
  characterDescription: string;
  complexityLevel: number;
  voiceId?: string;
  voiceName?: string;
}

class CharacterService {
  private characters: Character[] | null = null;

  /**
   * Get all available characters
   * TODO: In production, this will load from AI_characters.md file
   */
  async getAllCharacters(): Promise<Character[]> {
    if (this.characters) {
      return this.characters;
    }

    // Mock data synchronized with Character Management - will be replaced with file loading from AI_characters.md
    this.characters = [
      {
        id: 1,
        name: "Sarah Mitchell",
        personalContext: "Senior Marketing Manager with 8 years experience. Direct communication style, results-oriented.",
        characterDescription: "Experienced professional who values efficiency and clear expectations. Can be impatient with unclear instructions.",
        complexityLevel: 3,
        voiceId: "voice_001",
        voiceName: "Professional Female"
      },
      {
        id: 2,
        name: "David Chen", 
        personalContext: "New graduate, enthusiastic but overwhelmed. First corporate job, eager to learn.",
        characterDescription: "Recent graduate who asks many questions and needs detailed guidance. Sometimes misunderstands instructions.",
        complexityLevel: 2,
        voiceId: "voice_002",
        voiceName: "Young Male Professional"
      },
      {
        id: 3,
        name: "Karen Williams",
        personalContext: "Veteran employee, 15 years with company. Resistant to change, skeptical of new processes.",
        characterDescription: "Experienced but set in her ways. Challenges new ideas and needs strong justification for changes.",
        complexityLevel: 7,
        voiceId: "voice_003",
        voiceName: "Mature Female Authority"
      }
    ];

    return this.characters;
  }

  /**
   * Get a specific character by ID
   */
  async getCharacter(id: number): Promise<Character | null> {
    const characters = await this.getAllCharacters();
    return characters.find(char => char.id === id) || null;
  }

  /**
   * Get characters suitable for a specific scenario difficulty
   */
  async getCharactersForDifficulty(difficultyLevel: number): Promise<Character[]> {
    const characters = await this.getAllCharacters();
    
    // Return characters with complexity levels that match or are close to scenario difficulty
    return characters.filter(char => {
      const diff = Math.abs(char.complexityLevel - difficultyLevel);
      return diff <= 2; // Allow characters within 2 levels of scenario difficulty
    });
  }

  /**
   * Get default character for a scenario based on difficulty
   */
  async getDefaultCharacterForScenario(difficultyLevel: number): Promise<Character | null> {
    const suitableCharacters = await this.getCharactersForDifficulty(difficultyLevel);
    
    if (suitableCharacters.length === 0) {
      const allCharacters = await this.getAllCharacters();
      return allCharacters[0] || null; // Fallback to first character
    }

    // Return character with complexity level closest to scenario difficulty
    return suitableCharacters.reduce((closest, current) => {
      const closestDiff = Math.abs(closest.complexityLevel - difficultyLevel);
      const currentDiff = Math.abs(current.complexityLevel - difficultyLevel);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  /**
   * Update character assignment for a scenario
   * TODO: In production, this will update the Scenarios.md file
   */
  async assignCharacterToScenario(scenarioId: number, characterId: number): Promise<void> {
    // This would update the file-based storage in production
    console.log(`Assigning character ${characterId} to scenario ${scenarioId}`);
  }
}

// Export singleton instance
export const characterService = new CharacterService();