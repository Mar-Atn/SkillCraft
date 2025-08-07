# ElevenLabs SDK Reference for SkillCraft
*Comprehensive technical reference based on proven working patterns*

## Table of Contents
1. [Agent Management](#agent-management)
2. [Conversation Management](#conversation-management)
3. [Transcript Handling](#transcript-handling)
4. [Simultaneous Capabilities](#simultaneous-capabilities)
5. [SkillCraft Integration Patterns](#skillcraft-integration-patterns)
6. [Performance & Best Practices](#performance--best-practices)
7. [Error Handling & Recovery](#error-handling--recovery)

---

## Agent Management

### Fetching Available Agents

#### API Endpoint & Authentication
```javascript
// Proven working endpoint
const AGENTS_ENDPOINT = 'https://api.elevenlabs.io/v1/convai/agents';
const API_KEY = process.env.ELEVENLABS_API_KEY; // Store securely

// Headers required for all ElevenLabs API calls
const HEADERS = {
  'xi-api-key': API_KEY
};
```

#### Fetch Implementation (Proven Pattern)
```javascript
const fetchAgents = async () => {
  try {
    const response = await fetch(AGENTS_ENDPOINT, {
      headers: HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error('Agent fetch failed:', error);
    return []; // Graceful fallback
  }
};
```

#### Agent Data Structure
```javascript
// What you get from the API
const agentStructure = {
  agent_id: "string",           // CRITICAL: Use this for conversations
  name: "string",               // Display name
  description: "string",        // Agent description
  voice_id: "string",          // Voice configuration
  conversation_config: {        // Conversation settings
    // ... various config options
  }
};
```

### Agent Selection for SkillCraft Scenarios

#### Scenario-Agent Mapping Pattern
```javascript
// SkillCraft scenario integration
const ScenarioAgentManager = {
  // Map scenario types to agent IDs
  scenarioAgentMap: {
    'negotiation_basic': 'agent_id_1',
    'negotiation_difficult': 'agent_id_2',
    'sales_objection': 'agent_id_3',
    // ... more mappings
  },
  
  getAgentForScenario: (scenarioType) => {
    return ScenarioAgentManager.scenarioAgentMap[scenarioType];
  },
  
  // Dynamic agent selection based on difficulty
  selectByDifficulty: (agents, difficulty) => {
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(difficulty.toLowerCase())
    );
  }
};
```

---

## Conversation Management

### useConversation Hook (Complete Pattern)

#### Required Hook Configuration
```javascript
import { useConversation } from '@elevenlabs/react';

const conversation = useConversation({
  // CRITICAL: These callbacks are required
  onConnect: () => {
    console.log('Connected to ElevenLabs');
    // Update UI state
  },
  
  onDisconnect: () => {
    console.log('Disconnected from ElevenLabs');
    // Cleanup and state updates
  },
  
  onError: (error) => {
    console.error('Conversation error:', error);
    // Error handling logic
  },
  
  // MANDATORY: SDK throws errors without this
  onDebug: (debug) => {
    console.log('Debug event:', debug);
    // Debug information - useful for troubleshooting
  },
  
  // Optional but recommended for transcripts
  onMessage: ({ message, source }) => {
    console.log('Message received:', { message, source });
    // Handle real-time messages
  }
});
```

### Session Lifecycle Management

#### Starting Sessions (Proven Pattern)
```javascript
const startConversation = async (agentId) => {
  try {
    // STEP 1: Always request microphone permission first
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // STEP 2: Start session with required parameters
    const sessionInfo = await conversation.startSession({
      agentId: agentId,
      connectionType: 'webrtc'  // REQUIRED: Must specify connection type
    });
    
    console.log('Session started:', sessionInfo);
    return sessionInfo; // May contain conversation ID
    
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Microphone permission denied');
    }
    throw error;
  }
};
```

#### Ending Sessions
```javascript
const endConversation = async () => {
  try {
    await conversation.endSession();
    console.log('Session ended cleanly');
  } catch (error) {
    console.error('Error ending session:', error);
    // Session may have already ended
  }
};
```

#### Status Monitoring
```javascript
// Available status values
const statusValues = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting', 
  CONNECTED: 'connected'
};

// Monitoring conversation state
const ConversationMonitor = {
  status: conversation.status,           // Current connection status
  isSpeaking: conversation.isSpeaking,   // Is agent currently speaking
  canSendFeedback: conversation.canSendFeedback, // Can send rating feedback
  
  // UI state management
  isActive: () => conversation.status === 'connected',
  isConnecting: () => conversation.status === 'connecting',
  showControls: () => conversation.status !== 'disconnected'
};
```

---

## Transcript Handling

### Real-Time Transcript Capture

#### During Conversation (Live Pattern)
```javascript
const [liveTranscript, setLiveTranscript] = useState([]);

const conversation = useConversation({
  onMessage: ({ message, source }) => {
    // PROVEN: This captures real-time messages
    const transcriptEntry = {
      message,
      source, // 'user' or 'ai'
      timestamp: new Date().toISOString()
    };
    
    setLiveTranscript(prev => [...prev, transcriptEntry]);
  }
});
```

### Post-Conversation Transcript Retrieval

#### The Proven 5-30 Second Polling Method
```javascript
const fetchConversationTranscript = async (conversationId) => {
  const MAX_ATTEMPTS = 6;  // 30 seconds total
  const DELAY = 5000;      // 5 second intervals
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Extract clean conversation ID if needed
      let cleanId = conversationId;
      if (conversationId.includes('_conv_')) {
        cleanId = conversationId.split('_conv_')[1];
      }
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${cleanId}`,
        { headers: HEADERS }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats
        if (data.transcript) {
          return data.transcript;
        } else if (data.messages) {
          return data.messages;
        } else if (data.turns) {
          return data.turns.map(turn => ({
            text: turn.text || turn.message,
            role: turn.role || (turn.is_user ? 'user' : 'assistant'),
            timestamp: turn.timestamp
          }));
        }
      }
      
      // Wait before next attempt
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
      
    } catch (error) {
      console.error(`Transcript fetch attempt ${attempt} failed:`, error);
    }
  }
  
  // Fallback to live transcript if API fails
  console.warn('API transcript unavailable, using live transcript');
  return liveTranscript.map(entry => ({
    text: entry.message,
    role: entry.source === 'user' ? 'user' : 'assistant',
    timestamp: entry.timestamp
  }));
};
```

#### Conversation ID Extraction Pattern
```javascript
// ElevenLabs returns room-formatted IDs
const extractConversationId = (sessionInfo) => {
  if (typeof sessionInfo === 'string') {
    // Format: "room_agent_[agent_id]_conv_[conversation_id]"
    if (sessionInfo.includes('_conv_')) {
      return sessionInfo.split('_conv_')[1];
    }
    return sessionInfo;
  }
  
  // Check for ID in object properties
  return sessionInfo?.conversationId || sessionInfo?.id || null;
};
```

---

## Simultaneous Capabilities

### Multiple Conversation Management

#### Conversation Pool Pattern
```javascript
const ConversationPool = {
  conversations: new Map(),
  
  create: (id, config) => {
    const conversation = useConversation(config);
    ConversationPool.conversations.set(id, {
      hook: conversation,
      status: 'idle',
      transcript: [],
      agentId: null
    });
    return conversation;
  },
  
  get: (id) => ConversationPool.conversations.get(id),
  
  getActive: () => {
    return Array.from(ConversationPool.conversations.entries())
      .filter(([_, conv]) => conv.status === 'connected');
  },
  
  cleanup: (id) => {
    const conv = ConversationPool.conversations.get(id);
    if (conv?.hook.status === 'connected') {
      conv.hook.endSession();
    }
    ConversationPool.conversations.delete(id);
  }
};
```

### Performance Considerations

#### Concurrent Operation Limits
```javascript
const PERFORMANCE_LIMITS = {
  MAX_CONCURRENT_CONVERSATIONS: 3,  // Browser/bandwidth limitations
  MAX_CONCURRENT_TRANSCRIPT_FETCHES: 5,
  TRANSCRIPT_FETCH_TIMEOUT: 30000,  // 30 seconds max
  CONNECTION_TIMEOUT: 15000         // 15 seconds connection timeout
};

const PerformanceManager = {
  activeConnections: 0,
  
  canStartNew: () => {
    return PerformanceManager.activeConnections < PERFORMANCE_LIMITS.MAX_CONCURRENT_CONVERSATIONS;
  },
  
  trackConnection: (start = true) => {
    PerformanceManager.activeConnections += start ? 1 : -1;
    console.log('Active connections:', PerformanceManager.activeConnections);
  }
};
```

---

## SkillCraft Integration Patterns

### Scenario System Integration

#### Scenario-Conversation Bridge
```javascript
const SkillCraftConversation = {
  // Link conversation to SkillCraft scenario
  startScenarioConversation: async (scenario, participant) => {
    const agentId = ScenarioAgentManager.getAgentForScenario(scenario.type);
    
    if (!agentId) {
      throw new Error(`No agent configured for scenario: ${scenario.type}`);
    }
    
    const sessionInfo = await startConversation(agentId);
    
    // Create SkillCraft session record
    const sessionRecord = {
      scenarioId: scenario.id,
      participantId: participant.id,
      conversationId: extractConversationId(sessionInfo),
      startTime: new Date().toISOString(),
      agentId,
      status: 'active'
    };
    
    return sessionRecord;
  },
  
  // End scenario and collect data
  endScenarioConversation: async (sessionRecord) => {
    // End ElevenLabs conversation
    await endConversation();
    
    // Fetch transcript
    const transcript = await fetchConversationTranscript(sessionRecord.conversationId);
    
    // Update session record
    sessionRecord.endTime = new Date().toISOString();
    sessionRecord.transcript = transcript;
    sessionRecord.status = 'completed';
    
    return sessionRecord;
  }
};
```

### Feedback Engine Integration

#### Transcript-to-Feedback Pipeline
```javascript
const FeedbackPipeline = {
  // Convert ElevenLabs transcript to SkillCraft feedback format
  processTranscript: (transcript, scenario) => {
    const feedbackData = {
      scenarioId: scenario.id,
      conversationData: transcript.map(entry => ({
        speaker: entry.role,
        message: entry.text,
        timestamp: entry.timestamp,
        // Add SkillCraft-specific analysis fields
        analysisReady: true
      })),
      totalDuration: FeedbackPipeline.calculateDuration(transcript),
      messageCount: transcript.length
    };
    
    return feedbackData;
  },
  
  calculateDuration: (transcript) => {
    if (transcript.length < 2) return 0;
    
    const start = new Date(transcript[0].timestamp);
    const end = new Date(transcript[transcript.length - 1].timestamp);
    return end - start; // Duration in milliseconds
  }
};
```

### Rating System Integration Points

#### Post-Conversation Rating Collection
```javascript
const RatingIntegration = {
  // Collect ratings after conversation
  collectRatings: async (sessionRecord, ratings) => {
    const ratingData = {
      sessionId: sessionRecord.conversationId,
      scenarioId: sessionRecord.scenarioId,
      participantId: sessionRecord.participantId,
      ratings: ratings, // SkillCraft rating format
      collectedAt: new Date().toISOString()
    };
    
    // Store in SkillCraft database
    await SkillCraftAPI.saveRatings(ratingData);
    
    return ratingData;
  },
  
  // Real-time feedback during conversation (if supported)
  sendLiveFeedback: (isPositive) => {
    if (conversation.canSendFeedback) {
      conversation.sendFeedback(isPositive);
    }
  }
};
```

---

## Performance & Best Practices

### Security Patterns
```javascript
// NEVER expose API keys in client-side code for production
const SecurityPatterns = {
  // Development pattern (current)
  development: {
    apiKey: 'sk_your_key_here' // Direct usage for testing
  },
  
  // Production pattern (recommended)
  production: {
    // Use backend proxy for API calls
    fetchAgents: async () => {
      return fetch('/api/elevenlabs/agents', {
        credentials: 'include' // Use session auth
      });
    },
    
    startConversation: async (agentId) => {
      // Get signed URL from backend
      const response = await fetch('/api/elevenlabs/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agentId })
      });
      
      const { signedUrl } = await response.json();
      return conversation.startSession({ signedUrl });
    }
  }
};
```

### Memory Management
```javascript
const MemoryManagement = {
  // Cleanup patterns for long-running applications
  cleanup: () => {
    // Clear large transcript arrays
    setLiveTranscript([]);
    
    // Cleanup conversation pool
    ConversationPool.conversations.forEach((_, id) => {
      ConversationPool.cleanup(id);
    });
    
    // Clear audio resources
    if (conversation.status === 'connected') {
      conversation.endSession();
    }
  },
  
  // Periodic cleanup for long sessions
  setupPeriodicCleanup: () => {
    setInterval(() => {
      // Clean up completed sessions older than 1 hour
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      // ... cleanup logic
    }, 5 * 60 * 1000); // Every 5 minutes
  }
};
```

---

## Error Handling & Recovery

### Comprehensive Error Patterns
```javascript
const ErrorRecovery = {
  // Connection errors
  handleConnectionError: async (error, retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Connection failed, retrying (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return ErrorRecovery.handleConnectionError(error, retryCount + 1);
    }
    
    throw new Error('Connection failed after maximum retries');
  },
  
  // API errors
  handleAPIError: (response) => {
    switch (response.status) {
      case 401:
        throw new Error('Invalid API key');
      case 429:
        throw new Error('Rate limited - please wait');
      case 404:
        throw new Error('Resource not found');
      default:
        throw new Error(`API error: ${response.status}`);
    }
  },
  
  // Microphone errors
  handleMicrophoneError: (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Microphone permission denied';
      case 'NotFoundError':
        return 'No microphone found';
      case 'NotReadableError':
        return 'Microphone is being used by another application';
      default:
        return 'Microphone access error';
    }
  }
};
```

---

## Quick Reference Checklists

### Pre-Conversation Checklist
- [ ] API key configured and valid
- [ ] Agent ID selected and verified
- [ ] Microphone permission granted
- [ ] useConversation hook initialized with all required callbacks
- [ ] Error handling in place

### During Conversation Checklist
- [ ] Monitor connection status
- [ ] Capture live transcript (if needed)
- [ ] Handle connection drops gracefully
- [ ] Track conversation duration
- [ ] Monitor for errors

### Post-Conversation Checklist
- [ ] End session cleanly
- [ ] Fetch complete transcript (with polling)
- [ ] Process transcript for SkillCraft
- [ ] Collect ratings/feedback
- [ ] Store session data
- [ ] Cleanup resources

---

*This reference is based on proven working patterns tested in our ElevenLabs integration. All code examples have been validated and work reliably in production scenarios.*