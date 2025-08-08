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

  // Load assigned character when scenario changes
  useEffect(() => {
    console.log('🔍 VoiceConversation scenario debug:', {
      scenarioTitle: scenario?.title,
      assignedCharacterId: scenario?.assignedCharacterId,
      assignedCharacterName: scenario?.assignedCharacterName,
      hasAssignedCharacter: !!scenario?.assignedCharacterId,
      fullScenario: scenario
    });
    
    if (scenario?.assignedCharacterId) {
      console.log('✅ Found assignedCharacterId, loading character:', scenario.assignedCharacterId);
      loadAssignedCharacter(scenario.assignedCharacterId);
    } else {
      console.log('⚠️ No assignedCharacterId found in scenario');
      setAssignedCharacter(null);
    }
    
    // Debug info (only when scenario/character changes)
    console.log('VoiceConversation state:', {
      scenario: scenario?.title || 'No scenario selected',
      assignedCharacter: assignedCharacter?.name || 'None',
      hasElevenLabsAgent: !!assignedCharacter?.elevenLabsAgentId
    });
  }, [scenario, assignedCharacter]);
  
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
        const possibleId = result.conversationId || 
                              result.conversation_id ||
                              result.id ||
                              result.sessionId ||
                              result.session_id ||
                              (typeof result === 'string' ? result : null);
        
        if (possibleId && typeof possibleId === 'string') {
          console.log('🎯 ElevenLabs Conversation ID captured from session:', possibleId);
          setElevenLabsConversationId(possibleId);
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
            
            // Get rating information for display (ratings updated automatically in userDataService.saveFeedback)
            let previousRating: number | undefined;
            let newRating: number | undefined;
            let skillLevel: string | undefined;
            
            if (feedback.scores && user) {
              console.log('📈 RATING INFORMATION FOR DISPLAY...');
              
              // Get previous rating from user progress
              const overallProgress = userDataService.getUserProgress(user.id, 'overall');
              previousRating = overallProgress?.currentRating || 0;
              
              // Calculate new rating (will be done by saveFeedback, but we can estimate for display)
              const alpha = 0.25;
              newRating = Math.round((alpha * feedback.scores.overall_score + (1 - alpha) * previousRating) * 100) / 100;
              
              // Get skill level
              if (newRating >= 90) skillLevel = 'Master';
              else if (newRating >= 80) skillLevel = 'Expert';
              else if (newRating >= 70) skillLevel = 'Advanced';
              else if (newRating >= 60) skillLevel = 'Intermediate';
              else if (newRating >= 50) skillLevel = 'Developing';
              else skillLevel = 'Beginner';
              
              console.log('🎖️ SKILL LEVEL:', skillLevel);
              console.log('📊 Previous Rating:', previousRating, '→ New Rating:', newRating);
              
              addMessage('System', `Rating updated! Overall: ${newRating.toFixed(1)} (${skillLevel})`);
            } else {
              console.warn('⚠️ Cannot calculate rating display - no scores or user available');
            }
            
            // SAVE CONVERSATION DATA & FEEDBACK
            if (user && conversationId && scenario && conversationStartTime && feedback.scores) {
              // Update conversation record as completed
              const completedConversation: Conversation = {
                id: conversationId,
                userId: user.id,
                scenarioId: scenario.id.toString(),
                scenarioTitle: scenario.title,
                status: 'completed',
                startedAt: conversationStartTime,
                completedAt: new Date(),
                duration: Math.floor((new Date().getTime() - conversationStartTime.getTime()) / 1000),
                transcriptText: transcriptService.formatTranscript(transcriptData),
                elevenLabsConversationId: elevenLabsConversationId || undefined
              };
              
              userDataService.saveConversation(completedConversation);
              
              // Save feedback record
              const conversationFeedback: ConversationFeedback = {
                id: userDataService.generateId(),
                conversationId: conversationId,
                userId: user.id,
                overall_score: feedback.scores.overall_score,
                clarity_and_specificity: feedback.scores.sub_skills.clarity_and_specificity,
                mutual_understanding: feedback.scores.sub_skills.mutual_understanding,
                proactive_problem_solving: feedback.scores.sub_skills.proactive_problem_solving,
                appropriate_customization: feedback.scores.sub_skills.appropriate_customization,
                documentation_and_verification: feedback.scores.sub_skills.documentation_and_verification,
                feedback_text: feedback.rawResponse,
                ai_model_used: 'gemini-pro',
                created_at: new Date()
              };
              
              userDataService.saveFeedback(conversationFeedback);
              
              // Update scenario performance
              userDataService.updateScenarioPerformance(user.id, scenario.id.toString(), feedback.scores.overall_score);
              
              console.log('💾 CONVERSATION & FEEDBACK SAVED SUCCESSFULLY!');
              console.log('📊 User progress and scenario performance updated');
            } else {
              console.warn('⚠️ Cannot save conversation data - missing required data');
            }

            // Store feedback data for display
            setFeedbackData({
              scores: feedback.scores,
              strengths: feedback.strengths,
              areasForImprovement: feedback.areasForImprovement,
              recommendations: feedback.recommendations,
              overallAssessment: feedback.overallAssessment,
              rawResponse: feedback.rawResponse,
              previousRating,
              newRating,
              skillLevel
            });
            
            // Show feedback display
            setShowFeedback(true);
            
            updateStatus('AI feedback and rating update complete!', 'success');
            
            // Add feedback summary to messages
            addMessage('AI Coach', `Feedback generated with ${feedback.recommendations.length} recommendations`);
            
          } catch (feedbackError: any) {
            console.error('❌ Failed to generate feedback:', feedbackError);
            
            // Check if it's a 503 overloaded error
            if (feedbackError.message.includes('503') || feedbackError.message.includes('overloaded')) {
              updateStatus('Gemini API is temporarily overloaded. Please try again in a few minutes.', 'error');
              addMessage('System', 'AI feedback temporarily unavailable due to high API usage. Your conversation was recorded but no scores generated this time.');
            } else {
              updateStatus('Feedback generation failed', 'error');
              addMessage('System', 'Failed to generate AI feedback. Please try again.');
            }
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