import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { ScenarioContextProps } from '../../types/scenario';
import { transcriptService } from '../../services/transcriptService';
import { feedbackService } from '../../services/feedbackService';
import { ratingService } from '../../services/ratingService';

interface Message {
  speaker: string;
  text: string;
  id: number;
}

const VoiceConversation: React.FC<ScenarioContextProps> = ({ scenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to start conversation');
  const [statusType, setStatusType] = useState('');
  const [elevenLabsConversationId, setElevenLabsConversationId] = useState<string | null>(null);;

  // Scenario context is now available for future AI agent configuration
  // Currently maintaining SACRED voice functionality unchanged per constitutional constraints
  console.log('VoiceConversation initialized with scenario:', scenario?.title || 'No scenario selected');

  const updateStatus = (newStatus: string, type: string = '') => {
    setStatus(newStatus);
    setStatusType(type);
  };

  const addMessage = (speaker: string, text: string) => {
    setMessages(prev => [...prev, { speaker, text, id: Date.now() }]);
  };

  const handleMessage = useCallback((message: any) => {
    console.log('Received message:', message);
    
    // Capture conversation ID from any message (NM pattern)
    if (!elevenLabsConversationId) {
      const possibleId = message.conversation_id || 
                        message.conversationId || 
                        message.id ||
                        message.session_id ||
                        message.sessionId;
      
      if (possibleId) {
        console.log('🎯 ElevenLabs Conversation ID captured from message:', possibleId);
        setElevenLabsConversationId(possibleId);
      }
    }
    
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('Conversation started:', message);
        // Try to capture ID from initiation metadata
        if (message.conversation_id && !elevenLabsConversationId) {
          console.log('🎯 Captured ID from initiation:', message.conversation_id);
          setElevenLabsConversationId(message.conversation_id);
        }
        addMessage('System', 'Conversation started - you can begin speaking');
        updateStatus('Connected - Start speaking!', 'listening');
        break;
        
      case 'user_transcript':
        if (message.user_transcript?.trim()) {
          addMessage('You', message.user_transcript);
        }
        break;
        
      case 'agent_response':
        if (message.agent_response?.trim()) {
          addMessage('Alex', message.agent_response);
        }
        break;
        
      case 'audio_event':
        updateStatus('AI is speaking...', 'speaking');
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // Create agent overrides with scenario-specific AI instructions
  const agentOverrides = scenario ? {
    agent: {
      prompt: {
        prompt: scenario.aiInstructions
      },
      firstMessage: `Hi! How's it going?`
    }
  } : undefined;

  // Get API key from environment
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  
  const conversation = useConversation({
    apiKey: apiKey,
    overrides: agentOverrides,
    onConnect: () => {
      console.log('Connected to ElevenLabs with scenario context:', scenario?.title || 'No scenario');
      updateStatus('Connected - requesting microphone...', 'connected');
    },
    onMessage: handleMessage,
    onAudio: (audioBuffer: any) => {
      console.log('Received audio buffer:', audioBuffer);
      updateStatus('AI is speaking...', 'speaking');
      // The SDK will handle audio playback automatically
      setTimeout(() => {
        updateStatus('Listening...', 'listening');
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Conversation error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      setIsActive(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      updateStatus('Disconnected', '');
      setIsActive(false);
    }
  });

  const start = async () => {
    try {
      updateStatus('Connecting to ElevenLabs...', 'connecting');
      setIsActive(true);
      
      // Using working agent ID from NM project temporarily
      // TODO: Replace with SkillCraft-specific agent ID after creating agent via dashboard
      const sessionResult = await conversation.startSession({
        agentId: 'agent_7601k1g0796kfj2bzkcds0bkmw2m', // Working agent ID - configured for expectation-setting
        connectionType: 'websocket'
      });
      
      // Try to capture conversation ID from session result (NM pattern)
      if (sessionResult) {
        const result = sessionResult as any;
        const conversationId = result.conversationId || 
                              result.conversation_id ||
                              result.id ||
                              result.sessionId ||
                              result.session_id ||
                              (typeof result === 'string' ? result : null);
        
        if (conversationId && typeof conversationId === 'string') {
          console.log('🎯 ElevenLabs Conversation ID captured from session:', conversationId);
          setElevenLabsConversationId(conversationId);
        }
      }
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      updateStatus(`Failed to start: ${error.message}`, 'error');
      setIsActive(false);
    }
  };

  const stop = async () => {
    try {
      await conversation.endSession();
      updateStatus('Conversation stopped', '');
      setIsActive(false);
      
      // Fetch transcript after conversation ends (NM pattern)
      if (elevenLabsConversationId) {
        console.log('📝 Fetching transcript for conversation:', elevenLabsConversationId);
        updateStatus('Fetching transcript...', 'processing');
        
        try {
          const transcriptData = await transcriptService.pollTranscriptUntilReady(elevenLabsConversationId);
          console.log('✅ TRANSCRIPT FETCHED SUCCESSFULLY!');
          console.log('Messages:', transcriptData.transcript.length);
          console.log('Full transcript:', transcriptService.formatTranscript(transcriptData));
          
          updateStatus('Generating AI feedback...', 'processing');
          
          // Add transcript summary to messages
          addMessage('System', `Transcript fetched: ${transcriptData.transcript.length} messages`);
          
          // SPRINT 2: Generate Gemini feedback
          try {
            console.log('🤖 Generating Gemini feedback...');
            const feedback = await feedbackService.generateFeedback(transcriptData.transcript);
            
            console.log('🎉 GEMINI FEEDBACK WITH SCORES GENERATED SUCCESSFULLY!');
            
            // SPRINT 3: Display scores
            if (feedback.scores) {
              console.log('🎯 CONVERSATION SCORES:');
              console.log('Overall Score:', feedback.scores.overall_score + '/100');
              console.log('SUB-SKILL SCORES:');
              console.log('  • Clarity & Specificity:', feedback.scores.sub_skills.clarity_and_specificity + '/100');
              console.log('  • Mutual Understanding:', feedback.scores.sub_skills.mutual_understanding + '/100');
              console.log('  • Proactive Problem Solving:', feedback.scores.sub_skills.proactive_problem_solving + '/100');
              console.log('  • Appropriate Customization:', feedback.scores.sub_skills.appropriate_customization + '/100');
              console.log('  • Documentation & Verification:', feedback.scores.sub_skills.documentation_and_verification + '/100');
            } else {
              console.warn('⚠️ No scores found in feedback response');
            }

            // Rating changes handled above in SPRINT 4 section
            
            console.log('Strengths:', feedback.strengths);
            console.log('Areas for improvement:', feedback.areasForImprovement);
            console.log('Recommendations:', feedback.recommendations);
            console.log('Overall assessment:', feedback.overallAssessment);
            console.log('Full feedback:', feedback.rawResponse);
            
            // SPRINT 4: Update ratings based on conversation performance
            if (feedback.scores) {
              console.log('📈 UPDATING USER RATINGS...');
              const updatedRatings = ratingService.updateRatings(feedback.scores);
              
              console.log('🎖️ SKILL LEVEL:', ratingService.getSkillLevel(updatedRatings.overall));
              console.log('📊 Total Conversations:', updatedRatings.conversationsCount);
              
              addMessage('System', `Rating updated! Overall: ${updatedRatings.overall} (${ratingService.getSkillLevel(updatedRatings.overall)})`);
            } else {
              console.warn('⚠️ Cannot update ratings - no scores available');
            }
            
            updateStatus('AI feedback and rating update complete!', 'success');
            
            // Add feedback summary to messages
            addMessage('AI Coach', `Feedback generated with ${feedback.recommendations.length} recommendations`);
            
          } catch (feedbackError: any) {
            console.error('❌ Failed to generate feedback:', feedbackError);
            updateStatus('Feedback generation failed', 'error');
          }
          
        } catch (error: any) {
          console.error('❌ Failed to fetch transcript:', error);
          updateStatus('Transcript fetch failed', 'error');
        }
      } else {
        console.warn('⚠️ No conversation ID available for transcript fetch');
      }
      
    } catch (error: any) {
      console.error('Failed to stop conversation:', error);
      updateStatus(`Failed to stop: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Voice Conversation</h2>
        <div className={`p-3 rounded-lg font-medium ${
          statusType === 'connected' ? 'bg-green-50 text-green-700 border border-green-200' :
          statusType === 'listening' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          statusType === 'speaking' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          statusType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {status}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        {!isActive ? (
          <button 
            onClick={start}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Conversation
          </button>
        ) : (
          <button 
            onClick={stop}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            End Conversation
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map(({ speaker, text, id }) => (
          <div key={id} className={`p-3 rounded-lg ${
            speaker === 'You' 
              ? 'bg-blue-50 ml-8 border-l-4 border-blue-400' 
              : speaker === 'System'
              ? 'bg-green-50 border-l-4 border-green-400'
              : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
          }`}>
            <div className="font-medium text-sm text-gray-600 mb-1">{speaker}</div>
            <div>{text}</div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start a conversation to begin practicing!
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceConversation;