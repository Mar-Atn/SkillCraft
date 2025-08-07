# ElevenLabs Agent Conversations with React - Complete Guide

## Overview
This guide shows how to fetch ElevenLabs conversational agents and start live voice conversations using their React SDK.

## Prerequisites
- ElevenLabs API key
- React application
- Microphone access

## Step 1: Setup

### Install Dependencies
```bash
npm install @elevenlabs/react @elevenlabs/client
```

### Get Your API Key
1. Sign up at https://elevenlabs.io
2. Go to your profile settings
3. Copy your API key (starts with `sk_`)

## Step 2: Fetch Available Agents

### API Endpoint
```
GET https://api.elevenlabs.io/v1/convai/agents
```

### Headers Required
```javascript
{
  'xi-api-key': 'your-api-key-here'
}
```

### Example Fetch Code
```javascript
const fetchAgents = async () => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': 'your-api-key-here'
      }
    });
    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
};
```

### Agent Object Structure
Each agent has:
```javascript
{
  agent_id: "string",    // Use this for conversations
  name: "string",        // Display name
  // ... other properties
}
```

## Step 3: Setup Conversation Hook

### Import the Hook
```javascript
import { useConversation } from '@elevenlabs/react';
```

### Initialize with Required Callbacks
```javascript
const conversation = useConversation({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onError: (error) => console.error('Error:', error),
  onDebug: (debug) => console.log('Debug:', debug)  // Required!
});
```

### Important Notes
- `onDebug` callback is **required** - the SDK will throw errors without it
- Other callbacks are optional but recommended

## Step 4: Start Conversation

### Request Microphone Permission First
```javascript
await navigator.mediaDevices.getUserMedia({ audio: true });
```

### Start Session with Agent ID
```javascript
await conversation.startSession({
  agentId: selectedAgentId,
  connectionType: 'webrtc'  // Required parameter
});
```

### Check Connection Status
```javascript
conversation.status  // 'disconnected', 'connecting', 'connected'
conversation.isSpeaking  // boolean - is agent currently speaking
```

## Step 5: End Conversation

### Simple End Session
```javascript
await conversation.endSession();
```

## Complete Working Example

```javascript
import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

const API_KEY = 'your-api-key-here';

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onError: (error) => console.error('Error:', error),
    onDebug: (debug) => console.log('Debug:', debug)
  });

  // Fetch agents on component mount
  useEffect(() => {
    fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: { 'xi-api-key': API_KEY }
    })
    .then(res => res.json())
    .then(data => setAgents(data.agents || []))
    .catch(console.error);
  }, []);

  const startConversation = async () => {
    if (!selectedAgent) return;
    
    await navigator.mediaDevices.getUserMedia({ audio: true });
    await conversation.startSession({ 
      agentId: selectedAgent,
      connectionType: 'webrtc'
    });
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  return (
    <div>
      <h1>ElevenLabs Agent Chat</h1>
      
      {conversation.status !== 'connected' ? (
        <div>
          <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
            <option value="">Choose an agent...</option>
            {agents.map(agent => (
              <option key={agent.agent_id} value={agent.agent_id}>
                {agent.name}
              </option>
            ))}
          </select>
          <button onClick={startConversation} disabled={!selectedAgent}>
            Start Conversation
          </button>
        </div>
      ) : (
        <div>
          <h2>Conversation Active</h2>
          <p>Status: {conversation.status}</p>
          <p>Speaking: {conversation.isSpeaking ? 'Yes' : 'No'}</p>
          <button onClick={endConversation}>End Conversation</button>
        </div>
      )}
    </div>
  );
}

export default App;
```

## Key Points to Remember

### Required Elements
1. **API Key**: Store securely, don't expose in client-side code for production
2. **onDebug callback**: Must be provided or SDK throws errors
3. **connectionType**: Must specify 'webrtc' in startSession
4. **Microphone permission**: Request before starting conversation

### Error Prevention
- Always check if agent is selected before starting conversation
- Handle async operations with try-catch blocks
- Provide fallback UI states for different connection statuses

### Best Practices
- Store API key in environment variables for production
- Show loading states while fetching agents
- Provide clear feedback on connection status
- Handle microphone permission denials gracefully

## Troubleshooting

### Common Issues
1. **"onDebug is not a function"**: Add `onDebug: (debug) => console.log('Debug:', debug)` to useConversation
2. **Connection fails**: Ensure `connectionType: 'webrtc'` is specified
3. **No agents**: Check API key and network connectivity
4. **Microphone issues**: Ensure HTTPS (required for microphone access)

### Console Debugging
- Check browser console for connection logs
- Monitor network tab for API call responses
- Verify agent IDs are valid strings

This guide provides everything needed to build a working ElevenLabs agent conversation app with React!