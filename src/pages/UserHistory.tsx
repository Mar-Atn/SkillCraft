// User History Page - Complete conversation history with transcripts, feedback, and scores
// Simple, clean interface for users to review all their past practice sessions

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Star,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userDataService } from '../services/userDataService';
import { scenarioService } from '../services/scenarioService';
import UserHeader from '../components/layout/UserHeader';
import type { Conversation, ConversationFeedback } from '../types/user-data';
import type { Scenario } from '../types/scenario';

interface ConversationHistoryItem {
  conversation: Conversation;
  feedback: ConversationFeedback | null;
  scenario: Scenario | null;
}

export default function UserHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<ConversationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<{[key: string]: 'feedback' | 'transcript'}>({});

  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        // Get all user's conversations
        const conversations = userDataService.getConversations(user.id);
        
        // Get all scenarios for title lookup
        const allScenarios = await scenarioService.getAllScenarios();
        
        // Build complete history items
        const items: ConversationHistoryItem[] = await Promise.all(
          conversations.map(async (conversation) => {
            const feedback = userDataService.getFeedbackByConversationId(conversation.id);
            const scenario = allScenarios.find(s => s.id.toString() === conversation.scenarioId) || null;
            
            return {
              conversation,
              feedback,
              scenario
            };
          })
        );

        // Sort by most recent first
        items.sort((a, b) => 
          new Date(b.conversation.startedAt).getTime() - new Date(a.conversation.startedAt).getTime()
        );

        setHistoryItems(items);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const showFeedback = (conversationId: string) => {
    setExpandedItems(new Set([conversationId]));
    setViewMode({[conversationId]: 'feedback'});
  };

  const showTranscript = (conversationId: string) => {
    setExpandedItems(new Set([conversationId]));
    setViewMode({[conversationId]: 'transcript'});
  };

  const closeExpanded = () => {
    setExpandedItems(new Set());
    setViewMode({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (score: number) => {
    const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${
              star <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };


  // Helper function to format markdown-like text to HTML (reused from VoiceConversation)
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    
    // Remove JSON code blocks from the text
    let cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();
    
    const lines = cleanText.split('\n');
    const formattedLines = lines.map(line => {
      if (line.startsWith('### ')) {
        return `<h4 class="font-semibold text-lg text-gray-800 mt-4 mb-2">${line.substring(4)}</h4>`;
      }
      if (line.startsWith('## ')) {
        return `<h3 class="font-bold text-xl text-gray-900 mt-4 mb-3">${line.substring(3)}</h3>`;
      }
      if (line.startsWith('# ')) {
        return `<h2 class="font-bold text-2xl text-gray-900 mt-4 mb-3">${line.substring(2)}</h2>`;
      }
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        let bulletContent = line.substring(2);
        bulletContent = bulletContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        bulletContent = bulletContent.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
        return `<li class="ml-4 text-gray-700">${bulletContent}</li>`;
      }
      
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      formattedLine = formattedLine.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
      
      if (formattedLine.trim()) {
        return `<p class="text-gray-700 mb-2">${formattedLine}</p>`;
      }
      
      return '';
    });
    
    return formattedLines.join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your conversation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          {/* Page Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Conversation History</h1>
                <p className="text-slate-600">
                  {historyItems.length} session{historyItems.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="p-6">
            {historyItems.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Conversations Found</h3>
                <p className="text-slate-500 mb-6">Start your first practice session to see it here.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Practicing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => {
                  const { conversation, feedback, scenario } = item;
                  const isExpanded = expandedItems.has(conversation.id);
                  const currentViewMode = viewMode[conversation.id];
                  
                  return (
                    <div key={conversation.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="p-4 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            
                            <div>
                              <h3 className="font-bold text-slate-900">
                                {scenario?.title || `Scenario ${conversation.scenarioId}`}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(conversation.startedAt).toLocaleDateString()} at{' '}
                                  {new Date(conversation.startedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {conversation.completedAt && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Duration: {Math.ceil(
                                      (new Date(conversation.completedAt).getTime() - 
                                       new Date(conversation.startedAt).getTime()) / 60000
                                    )} min
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Score Display */}
                            {feedback && (
                              <div className="flex items-center gap-2">
                                <div className={`text-2xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                                  {feedback.overall_score}
                                </div>
                                {renderStars(feedback.overall_score)}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {feedback && (
                                <button
                                  onClick={() => showFeedback(conversation.id)}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    isExpanded && currentViewMode === 'feedback'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                  }`}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View Feedback
                                </button>
                              )}
                              
                              {conversation.transcript && conversation.transcript.length > 0 && (
                                <button
                                  onClick={() => showTranscript(conversation.id)}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    isExpanded && currentViewMode === 'transcript'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                                  }`}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  View Transcript
                                </button>
                              )}
                              
                              {isExpanded && (
                                <button
                                  onClick={closeExpanded}
                                  className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                  <Eye className="w-4 h-4" />
                                  Close
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="p-4">
                          {currentViewMode === 'feedback' && feedback && (
                            <div className="space-y-6">
                              {/* Scores Breakdown */}
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-3">Performance Scores</h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className={`text-2xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                                      {feedback.overall_score}
                                    </div>
                                    <div className="text-sm text-gray-600">Overall Score</div>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                      {feedback.clarity_and_specificity}
                                    </div>
                                    <div className="text-xs text-gray-600">Clarity & Specificity</div>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                      {feedback.mutual_understanding}
                                    </div>
                                    <div className="text-xs text-gray-600">Mutual Understanding</div>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                      {feedback.proactive_problem_solving}
                                    </div>
                                    <div className="text-xs text-gray-600">Problem Solving</div>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                      {feedback.appropriate_customization}
                                    </div>
                                    <div className="text-xs text-gray-600">Customization</div>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                      {feedback.documentation_and_verification}
                                    </div>
                                    <div className="text-xs text-gray-600">Documentation</div>
                                  </div>
                                </div>
                              </div>

                              {/* AI Feedback */}
                              {feedback.rawFeedback && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Detailed AI Feedback</h4>
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: formatMarkdown(feedback.rawFeedback) }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {currentViewMode === 'transcript' && conversation.transcript && conversation.transcript.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-slate-900 mb-3">Conversation Transcript</h4>
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {conversation.transcript.map((msg, index) => (
                                  <div key={index} className={`p-4 rounded-lg ${
                                    msg.role === 'user' 
                                      ? 'bg-blue-50 ml-8 border-l-4 border-blue-400' 
                                      : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
                                  }`}>
                                    <div className="font-medium text-sm text-gray-600 mb-2">
                                      {msg.role === 'user' ? 'You' : scenario?.assignedCharacterName || 'AI Assistant'}
                                    </div>
                                    <div className="text-gray-800">{msg.message}</div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Scenario Context */}
                              {scenario && (
                                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                                  <h4 className="font-semibold text-slate-900 mb-3">Scenario Context</h4>
                                  <p className="text-sm text-slate-700 mb-2">{scenario.generalContext}</p>
                                  <div className="text-xs text-slate-600">
                                    Difficulty Level: {scenario.difficultyLevel}/10
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}