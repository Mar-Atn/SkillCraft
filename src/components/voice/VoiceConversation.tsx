import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { ScenarioContextProps } from '../../types/scenario';
import { transcriptService } from '../../services/transcriptService';
import { feedbackService } from '../../services/feedbackService';
import { ratingService } from '../../services/ratingService';
import { userDataService } from '../../services/userDataService';
import { characterService, type Character } from '../../services/characterService';
import { useAuth } from '../../context/AuthContext';
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
  const [viewMode, setViewMode] = useState<'conversation' | 'processing' | 'feedback' | 'transcript'>('conversation');
  const [fullTranscript, setFullTranscript] = useState<Array<{role: string, message: string}>>([]);
  
  const { user } = useAuth();

  // Helper function to format markdown-like text to HTML
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    
    // Split by lines to handle headers and bullets
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      // Handle headers
      if (line.startsWith('### ')) {
        return `<h4 class="font-semibold text-lg text-gray-800 mt-4 mb-2">${line.substring(4)}</h4>`;
      }
      if (line.startsWith('## ')) {
        return `<h3 class="font-bold text-xl text-gray-900 mt-4 mb-3">${line.substring(3)}</h3>`;
      }
      if (line.startsWith('# ')) {
        return `<h2 class="font-bold text-2xl text-gray-900 mt-4 mb-3">${line.substring(2)}</h2>`;
      }
      
      // Handle bullet points - but also process the content for bold/italic
      if (line.startsWith('- ') || line.startsWith('* ')) {
        let bulletContent = line.substring(2);
        // Process bold text in bullet content
        bulletContent = bulletContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        // Process italic text in bullet content
        bulletContent = bulletContent.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
        return `<li class="ml-4 text-gray-700">${bulletContent}</li>`;
      }
      
      // Handle bold text FIRST (must be before single asterisk)
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      
      // Handle italic text AFTER bold (single asterisk)
      formattedLine = formattedLine.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
      
      // Return as paragraph if it has content
      if (formattedLine.trim()) {
        return `<p class="text-gray-700 mb-2">${formattedLine}</p>`;
      }
      
      return '';
    });
    
    return formattedLines.join('');
  };

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
        // Don't show system message in simplified UI
        // addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
        updateStatus('Connected - Start speaking!', 'listening');
        break;
        
      // Also handle if it comes in the debug messages
      case 'conversation_initiation_client_data':
        console.log('🎉 ElevenLabs conversation client data received:', message);
        // Check if this contains the actual initiation metadata
        if (message.message && message.message.type === 'conversation_initiation_metadata') {
          console.log('🎉 Found conversation initiation in client data!');
          // Don't show system message in simplified UI
          // addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
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
      
      // Set a timeout to update status if initiation metadata doesn't come
      setTimeout(() => {
        console.log('🕐 Timeout reached, updating status as fallback');
        // Don't show system message in simplified UI
        // addMessage('System', `Connected to ${assignedCharacter?.name || 'AI Character'} - you can begin speaking`);
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
      updateStatus('Fetching transcripts...', 'processing');
      setIsActive(false);
      setViewMode('processing');
      
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
            
            // Store the full transcript for later viewing
            setFullTranscript(conversationData.transcript);
            
            // Convert transcript to our message format for display
            const transcriptMessages = conversationData.transcript.map((msg: any) => ({
              speaker: msg.role === 'user' ? 'You' : (assignedCharacter?.name || 'AI Assistant'),
              text: msg.message || msg.text || msg.content || '',
              id: Date.now() + Math.random()
            }));
            
            // Update messages with transcript (keep for internal use, not displayed in simplified UI)
            setMessages(transcriptMessages);
            // Don't show system message in simplified UI
            // addMessage('System', `📄 Transcript loaded: ${conversationData.transcript.length} messages`);
            
            // Generate AI feedback from transcript
            console.log('🤖 Generating AI feedback from transcript...');
            updateStatus('Generating feedback...', 'processing');
            
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
              
              // Set feedback data and switch to feedback view
              setFeedbackData(feedbackWithRating);
              setViewMode('feedback');
              updateStatus('Feedback ready!', 'success');
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
              
              // Store the fallback transcript for viewing
              setFullTranscript(fallbackTranscript);
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
                  setViewMode('feedback');
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
        // Don't show system message in simplified UI
        // addMessage('System', 'Conversation completed but no ID for transcript');
        updateStatus('Processing conversation...', 'processing');
      }
      
    } catch (error: any) {
      console.error('Error stopping conversation:', error);
      updateStatus('Error stopping conversation', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Show different UI based on current view mode */}
      {viewMode === 'conversation' && !isActive && messages.length === 0 ? (
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
      ) : viewMode === 'conversation' && isActive ? (
        /* Show minimal UI during active conversation */
        <div className="text-center py-12">
          <div className="mb-8">
            <p className={`text-lg font-medium ${
              statusType === 'connected' || statusType === 'listening' ? 'text-green-600' :
              statusType === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {status}
            </p>
          </div>
          <button 
            onClick={stop}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg"
          >
            End Conversation
          </button>
        </div>
      ) : viewMode === 'processing' ? (
        /* Show processing status */
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{status}</p>
        </div>
      ) : viewMode === 'feedback' && feedbackData ? (
        /* Show comprehensive feedback inline */
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">Conversation Feedback</h2>
          
          {/* Rating Progress if available */}
          {feedbackData.previousRating !== undefined && feedbackData.newRating !== undefined && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Your Progress</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Previous Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{feedbackData.previousRating.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg">→</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">New Rating</p>
                  <p className="text-2xl font-bold text-blue-600">{feedbackData.newRating.toFixed(1)}</p>
                </div>
                {feedbackData.skillLevel && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Skill Level</p>
                    <p className="text-lg font-semibold text-purple-600">{feedbackData.skillLevel}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Comprehensive Scores */}
          {feedbackData.scores && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4">Performance Scores</h3>
              
              {/* Overall Score - Prominent Display */}
              <div className="text-center mb-6 p-4 bg-white rounded-lg">
                <p className="text-lg text-gray-600 mb-2">Overall Score</p>
                <p className="text-5xl font-bold text-blue-600">{feedbackData.scores.overall_score}</p>
                <p className="text-lg text-gray-600">/100</p>
              </div>
              
              {/* Sub-skills Scores */}
              {feedbackData.scores.sub_skills && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 mb-2">Detailed Skill Breakdown:</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-700">Clarity and Specificity</span>
                      <span className="font-bold text-blue-600">{feedbackData.scores.sub_skills.clarity_and_specificity}/100</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-700">Mutual Understanding</span>
                      <span className="font-bold text-blue-600">{feedbackData.scores.sub_skills.mutual_understanding}/100</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-700">Proactive Problem Solving</span>
                      <span className="font-bold text-blue-600">{feedbackData.scores.sub_skills.proactive_problem_solving}/100</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-700">Appropriate Customization</span>
                      <span className="font-bold text-blue-600">{feedbackData.scores.sub_skills.appropriate_customization}/100</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-700">Documentation and Verification</span>
                      <span className="font-bold text-blue-600">{feedbackData.scores.sub_skills.documentation_and_verification}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall Assessment */}
          {feedbackData.overallAssessment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
              <p className="text-gray-700">{feedbackData.overallAssessment}</p>
            </div>
          )}

          {/* Full AI-Generated Feedback Text with Markdown Formatting */}
          {feedbackData.rawResponse && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Detailed AI Feedback</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(feedbackData.rawResponse) }}
              />
            </div>
          )}

          {/* Button to show transcript */}
          <div className="text-center pt-4">
            <button
              onClick={() => setViewMode('transcript')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Show Full Transcript
            </button>
          </div>
        </div>
      ) : viewMode === 'transcript' ? (
        /* Show transcript */
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">Conversation Transcript</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fullTranscript.map((msg, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-50 ml-8 border-l-4 border-blue-400' 
                  : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
              }`}>
                <div className="font-medium text-sm text-gray-600 mb-1">
                  {msg.role === 'user' ? 'You' : assignedCharacter?.name || 'AI Assistant'}
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
          </div>

          {/* Button to show feedback */}
          <div className="text-center pt-4">
            <button
              onClick={() => setViewMode('feedback')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Show Feedback
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VoiceConversation;