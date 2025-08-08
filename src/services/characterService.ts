// Character Service - Manages AI characters for scenarios
// Now integrated with dataService for persistent storage

import { dataService } from './dataService';

export interface Character {
  id: number;
  name: string;
  personalContext: string;
  characterDescription: string;
  complexityLevel: number;
  // Legacy fields (deprecated, keeping for compatibility)
  voiceId?: string;
  voiceName?: string;
  // ElevenLabs Integration
  elevenLabsAgentId?: string;     // Actual ElevenLabs agent ID
  elevenLabsAgentName?: string;   // Agent name from ElevenLabs
  elevenLabsVoiceId?: string;     // Voice ID from ElevenLabs
  elevenLabsVoiceName?: string;   // Voice name from ElevenLabs
  elevenLabsVoiceGender?: 'male' | 'female' | 'unknown'; // Voice gender
}

class CharacterService {
  // Remove local caching - use dataService as source of truth

  /**
   * Get all available characters from persistent storage
   */
  async getAllCharacters(): Promise<Character[]> {
    console.log('🔄 CharacterService: Loading characters from dataService');
    const characters = dataService.getCharacters();
    console.log('✅ CharacterService: Loaded', characters.length, 'characters');
    return characters;
  }

  /**
   * Get a specific character by ID
   */
  async getCharacter(id: number): Promise<Character | null> {
    console.log('🔍 CharacterService: Getting character by ID:', id);
    const character = dataService.getCharacter(id);
    console.log(character ? '✅ Character found' : '❌ Character not found');
    return character;
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
   * Save/update a character
   */
  async saveCharacter(character: Character): Promise<Character> {
    console.log('💾 CharacterService: Saving character:', character.name);
    const savedCharacter = dataService.saveCharacter(character);
    console.log('✅ CharacterService: Character saved successfully');
    return savedCharacter;
  }
  
  /**
   * Delete a character
   */
  async deleteCharacter(id: number): Promise<boolean> {
    console.log('🗑️ CharacterService: Deleting character ID:', id);
    const success = dataService.deleteCharacter(id);
    console.log(success ? '✅ Character deleted' : '❌ Delete failed');
    return success;
  }
  
  /**
   * Assign ElevenLabs agent to character
   */
  async assignElevenLabsAgent(
    characterId: number,
    agentId: string,
    agentName: string,
    voiceId: string,
    voiceName: string,
    voiceGender: 'male' | 'female' | 'unknown'
  ): Promise<boolean> {
    console.log('🎯 CharacterService: Assigning ElevenLabs agent to character:', characterId);
    const success = dataService.assignElevenLabsAgent(
      characterId, agentId, agentName, voiceId, voiceName, voiceGender
    );
    console.log(success ? '✅ Agent assigned' : '❌ Assignment failed');
    return success;
  }
  
  /**
   * Update character assignment for a scenario (maintained for compatibility)
   */
  async assignCharacterToScenario(scenarioId: number, characterId: number): Promise<void> {
    console.log(`📝 CharacterService: Assigning character ${characterId} to scenario ${scenarioId}`);
    // This would be handled by scenario service when that's implemented
  }
}

// Export singleton instance
export const characterService = new CharacterService();