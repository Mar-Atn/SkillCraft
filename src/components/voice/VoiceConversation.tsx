import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { ScenarioContextProps } from '../../types/scenario';
import { transcriptService } from '../../services/transcriptService';
import { feedbackService } from '../../services/feedbackService';
// Removed old ratingService - now using userDataService for progress tracking
import { userDataService } from '../../services/userDataService';
import { characterService, type Character } from '../../services/characterService';
import { useAuth } from '../../context/AuthContext';
import FeedbackDisplay from '../FeedbackDisplay';
import type { Conversation, ConversationFeedback } from '../../types/user-data';

interface Message {
  speaker: string;
  text: string;
  id: number;
}

interface FeedbackData {
  scores: any;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallAssessment: string;
  rawResponse: string;
  newRating?: number;
  previousRating?: number;
  skillLevel?: string;
}

const VoiceConversation: React.FC<ScenarioContextProps> = ({ scenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to start conversation');
  const [statusType, setStatusType] = useState('');
  const [elevenLabsConversationId, setElevenLabsConversationId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);
  const [assignedCharacter, setAssignedCharacter] = useState<Character | null>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(false);
  
  const { user } = useAuth();

  // Load assigned character when scenario changes (ONCE per scenario)
  useEffect(() => {
    if (!scenario) {
      setAssignedCharacter(null);
      return;
    }

    console.log('🔍 VoiceConversation scenario debug:', {
      scenarioTitle: scenario.title,
      assignedCharacterId: scenario.assignedCharacterId,
      hasAssignedCharacter: !!scenario.assignedCharacterId
    });
    
    if (scenario.assignedCharacterId) {
      console.log('✅ Found assignedCharacterId, loading character:', scenario.assignedCharacterId);
      loadAssignedCharacter(scenario.assignedCharacterId);
    } else {
      console.log('⚠️ No assignedCharacterId found in scenario');
      setAssignedCharacter(null);
    }
  }, [scenario?.id, scenario?.assignedCharacterId]); // Only when scenario ID or character assignment changes
  
  // Separate debug logging (doesn't affect character loading)
  useEffect(() => {
    if (assignedCharacter) {
      console.log('VoiceConversation state updated:', {
        scenario: scenario?.title || 'No scenario',
        assignedCharacter: assignedCharacter.name,
        hasElevenLabsAgent: !!assignedCharacter.elevenLabsAgentId,
        agentId: assignedCharacter.elevenLabsAgentId
      });
    }
  }, [assignedCharacter?.id]); // Only when character actually changes
  
  const loadAssignedCharacter = async (characterId: number) => {
    setLoadingCharacter(true);
    try {
      console.log('🎭 Loading assigned character:', characterId);
      const character = await characterService.getCharacter(characterId);
      setAssignedCharacter(character);
      
      if (character?.elevenLabsAgentId) {
        console.log('✅ Character has ElevenLabs agent:', {
          character: character.name,
          agent: character.elevenLabsAgentName,
          agentId: character.elevenLabsAgentId
        });
      } else {
        console.log('⚠️ Character has no ElevenLabs agent assigned:', character?.name);
      }
    } catch (error) {
      console.error('❌ Failed to load assigned character:', error);
      setAssignedCharacter(null);
    } finally {
      setLoadingCharacter(false);
    }
  };

  // Moved console.log to useEffect to prevent infinite re-renders

  const updateStatus = (newStatus: string, type: string = '') => {
    setStatus(newStatus);
    setStatusType(type);
  };

  const addMessage = (speaker: string, text: string) => {
    setMessages(prev => [...prev, { speaker, text, id: Date.now() + Math.random() }]);
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
          // Use character name if available, otherwise use generic 'AI Assistant'
          const speakerName = assignedCharacter?.name || 'AI Assistant';
          addMessage(speakerName, message.agent_response);
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
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      updateStatus('Connected - Start speaking!', 'connected');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      updateStatus('Disconnected', '');
      setIsActive(false);
    },
    onError: (error: any) => {
      console.error('ElevenLabs error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      setIsActive(false);
    }
  });

  const start = async () => {
    try {
      // Check if character and agent are assigned
      if (!assignedCharacter) {
        updateStatus('No character assigned to this scenario', 'error');
        return;
      }
      
      if (!assignedCharacter.elevenLabsAgentId) {
        updateStatus(`Character "${assignedCharacter.name}" has no ElevenLabs agent assigned`, 'error');
        return;
      }
      
      updateStatus('Connecting to ElevenLabs...', 'connecting');
      setIsActive(true);
      
      // Create conversation record
      if (user && scenario) {
        const newConversationId = userDataService.generateId();
        const startTime = new Date();
        
        const conversation: Conversation = {
          id: newConversationId,
          userId: user.id,
          scenarioId: scenario.id.toString(),
          scenarioTitle: scenario.title,
          status: 'in_progress',
          startedAt: startTime
        };
        
        userDataService.saveConversation(conversation);
        setConversationId(newConversationId);
        setConversationStartTime(startTime);
        
        console.log('💾 Conversation record created:', newConversationId);
      }
      
      // Use character's assigned ElevenLabs agent ID if available
      const agentId = assignedCharacter?.elevenLabsAgentId || 'agent_7601k1g0796kfj2bzkcds0bkmw2m';
      
      console.log('🚀 Starting conversation with agent:', {
        agentId,
        characterName: assignedCharacter?.name || 'Default',
        agentName: assignedCharacter?.elevenLabsAgentName || 'NM Fallback Agent'
      });
      
      const sessionResult = await conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc'  // Using webrtc as per TESTS proven pattern
      });
      
      // Try to capture conversation ID from session result (NM pattern)
      if (sessionResult) {
        const result = sessionResult as any;
        console.log('🔍 Full session result object:', result);
        
        const possibleId = result.conversationId || 
                              result.conversation_id ||
                              result.id ||
                              result.sessionId ||
                              result.session_id ||
                              (typeof result === 'string' ? result : null);
        
        if (possibleId && typeof possibleId === 'string') {
          console.log('🎯 ElevenLabs Conversation ID captured from session:', possibleId);
          setElevenLabsConversationId(possibleId);
        } else {
          console.warn('⚠️ Could not find conversation ID in session result');
          console.log('Available keys:', Object.keys(result || {}));
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
      updateStatus('Processing conversation...', 'processing');
      setIsActive(false);
      
      console.log('💬 Conversation completed successfully');
      console.log('Messages captured during conversation:', messages.length);
      
      // Now fetch transcript using the captured conversation ID
      if (elevenLabsConversationId) {
        console.log('📝 Fetching transcript for conversation:', elevenLabsConversationId);
        
        try {
          // Use the transcript service with the properly captured ID
          const conversationData = await transcriptService.pollTranscriptUntilReady(elevenLabsConversationId, 120000);
          
          if (conversationData && conversationData.transcript && conversationData.transcript.length > 0) {
            console.log('✅ Transcript fetched successfully:', conversationData.transcript.length, 'messages');
            
            // Convert transcript to our message format for display
            const transcriptMessages = conversationData.transcript.map((msg: any) => ({
              speaker: msg.role === 'user' ? 'You' : (assignedCharacter?.name || 'AI Assistant'),
              text: msg.message || msg.text || msg.content || '',
              id: Date.now() + Math.random()
            }));
            
            // Update messages with transcript
            setMessages(transcriptMessages);
            addMessage('System', `📄 Transcript loaded: ${conversationData.transcript.length} messages`);
            
            // Generate AI feedback from transcript
            console.log('🤖 Generating AI feedback from transcript...');
            updateStatus('Generating personalized feedback...', 'processing');
            
            const feedback = await feedbackService.generateFeedback(conversationData.transcript);
            
            if (feedback.scores) {
              console.log('🎯 FEEDBACK GENERATED WITH SCORES!');
              console.log('Overall Score:', feedback.scores.overall_score);
              console.log('Sub-skills:', feedback.scores.sub_skills);
              
              // Display feedback
              addMessage('System', '--- PERSONALIZED FEEDBACK ---');
              addMessage('System', `🎯 Overall Score: ${feedback.scores.overall_score}/100`);
              
              if (feedback.strengths.length > 0) {
                addMessage('System', '✅ Strengths: ' + feedback.strengths.join(', '));
              }
              if (feedback.areasForImprovement.length > 0) {
                addMessage('System', '📈 Areas for improvement: ' + feedback.areasForImprovement.join(', '));
              }
              if (feedback.recommendations.length > 0) {
                addMessage('System', '💡 Recommendations: ' + feedback.recommendations.join(', '));
              }
              
              updateStatus('Feedback complete!', 'success');
            } else {
              console.warn('⚠️ No scores in feedback');
              addMessage('System', 'Feedback generated but no scores available');
              updateStatus('Conversation complete', 'success');
            }
            
          } else {
            console.log('📄 Empty transcript received');
            addMessage('System', 'Conversation completed but transcript is empty');
            updateStatus('Conversation complete', 'success');
          }
          
        } catch (transcriptError: any) {
          console.error('❌ Transcript fetching failed:', transcriptError);
          addMessage('System', 'Conversation completed but transcript unavailable');
          updateStatus('Conversation complete (no transcript)', 'success');
        }
      } else {
        console.warn('⚠️ No conversation ID available for transcript');
        addMessage('System', 'Conversation completed but no ID for transcript');
        updateStatus('Conversation complete', 'success');
      }
      
    } catch (error: any) {
      console.error('Error stopping conversation:', error);
      updateStatus('Error stopping conversation', 'error');
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

      {/* Character & Agent Info Display */}
      {assignedCharacter ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {assignedCharacter.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Speaking with: {assignedCharacter.name}</h3>
              <p className="text-blue-700 text-sm">{assignedCharacter.personalContext}</p>
            </div>
          </div>
          {assignedCharacter.elevenLabsAgentId && (
            <div className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded mt-2">
              ElevenLabs Agent: {assignedCharacter.elevenLabsAgentName || 'Unknown'} ({assignedCharacter.elevenLabsAgentId})
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <p className="text-yellow-800 font-medium">No character assigned to this scenario</p>
          <p className="text-yellow-700 text-sm">Using default voice agent</p>
        </div>
      )}

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
      
      {/* Feedback Display Modal */}
      {showFeedback && feedbackData && (
        <FeedbackDisplay 
          feedback={feedbackData} 
          onClose={() => {
            setShowFeedback(false);
            setFeedbackData(null);
          }} 
        />
      )}
    </div>
  );
};

export default VoiceConversation;