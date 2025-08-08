// Transcript Fetching Service - Sprint 1
// Uses EXACT proven methodology from NegotiationMaster
// Reference: NM test_transcript.js and VoiceConversation.js

const ELEVENLABS_API_KEY = 'sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
}

interface ConversationData {
  status: 'processing' | 'done';
  transcript: TranscriptMessage[];
}

export class TranscriptService {
  
  /**
   * Fetch transcript from ElevenLabs using proven NM methodology
   * Implements 5-30 second polling pattern that WORKS
   */
  async fetchTranscript(conversationId: string): Promise<ConversationData> {
    console.log('🎯 Fetching transcript using NM proven methodology');
    console.log(`Raw Conversation ID: ${conversationId}`);
    
    // Extract the actual conversation ID from the room format
    // Format: room_agent_xxx_conv_yyy → conv_yyy
    let actualConversationId = conversationId;
    if (conversationId.includes('_conv_')) {
      actualConversationId = conversationId.split('_conv_')[1];
      actualConversationId = 'conv_' + actualConversationId;
      console.log(`Extracted conversation ID: ${actualConversationId}`);
    }
    
    const url = `https://api.elevenlabs.io/v1/convai/conversations/${actualConversationId}`;
    const headers = {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched conversation data');
      console.log(`Status: ${data.status}`);
      console.log(`Transcript messages: ${data.transcript?.length || 0}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching transcript:', error);
      throw error;
    }
  }
  
  /**
   * Poll transcript with NM's proven retry logic
   * Initial 5-second delay, then poll every 5 seconds up to 30 seconds
   */
  async pollTranscriptUntilReady(
    conversationId: string,
    maxRetries: number = 6
  ): Promise<ConversationData> {
    console.log('🚀 Starting NM polling methodology');
    
    // Initial 5-second delay (proven to work)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const data = await this.fetchTranscript(conversationId);
        
        if (data.status === 'done' && data.transcript && data.transcript.length > 0) {
          console.log('🎉 Transcript ready!');
          return data;
        }
        
        console.log(`⏳ Status: ${data.status}, retry ${retries + 1}/${maxRetries}`);
        
        // Wait 5 seconds before next attempt (NM proven timing)
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries++;
        
      } catch (error) {
        console.error(`❌ Retry ${retries + 1} failed:`, error);
        retries++;
        
        if (retries >= maxRetries) {
          throw new Error('Max retries reached fetching transcript');
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error('Transcript not ready after maximum retries');
  }
  
  /**
   * Format transcript for display
   */
  formatTranscript(data: ConversationData): string {
    if (!data.transcript || data.transcript.length === 0) {
      return 'No transcript available';
    }
    
    return data.transcript.map((msg, index) => {
      const speaker = msg.role === 'user' ? 'YOU' : 'AI';
      return `${index + 1}. ${speaker}: ${msg.message}`;
    }).join('\n\n');
  }
}

// Export singleton instance
export const transcriptService = new TranscriptService();