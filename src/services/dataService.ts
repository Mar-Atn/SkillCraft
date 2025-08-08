// Data Service - Simple persistent storage for characters and scenarios
// Uses localStorage with structured data - easily upgradeable to real database

import type { Character } from './characterService';
import type { Scenario } from '../types/scenario';

interface DataStore {
  characters: Character[];
  scenarios: Scenario[];
  metadata: {
    version: string;
    lastUpdated: string;
    dataSource: 'localStorage' | 'database';
  };
}

class DataService {
  private readonly STORAGE_KEY = 'skillcraft_data';
  private readonly VERSION = '1.0.0';

  /**
   * Initialize data store with default data if empty
   */
  private initializeData(): DataStore {
    console.log('🚀 Initializing fresh data store...');
    
    const defaultData: DataStore = {
      characters: [
        {
          id: 1,
          name: "Sarah Mitchell",
          personalContext: "Senior Marketing Manager with 8 years experience. Direct communication style, results-oriented.",
          characterDescription: "Experienced professional who values efficiency and clear expectations. Can be impatient with unclear instructions.",
          complexityLevel: 3,
          // ElevenLabs Integration - will be assigned via admin interface
          elevenLabsAgentId: undefined,
          elevenLabsAgentName: undefined,
          elevenLabsVoiceId: undefined,
          elevenLabsVoiceName: undefined,
          elevenLabsVoiceGender: undefined
        },
        {
          id: 2,
          name: "David Chen",
          personalContext: "New graduate, enthusiastic but overwhelmed. First corporate job, eager to learn.",
          characterDescription: "Recent graduate who asks many questions and needs detailed guidance. Sometimes misunderstands instructions.",
          complexityLevel: 2,
          // ElevenLabs Integration - will be assigned via admin interface
          elevenLabsAgentId: undefined,
          elevenLabsAgentName: undefined,
          elevenLabsVoiceId: undefined,
          elevenLabsVoiceName: undefined,
          elevenLabsVoiceGender: undefined
        },
        {
          id: 3,
          name: "Karen Williams",
          personalContext: "Veteran employee, 15 years with company. Resistant to change, skeptical of new processes.",
          characterDescription: "Experienced but set in her ways. Challenges new ideas and needs strong justification for changes.",
          complexityLevel: 7,
          // ElevenLabs Integration - will be assigned via admin interface
          elevenLabsAgentId: undefined,
          elevenLabsAgentName: undefined,
          elevenLabsVoiceId: undefined,
          elevenLabsVoiceName: undefined,
          elevenLabsVoiceGender: undefined
        }
      ],
      scenarios: [], // Will be loaded from Scenarios.md as before
      metadata: {
        version: this.VERSION,
        lastUpdated: new Date().toISOString(),
        dataSource: 'localStorage'
      }
    };

    this.saveData(defaultData);
    console.log('✅ Data store initialized with', defaultData.characters.length, 'characters');
    return defaultData;
  }

  /**
   * Load data from storage
   */
  private loadData(): DataStore {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.initializeData();
      }

      const data: DataStore = JSON.parse(stored);
      
