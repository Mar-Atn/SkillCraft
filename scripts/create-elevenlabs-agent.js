#!/usr/bin/env node

/**
 * ElevenLabs Conversational Agent Creation Script
 * 
 * This script creates a conversational agent via the ElevenLabs API
 * according to SCSX PRD requirement 3.3 - "Actual AI agent created via Elevenlabs API"
 */

const API_KEY = 'sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/convai/agents/create';

/**
 * Creates an ElevenLabs conversational agent with the specified configuration
 */
async function createAgent() {
  const agentConfig = {
    name: "SkillCraft Expectations Setting Coach",
    conversation_config: {
      agent: {
        prompt: {
          prompt: `You are Alex, a professional training coach specializing in setting expectations conversations. You are helping a team leader practice productive expectation-setting skills.

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

Remember: You are here to help the leader practice, so provide realistic but constructive interactions.`,
          llm: "gemini-2.0-flash",
          temperature: 0.3
        },
        language: "en"
      },
      tts: {
        model_id: "eleven_turbo_v2_5",
        voice_id: "cjVigY5qzO86Huf0OWal" // Default professional voice
      },
      turn_detection: {
        type: "server_vad",
        silence_duration_ms: 800
      }
    },
    platform_settings: {
      widget: {
        subtitle: "Practice setting expectations with AI coaching",
        description: "Voice-powered training for productive expectation-setting conversations"
      }
    },
    tags: ["training", "expectations", "coaching", "skillcraft"]
  };

  try {
    console.log('Creating ElevenLabs conversational agent...');
    console.log('Agent configuration:', JSON.stringify(agentConfig, null, 2));

    const response = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
      },
      body: JSON.stringify(agentConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create agent: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ Agent created successfully!');
    console.log('Agent ID:', result.agent_id);
    console.log('\nUpdate your VoiceConversation.tsx file with this agent ID:');
    console.log(`agentId: '${result.agent_id}'`);
    
    return result.agent_id;

  } catch (error) {
    console.error('❌ Error creating agent:', error.message);
    throw error;
  }
}

/**
 * Lists existing agents to verify creation
 */
async function listAgents() {
  try {
    console.log('\nFetching existing agents...');
    
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Warning: Could not list agents: ${response.status} ${response.statusText}\n${errorText}`);
      return;
    }

    const agents = await response.json();
    console.log('\nExisting agents:');
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (ID: ${agent.agent_id})`);
    });

  } catch (error) {
    console.log('Warning: Could not list agents:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🎯 SkillCraft ElevenLabs Agent Creation');
  console.log('=====================================\n');

  try {
    // List existing agents first
    await listAgents();
    
    // Create new agent
    const agentId = await createAgent();
    
    console.log('\n📋 Next steps:');
    console.log('1. Copy the agent ID above');
    console.log('2. Update src/components/voice/VoiceConversation.tsx');
    console.log('3. Replace the current agentId with the new one');
    console.log('4. Test the voice conversation functionality');
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAgent, listAgents };