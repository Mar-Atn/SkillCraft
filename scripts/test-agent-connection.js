#!/usr/bin/env node

/**
 * Test ElevenLabs Agent Connection
 * 
 * This script tests the connection to an ElevenLabs conversational agent
 * to verify the agent ID is valid and accessible.
 */

const API_KEY = 'sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43';

/**
 * Test agent connection by attempting to get agent details
 */
async function testAgentConnection(agentId) {
  try {
    console.log(`Testing connection to agent: ${agentId}`);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent test failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const agentData = await response.json();
    console.log('✅ Agent connection successful!');
    console.log('Agent details:');
    console.log(`- Name: ${agentData.name || 'Not specified'}`);
    console.log(`- Agent ID: ${agentData.agent_id || agentId}`);
    console.log(`- Created: ${agentData.created_at || 'Unknown'}`);
    
    return true;

  } catch (error) {
    console.error('❌ Agent connection failed:', error.message);
    return false;
  }
}

/**
 * List available agents
 */
async function listAgents() {
  try {
    console.log('Fetching available agents...');
    
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Warning: Could not list agents: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const agents = Array.isArray(data) ? data : (data.agents || []);
    
    console.log(`\nFound ${agents.length} agents:`);
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name || 'Unnamed'} (ID: ${agent.agent_id})`);
    });
    
    return agents;

  } catch (error) {
    console.log('Warning: Could not list agents:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('🎯 SkillCraft Agent Connection Test');
  console.log('===================================\n');

  // Test the working agent ID from NM project
  const workingAgentId = 'agent_7601k1g0796kfj2bzkcds0bkmw2m';
  console.log('Testing working agent from NM project...');
  const workingAgentValid = await testAgentConnection(workingAgentId);
  
  // Test the current (incorrect) conversation ID
  console.log('\nTesting current conversation ID (should fail)...');
  const conversationId = 'conv_6401k1phxhyzfz2va165272pmakz';
  const conversationValid = await testAgentConnection(conversationId);
  
  // List all available agents
  console.log('\n' + '='.repeat(50));
  const agents = await listAgents();
  
  console.log('\n📋 Summary:');
  console.log(`- Working agent (${workingAgentId}): ${workingAgentValid ? 'VALID ✅' : 'INVALID ❌'}`);
  console.log(`- Current conversation ID (${conversationId}): ${conversationValid ? 'VALID ✅' : 'INVALID ❌'}`);
  console.log(`- Total available agents: ${agents.length}`);
  
  console.log('\n🔧 Recommendations:');
  if (workingAgentValid) {
    console.log('✅ Use the working agent ID for immediate testing');
    console.log('✅ VoiceConversation.tsx has been updated with the working agent ID');
  }
  
  if (agents.length > 0) {
    console.log('✅ Consider creating a SkillCraft-specific agent for production');
  } else {
    console.log('⚠️  Consider creating agents through the ElevenLabs dashboard');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Test the updated VoiceConversation component');
  console.log('2. Create a custom agent for SkillCraft (see ELEVENLABS_AGENT_SETUP.md)');
  console.log('3. Update the agent ID once custom agent is created');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testAgentConnection, listAgents };