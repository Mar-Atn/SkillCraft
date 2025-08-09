// Scenario Detail Page - PRD 3.1.2 Scenario Introduction Screen
// Shows scenario briefing materials and handles voice check before conversation

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Play, 
  Mic,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  FileText,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scenarioService } from '../services/scenarioService';
import { userDataService } from '../services/userDataService';
import UserHeader from '../components/layout/UserHeader';
import VoiceConversation from '../components/voice/VoiceConversation';
import type { Scenario } from '../types/scenario';

export default function ScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [scenarioPerformance, setScenarioPerformance] = useState<{
    stars: number;
    attempts: number;
    bestScore: number;
  } | null>(null);

  useEffect(() => {
    if (!scenarioId) return;

    const loadScenario = async () => {
      try {
        const scenarioData = await scenarioService.getScenario(parseInt(scenarioId));
        setScenario(scenarioData);

        // Load user performance for this scenario
        if (user) {
          const performance = userDataService.getScenarioPerformance(user.id, scenarioId);
          if (performance) {
            setScenarioPerformance({
              stars: performance.stars,
              attempts: performance.attemptCount,
              bestScore: performance.bestScore
            });
          }
        }

        setLoading(false);
        
        // Automatically go to conversation view after loading
        checkMicrophoneOnLoad();
      } catch (error) {
        console.error('Failed to load scenario:', error);
        setLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId, user]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
    } catch (error) {
      setMicPermission('denied');
    }
  };

  const checkMicrophoneOnLoad = async () => {
    // Check microphone permission when page loads
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      // Automatically show conversation interface if mic is available
      setIsConversationActive(true);
    } catch (error) {
      setMicPermission('denied');
      // Show error message but still show the conversation interface
      alert('Microphone access is required for voice conversations. Please enable microphone permissions and try again.');
      setIsConversationActive(true);
    }
  };

  const backToDashboard = () => {
    navigate('/');
  };

  const getStarsDisplay = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${
              star <= count ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-700 border-green-200';
    if (level <= 4) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Scenario Not Found</h2>
          <button
            onClick={backToDashboard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToDashboard}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          {scenarioPerformance && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">
                Best: {scenarioPerformance.bestScore}/100 • {scenarioPerformance.attempts} attempts
              </div>
              {getStarsDisplay(scenarioPerformance.stars)}
            </div>
          )}
        </div>

        {/* Always show the conversation view with context on the left */}
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Full Scenario Details */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                {/* Session Header */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div>
                    <h2 className="font-bold text-blue-900">Scenario Details</h2>
                    <p className="text-blue-700 text-sm">{scenario.title}</p>
                  </div>
                </div>

                {/* Full Context Display */}
                <div className="space-y-6">
                  {/* General Context */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      General Context
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-700 leading-relaxed">{scenario.generalContext}</p>
                    </div>
                  </div>

                  {/* Your Role */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Your Role & Instructions
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-slate-700 leading-relaxed">{scenario.humanInstructions}</p>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Learning Objectives
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {scenario.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm text-slate-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Voice Conversation */}
            <div>
              <VoiceConversation scenario={scenario} />
            </div>
          </div>
      </div>
    </div>
  );
}