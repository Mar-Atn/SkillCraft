// Admin Analytics Dashboard - PRD 4.1 System Analytics
// Usage statistics and performance metrics for administrators

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userDataService } from '../../services/userDataService';
import UserHeader from '../../components/layout/UserHeader';

interface AnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalSessions: number;
  sessionsToday: number;
  averageSessionDuration: number;
  averageUserScore: number;
  completionRate: number;
  topScenarios: Array<{
    id: string;
    title: string;
    attempts: number;
    averageScore: number;
  }>;
  userProgress: Array<{
    userId: string;
    email: string;
    totalSessions: number;
    averageScore: number;
    lastActive: Date;
  }>;
  dailyActivity: Array<{
    date: string;
    sessions: number;
    uniqueUsers: number;
  }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadAnalytics();
  }, [user, navigate, timeRange]);

  const loadAnalytics = async () => {
    try {
      // TODO: Implement actual analytics data loading
      // For now, using mock data that demonstrates the interface
      
      const mockData: AnalyticsData = {
        totalUsers: 12,
        activeUsersToday: 3,
        activeUsersWeek: 8,
        totalSessions: 147,
        sessionsToday: 12,
        averageSessionDuration: 8.5,
        averageUserScore: 76.3,
        completionRate: 84.2,
        topScenarios: [
          { id: '1', title: 'Difficult Client Conversation', attempts: 45, averageScore: 72.1 },
          { id: '2', title: 'Setting Project Deadlines', attempts: 38, averageScore: 78.5 },
          { id: '3', title: 'Performance Review Discussion', attempts: 32, averageScore: 69.8 },
          { id: '4', title: 'Budget Planning Meeting', attempts: 28, averageScore: 81.2 },
          { id: '5', title: 'Team Restructuring', attempts: 24, averageScore: 74.6 }
        ],
        userProgress: [
          { userId: 'test-user-1', email: 'test@test.com', totalSessions: 18, averageScore: 78.5, lastActive: new Date('2024-01-08') },
          { userId: 'admin-user-1', email: 'admin@admin.com', totalSessions: 25, averageScore: 82.1, lastActive: new Date('2024-01-08') },
          { userId: 'user-3', email: 'manager@company.com', totalSessions: 12, averageScore: 71.3, lastActive: new Date('2024-01-07') },
          { userId: 'user-4', email: 'lead@company.com', totalSessions: 8, averageScore: 68.9, lastActive: new Date('2024-01-06') }
        ],
        dailyActivity: [
          { date: '2024-01-01', sessions: 5, uniqueUsers: 3 },
          { date: '2024-01-02', sessions: 8, uniqueUsers: 4 },
          { date: '2024-01-03', sessions: 12, uniqueUsers: 6 },
          { date: '2024-01-04', sessions: 15, uniqueUsers: 7 },
          { date: '2024-01-05', sessions: 18, uniqueUsers: 8 },
          { date: '2024-01-06', sessions: 22, uniqueUsers: 9 },
          { date: '2024-01-07', sessions: 19, uniqueUsers: 7 },
          { date: '2024-01-08', sessions: 12, uniqueUsers: 5 }
        ]
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    // TODO: Implement actual export functionality
    alert('Analytics export functionality will be implemented with CSV/PDF generation');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Unable to load analytics data</p>
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
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin Dashboard
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={exportAnalytics}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
                <p className="text-slate-600">Usage statistics and performance metrics</p>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{analyticsData.totalUsers}</div>
                    <div className="text-sm text-blue-700">Total Users</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  {analyticsData.activeUsersToday} active today • {analyticsData.activeUsersWeek} active this week
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{analyticsData.totalSessions}</div>
                    <div className="text-sm text-green-700">Total Sessions</div>
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  {analyticsData.sessionsToday} sessions today
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{analyticsData.averageSessionDuration}min</div>
                    <div className="text-sm text-purple-700">Avg Duration</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600">
                  {analyticsData.completionRate}% completion rate
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <Award className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-900">{analyticsData.averageUserScore}</div>
                    <div className="text-sm text-orange-700">Avg Score</div>
                  </div>
                </div>
                <div className="text-xs text-orange-600">
                  Across all scenarios
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Data */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Scenarios */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Top Scenarios by Usage
              </h2>
              
              <div className="space-y-4">
                {analyticsData.topScenarios.map((scenario, index) => (
                  <div key={scenario.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{scenario.title}</div>
                        <div className="text-sm text-slate-600">{scenario.attempts} attempts</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(scenario.averageScore)} ${getScoreColor(scenario.averageScore)}`}>
                      {scenario.averageScore.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                User Progress Overview
              </h2>
              
              <div className="space-y-4">
                {analyticsData.userProgress.map((userProgress) => (
                  <div key={userProgress.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-slate-900">{userProgress.email}</div>
                      <div className="text-sm text-slate-600">
                        {userProgress.totalSessions} sessions • Last active {userProgress.lastActive.toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(userProgress.averageScore)} ${getScoreColor(userProgress.averageScore)}`}>
                      {userProgress.averageScore.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Daily Activity Trend
            </h2>
            
            <div className="space-y-4">
              {analyticsData.dailyActivity.map((day) => (
                <div key={day.date} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-20 text-sm text-slate-600">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{day.sessions} sessions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{day.uniqueUsers} users</span>
                      </div>
                    </div>
                    {/* Simple bar visualization */}
                    <div className="mt-2 flex gap-1">
                      <div 
                        className="bg-blue-200 h-2 rounded"
                        style={{ width: `${(day.sessions / Math.max(...analyticsData.dailyActivity.map(d => d.sessions))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Download className="w-6 h-6 text-orange-600" />
              Export & Reports
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={exportAnalytics}
                className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-blue-600 mb-2">📊</div>
                <div className="font-medium text-slate-900">Usage Report</div>
                <div className="text-sm text-slate-600">Sessions, users, activity</div>
              </button>
              
              <button
                onClick={exportAnalytics}
                className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <div className="text-green-600 mb-2">📈</div>
                <div className="font-medium text-slate-900">Performance Report</div>
                <div className="text-sm text-slate-600">Scores, progress, trends</div>
              </button>
              
              <button
                onClick={exportAnalytics}
                className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <div className="text-purple-600 mb-2">👥</div>
                <div className="font-medium text-slate-900">User Report</div>
                <div className="text-sm text-slate-600">Individual progress data</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}