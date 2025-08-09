// Main Dashboard Component - PRD 3.1.2
// Consolidated hub: scenario selection, progress tracking, past conversations

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Clock, 
  FileText, 
  Award,
  Star,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userDataService } from '../../services/userDataService';
import { scenarioService } from '../../services/scenarioService';
import UserHeader from '../layout/UserHeader';
import type { UserDashboardData } from '../../types/user-data';
import type { Scenario } from '../../types/scenario';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        // Load user dashboard data
        const data = userDataService.getUserDashboardData(user.id);
        setDashboardData(data);

        // Load available scenarios
        const availableScenarios = await scenarioService.getAllScenarios();
        setScenarios(availableScenarios);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getScenarioStars = (scenarioId: string): number => {
    if (!dashboardData?.scenarioPerformance) return 0;
    
    const performance = dashboardData.scenarioPerformance.find(p => p.scenarioId === scenarioId);
    return performance?.stars || 0;
  };

  const hasAttemptedScenario = (scenarioId: string): boolean => {
    if (!dashboardData?.scenarioPerformance) return false;
    
    return dashboardData.scenarioPerformance.some(p => p.scenarioId === scenarioId);
  };

  const startPractice = () => {
    if (selectedScenario) {
      navigate(`/scenario/${selectedScenario.id}`);
    }
  };

  const getSkillLevel = (rating: number) => {
    if (rating >= 90) return 'Master';
    if (rating >= 80) return 'Expert';
    if (rating >= 70) return 'Advanced';
    if (rating >= 60) return 'Intermediate';
    if (rating >= 50) return 'Developing';
    return 'Beginner';
  };

  const getSkillColor = (rating: number) => {
    if (rating >= 90) return 'text-purple-600';
    if (rating >= 80) return 'text-green-600';
    if (rating >= 70) return 'text-blue-600';
    if (rating >= 60) return 'text-yellow-600';
    if (rating >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderStars = (count: number) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Skills Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Skill Level */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Your Skill Level</h2>
              </div>
              
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getSkillColor(dashboardData.overallStats.averageScore)}`}>
                  {dashboardData.overallStats.averageScore.toFixed(1)}
                </div>
                <div className="text-lg font-medium text-slate-700 mb-4">
                  {getSkillLevel(dashboardData.overallStats.averageScore)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData.overallStats.totalConversations}
                    </div>
                    <div className="text-slate-600">Sessions</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData.overallStats.scenariosCompleted}
                    </div>
                    <div className="text-slate-600">Scenarios</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              
              {dashboardData.recentConversations.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentConversations.slice(0, 3).map(conversation => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{conversation.scenarioTitle}</div>
                        <div className="text-xs text-slate-600">
                          {new Date(conversation.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-sm">No practice sessions yet. Start your first conversation!</p>
              )}
            </div>
          </div>

          {/* Right Column - Scenario Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Play className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Choose Your Next Practice</h2>
              </div>

              {/* Scenarios Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {scenarios.map(scenario => {
                  const stars = getScenarioStars(scenario.id.toString());
                  const attempted = hasAttemptedScenario(scenario.id.toString());
                  const isSelected = selectedScenario?.id === scenario.id;

                  return (
                    <div
                      key={scenario.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => navigate(`/scenario/${scenario.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900">{scenario.title}</h3>
                        {attempted && renderStars(stars)}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                        {scenario.generalContext.substring(0, 150)}...
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            scenario.difficultyLevel <= 2 ? 'bg-green-100 text-green-700' :
                            scenario.difficultyLevel <= 4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Level {scenario.difficultyLevel}
                          </span>
                        </div>
                        
                        <div className="text-xs text-slate-500">
                          {attempted ? 'Practiced' : 'New'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Scenario Details */}
              {selectedScenario && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-3">{selectedScenario.title}</h3>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-slate-800 mb-2">Scenario Context:</h4>
                    <p className="text-sm text-slate-700 mb-3">{selectedScenario.generalContext}</p>
                    
                    <h4 className="font-medium text-slate-800 mb-2">Your Role:</h4>
                    <p className="text-sm text-slate-700">{selectedScenario.humanInstructions}</p>
                  </div>
                  
                  <button
                    onClick={startPractice}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Practice Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button 
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow group"
            onClick={() => console.log('View progress chart')}
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">Progress Chart</h3>
            <p className="text-sm text-slate-600">View your skill improvement over time</p>
          </button>

          <button 
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow group"
            onClick={() => navigate('/history')}
          >
            <MessageSquare className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">Past Conversations</h3>
            <p className="text-sm text-slate-600">Review transcripts and feedback from previous sessions</p>
          </button>

          <button 
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow group"
            onClick={() => window.open('/docs/Company_SX_Guide.pdf', '_blank')}
          >
            <FileText className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">Guidelines</h3>
            <p className="text-sm text-slate-600">Company guide to productive expectation conversations</p>
          </button>
        </div>
      </div>
    </div>
  );
}