      // Version check and migration if needed
      if (data.metadata?.version !== this.VERSION) {
        return this.migrateData(data);
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to load data store:', error);
      return this.initializeData();
    }
  }

  /**
   * Save data to storage
   */
  private saveData(data: DataStore): void {
    try {
      data.metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data, null, 2));
      console.log('💾 Data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save data:', error);
      throw new Error('Data save failed - storage may be full');
    }
  }

  /**
   * Migrate data between versions
   */
  private migrateData(oldData: any): DataStore {
    console.log('🔄 Migrating data store...');
    
    // Ensure characters have ElevenLabs fields
    const migratedCharacters = (oldData.characters || []).map((char: any) => ({
      ...char,
      elevenLabsAgentId: char.elevenLabsAgentId || undefined,
      elevenLabsAgentName: char.elevenLabsAgentName || undefined,
      elevenLabsVoiceId: char.elevenLabsVoiceId || undefined,
      elevenLabsVoiceName: char.elevenLabsVoiceName || undefined,
      elevenLabsVoiceGender: char.elevenLabsVoiceGender || undefined
    }));

    const migratedData: DataStore = {
      characters: migratedCharacters.length > 0 ? migratedCharacters : this.initializeData().characters,
      scenarios: oldData.scenarios || [],
      metadata: {
        version: this.VERSION,
        lastUpdated: new Date().toISOString(),
        dataSource: oldData.metadata?.dataSource || 'localStorage'
      }
    };

    this.saveData(migratedData);
    return migratedData;
  }

  /**
   * Get all characters
   */
  getCharacters(): Character[] {
    const data = this.loadData();
    return data.characters;
  }

  /**
   * Save character (create or update)
   */
  saveCharacter(character: Character): Character {
    const data = this.loadData();
    const existingIndex = data.characters.findIndex(c => c.id === character.id);
    
    if (existingIndex >= 0) {
      // Update existing character
      data.characters[existingIndex] = { ...character };
      console.log('✅ Updated character:', character.name);
    } else {
      // Create new character
      const newId = Math.max(...data.characters.map(c => c.id), 0) + 1;
      const newCharacter = { ...character, id: newId };
      data.characters.push(newCharacter);
      console.log('✅ Created character:', newCharacter.name);
      character = newCharacter;
    }

    this.saveData(data);
    return character;
  }

  /**
   * Delete character
   */
  deleteCharacter(characterId: number): boolean {
    const data = this.loadData();
    const initialLength = data.characters.length;
    data.characters = data.characters.filter(c => c.id !== characterId);
    
    if (data.characters.length < initialLength) {
      this.saveData(data);
      console.log('✅ Deleted character ID:', characterId);
      return true;
    }
    
    return false;
  }

  /**
   * Get character by ID
   */
  getCharacter(id: number): Character | null {
    const data = this.loadData();
    return data.characters.find(c => c.id === id) || null;
  }

  /**
   * Update character's ElevenLabs assignment
   */
  assignElevenLabsAgent(
    characterId: number, 
    agentId: string, 
    agentName: string, 
    voiceId: string, 
    voiceName: string, 
    voiceGender: 'male' | 'female' | 'unknown'
  ): boolean {
    const data = this.loadData();
    const character = data.characters.find(c => c.id === characterId);
    
    if (!character) {
      console.error('❌ Character not found:', characterId);
      return false;
    }

    character.elevenLabsAgentId = agentId;
    character.elevenLabsAgentName = agentName;
    character.elevenLabsVoiceId = voiceId;
    character.elevenLabsVoiceName = voiceName;
    character.elevenLabsVoiceGender = voiceGender;

    this.saveData(data);
    console.log('✅ Assigned ElevenLabs agent to character:', {
      character: character.name,
      agent: agentName,
      voice: voiceName
    });
    
    return true;
  }

  /**
   * Get data store statistics
   */
  getStats(): { 
    characters: number; 
    charactersWithAgents: number;
    scenarios: number; 
    lastUpdated: string;
    version: string;
  } {
    const data = this.loadData();
    const charactersWithAgents = data.characters.filter(c => c.elevenLabsAgentId).length;
    
    return {
      characters: data.characters.length,
      charactersWithAgents,
      scenarios: data.scenarios.length,
      lastUpdated: data.metadata.lastUpdated,
      version: data.metadata.version
    };
  }

  /**
   * Export all data (for backup or migration)
   */
  exportData(): DataStore {
    return this.loadData();
  }

  /**
   * Import data (for restore or migration)
   */
  importData(data: DataStore): boolean {
    try {
      this.saveData(data);
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Data import failed:', error);
      return false;
    }
  }

  /**
   * Clear all data (use with caution)
   */
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All data cleared');
  }
}

// Export singleton instance
export const dataService = new DataService();
export type { DataStore };