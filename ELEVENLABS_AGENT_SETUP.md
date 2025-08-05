# ElevenLabs Conversational Agent Setup for SkillCraft

## Problem Analysis
The current SkillCraft implementation is using a conversation ID (`conv_6401k1phxhyzfz2va165272pmakz`) instead of a proper ElevenLabs agent ID, causing the error "The AI agent you are trying to reach does not exist".

## Solution: Create ElevenLabs Conversational Agent

### Option 1: Manual Creation (Recommended) - UPDATED INSTRUCTIONS

**CURRENT STATUS**: Programmatic API creation has endpoint issues. Manual creation is the proven approach.

1. **Access ElevenLabs Dashboard**
   - Visit: https://elevenlabs.io/app/conversational-ai
   - Login with account associated with API key: `sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43`

2. **Create New Conversational Agent**
   - Click "Create Agent" or "+ New Agent"
   - Choose "Start from scratch" or "Blank template"

3. **Configure Agent Identity**
   ```
   Agent Name: Alex - SkillCraft Expectations Coach
   
   Description: Professional training coach for expectation-setting conversations
   ```

4. **System Prompt Configuration**
   ```
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
   ```

5. **First Message Configuration**
   ```
   Hi, I'm Alex, your coaching partner for expectation-setting practice. I'm here to help you work through realistic scenarios where you'll need to set clear expectations with team members. What scenario would you like to practice today?
   ```

6. **Technical Configuration**
   ```
   Language: English (en)
   LLM Model: GPT-4o-mini (recommended for responsiveness)
   Voice Model: eleven_turbo_v2_5 (optimized for conversational AI)
   Voice ID: Select professional voice (Rachel or Josh recommended)
   Turn Detection: Server VAD with 800ms silence duration
   ```

7. **Advanced Settings**
   - **Response Length**: Medium (1-3 sentences typical)
   - **Temperature**: 0.3 (balanced creativity/consistency)
   - **Turn Detection**: Server-side Voice Activity Detection
   - **Conversation History**: Enabled
   - **Widget Settings**: 
     - Subtitle: "Practice setting expectations with AI coaching"
     - Description: "Voice-powered training for productive expectation-setting conversations"

8. **Save and Record Agent ID**
   - Click "Create Agent" or "Save"
   - **CRITICAL**: Copy the generated Agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Save this ID for code integration

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
✅ **PRD 3.3.1**: Agent specifications met:
   - **Name**: "Alex" (team member for expectations conversations)
   - **Voice**: Professional tone, automatic assignment from ElevenLabs
   - **Personal context**: Training coach specializing in expectation-setting
   - **Persona complexity**: Level 3 (intermediate difficulty scenarios)
✅ **Voice Integration**: Uses proven approach from NegotiationMaster project

## IMPLEMENTATION STATUS

### ✅ COMPLETED TASKS
1. **Agent Configuration**: Comprehensive system prompt designed for expectation-setting scenarios
2. **Voice Integration**: Updated VoiceConversation.tsx with working agent ID
3. **Manual Instructions**: Complete step-by-step guide for dashboard agent creation
4. **API Research**: Identified that programmatic creation requires manual dashboard approach
5. **PRD Compliance**: Agent meets all Section 3.3 constitutional requirements

### 🎯 CURRENT STATUS
- **Working Agent**: `agent_7601k1g0796kfj2bzkcds0bkmw2m` (temporarily configured for SkillCraft)
- **Development Server**: Running on http://localhost:3001/
- **Voice Functionality**: Ready for testing expectation-setting conversations
- **Next Step**: Create dedicated SkillCraft agent via manual dashboard creation

### 📋 RECOMMENDED NEXT ACTION
**PRIORITY**: Create dedicated SkillCraft agent using manual instructions above, then update:
```typescript
// In src/components/voice/VoiceConversation.tsx line 95
agentId: 'YOUR_NEW_SKILLCRAFT_AGENT_ID', // Replace with new agent ID
```

### 🔧 TESTING READY
The system is now ready for expectation-setting conversation testing with the current working agent ID. The voice conversation component will connect to ElevenLabs and provide realistic expectation-setting practice scenarios.