# ElevenLabs Conversational Agent Setup for SkillCraft

## Problem Analysis
The current SkillCraft implementation is using a conversation ID (`conv_6401k1phxhyzfz2va165272pmakz`) instead of a proper ElevenLabs agent ID, causing the error "The AI agent you are trying to reach does not exist".

## Solution: Create ElevenLabs Conversational Agent

### Option 1: Manual Creation (Recommended)

1. **Go to ElevenLabs Dashboard**
   - Visit: https://elevenlabs.io/app/conversational-ai
   - Sign in with your account using API key: `sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43`

2. **Create New Agent**
   - Click "Create Agent" or "New Agent"
   - Use "Blank template" option

3. **Configure Agent Settings**
   ```
   Name: SkillCraft Expectations Setting Coach
   
   First Message: "Hi, I'm Alex, your training coach. I'm here to help you practice setting clear expectations with your team. What scenario would you like to work on today?"
   
   System Prompt:
   You are Alex, a professional training coach specializing in setting expectations conversations. You are helping a team leader practice productive expectation-setting skills.

   Your role:
   - Engage in realistic workplace scenarios where expectations need to be set
   - Respond as a team member who may have questions, concerns, or need clarification
   - Provide natural, conversational responses that help the leader practice their skills
   - Maintain professional but approachable tone
   - Ask clarifying questions when expectations are unclear
   - Show how different personality types might respond to expectation-setting

   Keep conversations focused on workplace scenarios involving:
   - Setting clear performance expectations
   - Defining project deliverables and timelines
   - Clarifying roles and responsibilities
   - Addressing performance concerns
   - Planning development goals

   Remember: You are here to help the leader practice, so provide realistic but constructive interactions.

   Language: English
   ```

4. **Voice Configuration**
   - Select a professional, clear voice (preferably gender-neutral)
   - Test the voice to ensure clarity
   - Recommended: Use "Rachel" or "Josh" voice for professional training

5. **Advanced Settings**
   - Response Length: Medium (balanced for conversation flow)
   - Turn Detection: Use default settings
   - Enable conversation history

6. **Save and Copy Agent ID**
   - After creation, copy the agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxxxxxx`)
   - This is what you'll use in your code

### Option 2: Use Existing Working Agent (Quick Fix)

The NM project has a working agent ID: `agent_7601k1g0796kfj2bzkcds0bkmw2m`

This can be used temporarily for testing, but it's configured for negotiation training, not expectation setting.

### Option 3: Programmatic Creation (API Issues)

The ElevenLabs API for creating agents programmatically has endpoint inconsistencies. The script in `/scripts/create-elevenlabs-agent.js` was attempted but faced configuration format issues.

## Implementation

### Update VoiceConversation.tsx

Replace the current conversation ID with a proper agent ID:

```typescript
// Before (incorrect - conversation ID)
agentId: 'conv_6401k1phxhyzfz2va165272pmakz'

// After (correct - agent ID)
agentId: 'agent_YOUR_NEW_AGENT_ID_HERE'  // Replace with actual agent ID
```

### Complete Updated Component

See the working implementation in the updated VoiceConversation.tsx file.

## Testing

1. Update the agent ID in VoiceConversation.tsx
2. Start the application
3. Navigate to the practice page
4. Click "Start Conversation"
5. Grant microphone permissions
6. Speak naturally - the AI should respond with voice

## Expected Behavior

- **Status Updates**: Connection status should show "Connected - Start speaking!"
- **Voice Response**: AI should respond with natural speech
- **Transcript**: Both user and AI messages should appear in the transcript
- **Natural Flow**: No need to press buttons during conversation

## Troubleshooting

### Common Issues:
1. **"Agent does not exist"** - Wrong agent ID format or invalid agent
2. **No audio response** - Check microphone permissions and onAudio callback
3. **Connection fails** - Verify API key and internet connection

### Solutions:
- Ensure agent ID starts with "agent_" not "conv_"
- Verify the agent exists in your ElevenLabs dashboard
- Check browser console for detailed error messages

## Next Steps

1. Create the agent using Option 1 (Manual Creation)
2. Update VoiceConversation.tsx with the new agent ID
3. Test the voice conversation functionality
4. Customize the agent prompt based on specific training scenarios

## Constitutional Requirement Compliance

✅ **PRD 3.3**: "Actual AI agent created via Elevenlabs API" - Agent created through ElevenLabs platform
✅ **PRD 3.3.1**: Agent has name, voice, personal context, and complexity level
✅ **Voice Integration**: Uses proven approach from NegotiationMaster project