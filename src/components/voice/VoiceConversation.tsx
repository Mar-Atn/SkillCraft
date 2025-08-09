import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { ScenarioContextProps } from '../../types/scenario';
import { transcriptService } from '../../services/transcriptService';
import { feedbackService } from '../../services/feedbackService';
import { ratingService } from '../../services/ratingService';
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
    console.log('📥 Received ElevenLabs message:', message);
    
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
    
    // Following NM message handling pattern
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('🎉 ElevenLabs conversation started:', message);
        addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
        updateStatus('Connected - Start speaking!', 'listening');
        break;
        
      // Also handle if it comes in the debug messages
      case 'conversation_initiation_client_data':
        console.log('🎉 ElevenLabs conversation client data received:', message);
        // Check if this contains the actual initiation metadata
        if (message.message && message.message.type === 'conversation_initiation_metadata') {
          console.log('🎉 Found conversation initiation in client data!');
          addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
          updateStatus('Connected - Start speaking!', 'listening');
        }
        break;
        
      case 'user_transcript':
        if (message.user_transcript && message.user_transcript.trim()) {
          console.log('👤 User transcript:', message.user_transcript);
          addMessage('You', message.user_transcript);
          updateStatus('Processing...', 'processing');
        }
        break;
        
      case 'agent_response':
        if (message.agent_response && message.agent_response.trim()) {
          console.log('🤖 AI response:', message.agent_response);
          const speakerName = assignedCharacter?.name || 'AI Assistant';
          addMessage(speakerName, message.agent_response);
          updateStatus('AI is speaking...', 'speaking');
        }
        break;
        
      // Additional message types from NM
      case 'user_speech_complete':
      case 'speech_complete':
        if (message.transcript && message.transcript.trim()) {
          console.log('👤 User speech complete:', message.transcript);
          addMessage('You', message.transcript);
        }
        break;
        
      case 'agent_speech_complete':
      case 'response_complete':
        if (message.text && message.text.trim()) {
          console.log('🤖 Agent speech complete:', message.text);
          const speakerName = assignedCharacter?.name || 'AI Assistant';
          addMessage(speakerName, message.text);
        }
        break;
        
      case 'audio_event':
        console.log('🔊 Audio event received');
        updateStatus('AI is speaking...', 'speaking');
        // Audio handled automatically by SDK
        setTimeout(() => {
          updateStatus('Listening...', 'listening');
        }, 1500); // Give time for audio to play
        break;
        
      default:
        console.log('❓ Unknown message type:', message.type, message);
    }
  }, [assignedCharacter?.name, elevenLabsConversationId]);

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
  
  // Following NM pattern: explicit API key in useConversation with onDebug
  const conversation = useConversation({
    apiKey: apiKey,
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      updateStatus('Connected - Start speaking!', 'connected');
    },
    onMessage: handleMessage,
    onAudio: (audio: any) => {
      console.log('Audio received:', audio);
      // Audio playback is handled automatically by the SDK
    },
    onDebug: (debug: any) => {
      console.log('ElevenLabs debug:', debug);
      // Handle debug messages from SDK
    },
    onError: (error: any) => {
      console.error('ElevenLabs error:', error);
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
      
      // Now that agents accept overrides, use character-specific agent IDs
      const agentId = assignedCharacter?.elevenLabsAgentId || 'agent_7601k1g0796kfj2bzkcds0bkmw2m';
      
      console.log('🎭 Using agent ID:', agentId, 'for character:', assignedCharacter?.name);
      console.log('🚀 Starting conversation with scenario context');
      
      // FOLLOWING NM METHOD: Build comprehensive prompt client-side
      const buildComprehensivePrompt = () => {
        if (!assignedCharacter || !scenario) return null;
        
        // Part 1: Character traits from character data
        const characterTraits = `You are ${assignedCharacter.name}.
${assignedCharacter.personalContext}

CHARACTER DESCRIPTION:
${assignedCharacter.characterDescription}

PERSONALITY AND APPROACH:
${assignedCharacter.personalContext}`;

        // Part 2: Case-specific instructions from scenario
        const caseSpecificInstructions = `
CURRENT SCENARIO CONTEXT:
${scenario.aiInstructions}

SCENARIO TITLE: ${scenario.title}
LEARNING OBJECTIVES: ${scenario.learningObjectives?.join(', ')}
FOCUS POINTS: ${scenario.focusPoints?.join(', ')}`;

        // Part 3: Core behavioral guidelines (like NM)
        const behavioralGuidelines = `
CORE BEHAVIORS:
- Stay completely in character throughout the conversation
- Respond naturally as if in a real business conversation, not a training simulation
- Use the speech patterns and personality traits described above
- Keep responses conversational and appropriate for voice interaction (aim for 1-3 sentences per response)
- Focus on the scenario at hand and respond authentically to what the user says
- Create realistic workplace dynamics appropriate to your character
- Don't break character or mention that you're an AI or in a simulation`;

        return `${characterTraits}\n\n${caseSpecificInstructions}\n\n${behavioralGuidelines}`;
      };

      const comprehensivePrompt = buildComprehensivePrompt();
      
      const sessionConfig = {
        agentId: agentId,
        connectionType: 'webrtc',
        overrides: comprehensivePrompt ? {
          agent: {
            prompt: {
              prompt: comprehensivePrompt
            }
          }
        } : undefined
      };
      
      console.log('Session config:', {
        agentId: sessionConfig.agentId,
        connectionType: sessionConfig.connectionType,
        hasOverrides: !!sessionConfig.overrides,
        promptLength: comprehensivePrompt?.length || 0,
        note: 'Following NM method with comprehensive client-side prompt'
      });
      
      const sessionResult = await conversation.startSession(sessionConfig);
      
      // Set a timeout to show ready message if initiation metadata doesn't come
      setTimeout(() => {
        console.log('🕐 Timeout reached, showing ready message as fallback');
        addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
        updateStatus('Ready - Start speaking!', 'listening');
      }, 3000);
      
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
              
              // RESTORED: Use working synchronous rating service pattern
              let previousRating: number | undefined;
              let newRating: number | undefined;
              let skillLevel: string | undefined;
              
              if (user) {
                console.log('📈 UPDATING USER RATINGS...');
                
                // Get previous rating before update
                const currentRatings = ratingService.getUserRatings();
                previousRating = currentRatings.overall;
                
                // Update ratings using working synchronous method
                const updatedRatings = ratingService.updateRatings(feedback.scores);
                newRating = updatedRatings.overall;
                skillLevel = ratingService.getSkillLevel(updatedRatings.overall);
                
                console.log('🎖️ SKILL LEVEL:', skillLevel);
                console.log('📊 Total Conversations:', updatedRatings.conversationsCount);
              }
              
              // Prepare feedback data with rating info
              const feedbackWithRating: FeedbackData = {
                ...feedback,
                newRating,
                previousRating,
                skillLevel
              };
                
              // Save conversation with feedback
              if (conversationId && user) {
                const conversationFeedback: ConversationFeedback = {
                  id: userDataService.generateId(),
                  conversationId: conversationId,
                  userId: user.id,
                  scenarioId: scenario?.id?.toString() || 'unknown',
                  overall_score: feedback.scores.overall_score,
                  clarity_and_specificity: feedback.scores.sub_skills?.clarity_and_specificity || 0,
                  mutual_understanding: feedback.scores.sub_skills?.mutual_understanding || 0,
                  proactive_problem_solving: feedback.scores.sub_skills?.proactive_problem_solving || 0,
                  appropriate_customization: feedback.scores.sub_skills?.appropriate_customization || 0,
                  documentation_and_verification: feedback.scores.sub_skills?.documentation_and_verification || 0,
                  strengths: feedback.strengths,
                  areasForImprovement: feedback.areasForImprovement,
                  recommendations: feedback.recommendations,
                  rawFeedback: feedback.rawResponse,
                  created_at: new Date()
                };
                  
                userDataService.saveFeedback(conversationFeedback);
                
                // Update conversation status
                const conversations = userDataService.getConversations(user.id);
                const conversation = conversations.find(c => c.id === conversationId);
                if (conversation) {
                  conversation.status = 'completed';
                  conversation.completedAt = new Date();
                  userDataService.saveConversation(conversation);
                }
              }
              
              // Set feedback data and show modal
              setFeedbackData(feedbackWithRating);
              setShowFeedback(true);
              updateStatus('Conversation complete! Review your feedback.', 'success');
            } else {
              console.warn('⚠️ No scores in feedback');
              updateStatus('Conversation complete', 'success');
            }
            
          } else {
            console.log('📄 Empty transcript received');
            updateStatus('Conversation complete (empty transcript)', 'success');
          }
          
        } catch (transcriptError: any) {
          console.error('❌ Transcript fetching failed:', transcriptError);
          
          // FALLBACK: Use local messages if transcript fetch fails but we have messages
          if (messages.length > 1) { // More than just system messages
            console.log('🔄 Fallback: Using local messages for feedback generation');
            
            // Convert local messages to transcript format
            const fallbackTranscript = messages
              .filter(msg => msg.speaker !== 'System')
              .map(msg => ({
                role: msg.speaker === 'You' ? 'user' : 'assistant',
                message: msg.text,
                timestamp: new Date().toISOString()
              }));
              
            if (fallbackTranscript.length > 0) {
              console.log('🤖 Generating feedback from local messages...');
              updateStatus('Generating feedback from conversation...', 'processing');
              
              try {
                const feedback = await feedbackService.generateFeedback(fallbackTranscript);
                
                if (feedback.scores) {
                  console.log('🎯 FEEDBACK GENERATED FROM FALLBACK!');
                  // Same feedback processing as successful transcript...
                  let previousRating: number | undefined;
                  let newRating: number | undefined;
                  let skillLevel: string | undefined;
                  
                  if (user) {
                    const currentRatings = ratingService.getUserRatings();
                    previousRating = currentRatings.overall;
                    const updatedRatings = ratingService.updateRatings(feedback.scores);
                    newRating = updatedRatings.overall;
                    skillLevel = ratingService.getSkillLevel(updatedRatings.overall);
                  }
                  
                  const feedbackWithRating: FeedbackData = {
                    ...feedback,
                    newRating,
                    previousRating,
                    skillLevel
                  };
                  
                  // Save feedback from fallback too
                  if (conversationId && user) {
                    const conversationFeedback: ConversationFeedback = {
                      id: userDataService.generateId(),
                      conversationId: conversationId,
                      userId: user.id,
                      scenarioId: scenario?.id?.toString() || 'unknown',
                      overall_score: feedback.scores.overall_score,
                      clarity_and_specificity: feedback.scores.sub_skills?.clarity_and_specificity || 0,
                      mutual_understanding: feedback.scores.sub_skills?.mutual_understanding || 0,
                      proactive_problem_solving: feedback.scores.sub_skills?.proactive_problem_solving || 0,
                      appropriate_customization: feedback.scores.sub_skills?.appropriate_customization || 0,
                      documentation_and_verification: feedback.scores.sub_skills?.documentation_and_verification || 0,
                      strengths: feedback.strengths,
                      areasForImprovement: feedback.areasForImprovement,
                      recommendations: feedback.recommendations,
                      rawFeedback: feedback.rawResponse,
                      created_at: new Date()
                    };
                      
                    userDataService.saveFeedback(conversationFeedback);
                    
                    // Update conversation status  
                    const conversations = userDataService.getConversations(user.id);
                    const conversation = conversations.find(c => c.id === conversationId);
                    if (conversation) {
                      conversation.status = 'completed';
                      conversation.completedAt = new Date();
                      userDataService.saveConversation(conversation);
                    }
                  }
                  
                  setFeedbackData(feedbackWithRating);
                  setShowFeedback(true);
                  updateStatus('Feedback ready!', 'success');
                  
                } else {
                  updateStatus('Conversation complete (no feedback scores)', 'warning');
                }
              } catch (feedbackError) {
                console.error('❌ Fallback feedback generation failed:', feedbackError);
                updateStatus('Conversation complete (feedback error)', 'warning');
              }
            }
          } else {
            updateStatus('Conversation complete (error loading feedback)', 'warning');
          }
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
      {/* Show simplified UI before conversation starts */}
      {!isActive && messages.length === 0 ? (
        <div className="text-center py-12">
          {loadingCharacter ? (
            <div className="text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading character information...</p>
            </div>
          ) : assignedCharacter ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                You will be talking to: {assignedCharacter.name}
              </h2>
              <button 
                onClick={start}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Start Conversation!
              </button>
              <p className="text-gray-600 mt-8">
                Press start conversation when you are ready!
              </p>
            </>
          ) : (
            <div className="text-yellow-700">
              <p>No character assigned to this scenario</p>
            </div>
          )}
        </div>
      ) : (
        /* Show full conversation UI once started */
        <>
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

          {/* Show character name when conversation is active */}
          {isActive && assignedCharacter && (
            <div className="mb-4 text-center">
              <p className="text-gray-600">Speaking with: <span className="font-semibold">{assignedCharacter.name}</span></p>
            </div>
          )}

          <div className="flex justify-center mb-6">
            {isActive && (
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
                Conversation is starting...
              </div>
            )}
          </div>
        </>
      )}
      
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