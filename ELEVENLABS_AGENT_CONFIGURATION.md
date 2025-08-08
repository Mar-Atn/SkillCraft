# ElevenLabs Agent Configuration for SkillCraft

## 🔑 CRITICAL DISCOVERY: Agent Override Settings

**Issue**: ElevenLabs agents have a security setting that prevents them from accepting runtime `overrides` by default.

**Solution**: In the ElevenLabs dashboard, each agent must be configured to **"Accept Runtime Overrides"** for dynamic context injection to work.

## Configuration Steps:

1. **Go to ElevenLabs Dashboard** → Conversational AI → Agents
2. **For each agent**, edit settings
3. **Enable "Accept Runtime Overrides"** (security setting)
4. **Save agent configuration**

## How Our Implementation Works:

### Character-Specific Agents
- Each character has their own ElevenLabs agent ID
- Agent contains base personality and voice characteristics
- Agent must be configured to accept overrides

### Runtime Context Injection
```javascript
// We send comprehensive prompts via overrides
overrides: {
  agent: {
    prompt: {
      prompt: comprehensivePrompt  // Character traits + Scenario context
    }
  }
}
```

### Comprehensive Prompt Structure
```javascript
const comprehensivePrompt = `
You are ${character.name}.
${character.personalContext}

CHARACTER DESCRIPTION:
${character.characterDescription}

CURRENT SCENARIO CONTEXT:
${scenario.aiInstructions}

SCENARIO TITLE: ${scenario.title}
LEARNING OBJECTIVES: ${scenario.learningObjectives.join(', ')}

CORE BEHAVIORS:
- Stay completely in character throughout the conversation
- Respond naturally as if in a real business conversation
- Keep responses conversational (1-3 sentences per response)
- Create realistic workplace dynamics
- Don't break character or mention being an AI
`;
```

## Agent Requirements:
- ✅ **Accept Runtime Overrides**: ENABLED
- ✅ **WebRTC Connection**: Supported  
- ✅ **Voice Characteristics**: Configured per character
- ✅ **Base Personality**: Can be overridden with scenario context

## Success Pattern:
1. Character-specific agent ID provides voice and base personality
2. Runtime overrides inject scenario-specific context
3. Agent responds with both character traits AND scenario awareness
4. Full transcript capture and feedback generation works

## Testing Workflow:
1. Select character → Agent ID loaded
2. Select scenario → Context prepared
3. Start conversation → Overrides sent to agent
4. Agent speaks with full context (character + scenario)
5. End conversation → Transcript fetched → Feedback generated

**This breakthrough enables dynamic, context-aware voice conversations!**