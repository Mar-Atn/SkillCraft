// ElevenLabs API Service - Fetch conversational agents with voice metadata
// Provides agent list for character assignment in admin interface

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  description?: string;
}

interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  description?: string;
  voice_id: string;
  voice_name?: string;
  voice_gender?: 'male' | 'female' | 'unknown';
  created_at?: string;
}

class ElevenLabsService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ ElevenLabs API key not found in environment variables');
    }
  }

  private getHeaders() {
    return {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch all conversational agents from ElevenLabs
   * Uses the correct /convai/agents endpoint - PROVEN working pattern from TESTS
   */
  async fetchAgents(): Promise<ElevenLabsAgent[]> {
    if (!this.apiKey) {
      console.error('❌ Cannot fetch agents: API key not configured');
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      console.log('🔄 Fetching ElevenLabs agents using proven pattern...');
      
      // Using exact pattern from successful TESTS/AGENTSWITCH implementation
      const response = await fetch(`${this.baseUrl}/convai/agents`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          // Note: Don't set Content-Type for GET requests
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Raw agents response:', data);

      // From successful tests: response structure is { agents: [...] }
      const agents = data.agents || [];
      
      if (!Array.isArray(agents)) {
        console.error('❌ Unexpected agents response format:', data);
        throw new Error('Invalid agents response format');
      }

      console.log(`✅ Fetched ${agents.length} ElevenLabs agents`);

      // Transform agents to ensure consistent structure with voice metadata
      const transformedAgents = await Promise.all(
        agents.map(async (agent: any) => await this.transformAgent(agent))
      );

      return transformedAgents;

    } catch (error: any) {
      console.error('❌ Failed to fetch ElevenLabs agents:', error);
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
  }

  /**
   * Transform raw agent data to consistent structure
   * Enriches with voice information when possible
   */
  private async transformAgent(rawAgent: any): Promise<ElevenLabsAgent> {
    const agent: ElevenLabsAgent = {
      agent_id: rawAgent.agent_id || rawAgent.id || rawAgent.agentId,
      name: rawAgent.name || 'Unnamed Agent',
      description: rawAgent.description,
      voice_id: rawAgent.voice_id || rawAgent.voiceId || rawAgent.voice?.voice_id,
      voice_name: rawAgent.voice_name || rawAgent.voiceName || rawAgent.voice?.name,
      voice_gender: this.inferVoiceGender(rawAgent),
      created_at: rawAgent.created_at || rawAgent.createdAt
    };

    // If we have voice_id but no voice metadata, try to fetch it
    if (agent.voice_id && !agent.voice_name) {
      try {
        const voiceInfo = await this.fetchVoiceInfo(agent.voice_id);
        if (voiceInfo) {
          agent.voice_name = voiceInfo.name;
          agent.voice_gender = voiceInfo.gender;
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch voice info for ${agent.voice_id}:`, error);
      }
    }

    return agent;
  }

  /**
   * Infer voice gender from available data
   */
  private inferVoiceGender(rawAgent: any): 'male' | 'female' | 'unknown' {
    // Check direct gender field
    const directGender = rawAgent.voice_gender || rawAgent.voice?.gender || rawAgent.gender;
    if (directGender) {
      return directGender.toLowerCase() === 'male' || directGender.toLowerCase() === 'female' 
        ? directGender.toLowerCase() as 'male' | 'female' 
        : 'unknown';
    }

    // Infer from voice name patterns (common ElevenLabs voice names)
    const voiceName = rawAgent.voice_name || rawAgent.voice?.name || '';
    const nameLower = voiceName.toLowerCase();
    
    // Common male voice indicators
    if (nameLower.includes('male') || nameLower.includes('man') || nameLower.includes('masculine')) {
      return 'male';
    }
    
    // Common female voice indicators
    if (nameLower.includes('female') || nameLower.includes('woman') || nameLower.includes('feminine')) {
      return 'female';
    }

    // Common male voice names in ElevenLabs
    const maleNames = ['adam', 'arnold', 'bill', 'charlie', 'daniel', 'ethan', 'george', 'josh', 'marcus', 'sam'];
    const femaleNames = ['alice', 'bella', 'domi', 'elli', 'emily', 'grace', 'jessica', 'lily', 'nicole', 'sarah'];
    
    for (const maleName of maleNames) {
      if (nameLower.includes(maleName)) return 'male';
    }
    
    for (const femaleName of femaleNames) {
      if (nameLower.includes(femaleName)) return 'female';
    }

    return 'unknown';
  }

  /**
   * Fetch specific voice information
   * Fallback for when agent doesn't include voice metadata
   */
  private async fetchVoiceInfo(voiceId: string): Promise<ElevenLabsVoice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const voice = await response.json();
      return {
        voice_id: voice.voice_id,
        name: voice.name,
        gender: this.inferVoiceGender({ voice_name: voice.name }),
        description: voice.description
      };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch voice ${voiceId}:`, error);
      return null;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing ElevenLabs API connection...');
      
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const isConnected = response.ok;
      console.log(isConnected ? '✅ ElevenLabs API connection successful' : '❌ ElevenLabs API connection failed');
      
      return isConnected;
    } catch (error) {
      console.error('❌ ElevenLabs API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
export type { ElevenLabsAgent, ElevenLabsVoice };