// User Progress Chart Page - Comprehensive skill improvement visualization
// Shows progress over time with beautiful charts and statistics

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
  Target,
  Star,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userDataService } from '../services/userDataService';
import UserHeader from '../components/layout/UserHeader';
import type { UserProgress as UserProgressType, ConversationFeedback } from '../types/user-data';

interface SkillProgressData {
  skillName: string;
  displayName: string;
  currentRating: number;
  conversationCount: number;
  bestScore: number;
  firstConversationDate: Date;
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

interface TimelinePoint {
  date: Date;
  overallScore: number;
  sessionCount: number;
}

export default function UserProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skillProgress, setSkillProgress] = useState<SkillProgressData[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    if (!user) return;

    const loadProgressData = async () => {
      try {
        // Get all user progress
        const allProgress = userDataService.getUserAllProgress(user.id);
        
        // Get all user feedbacks for timeline
        const allFeedbacks = userDataService.getFeedbacks(user.id);
        
        // Map skill names to display names
        const skillDisplayNames: {[key: string]: string} = {
          'overall': 'Overall Performance',
          'clarity_and_specificity': 'Clarity & Specificity',
          'mutual_understanding': 'Mutual Understanding',
          'proactive_problem_solving': 'Proactive Problem Solving',
          'appropriate_customization': 'Appropriate Customization',
          'documentation_and_verification': 'Documentation & Verification'
        };

        // Process skill progress data
        const skillData: SkillProgressData[] = allProgress.map(progress => {
          // Calculate trend and improvement
          const recentFeedbacks = allFeedbacks
            .filter(f => new Date(f.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          let trend: 'up' | 'down' | 'stable' = 'stable';
          let improvement = 0;
          
          if (recentFeedbacks.length >= 2) {
            const firstHalf = recentFeedbacks.slice(0, Math.floor(recentFeedbacks.length / 2));
            const secondHalf = recentFeedbacks.slice(Math.floor(recentFeedbacks.length / 2));
            
            const firstAvg = firstHalf.reduce((sum, f) => {
              const skillValue = progress.skillName === 'overall' ? f.overall_score :
                progress.skillName === 'clarity_and_specificity' ? f.clarity_and_specificity :
                progress.skillName === 'mutual_understanding' ? f.mutual_understanding :
                progress.skillName === 'proactive_problem_solving' ? f.proactive_problem_solving :
                progress.skillName === 'appropriate_customization' ? f.appropriate_customization :
                progress.skillName === 'documentation_and_verification' ? f.documentation_and_verification : 0;
              return sum + skillValue;
            }, 0) / firstHalf.length;
            
            const secondAvg = secondHalf.reduce((sum, f) => {
              const skillValue = progress.skillName === 'overall' ? f.overall_score :
                progress.skillName === 'clarity_and_specificity' ? f.clarity_and_specificity :
                progress.skillName === 'mutual_understanding' ? f.mutual_understanding :
                progress.skillName === 'proactive_problem_solving' ? f.proactive_problem_solving :
                progress.skillName === 'appropriate_customization' ? f.appropriate_customization :
                progress.skillName === 'documentation_and_verification' ? f.documentation_and_verification : 0;
              return sum + skillValue;
            }, 0) / secondHalf.length;
            
            improvement = secondAvg - firstAvg;
            trend = improvement > 2 ? 'up' : improvement < -2 ? 'down' : 'stable';
          }
          
          return {
            skillName: progress.skillName,
            displayName: skillDisplayNames[progress.skillName] || progress.skillName,
            currentRating: progress.currentRating,
            conversationCount: progress.conversationCount,
            bestScore: progress.bestScore,
            firstConversationDate: progress.firstConversationDate,
            lastUpdated: progress.lastUpdated,
            trend,
            improvement
          };
        });

        // Sort by overall first, then by current rating
        skillData.sort((a, b) => {
          if (a.skillName === 'overall') return -1;
          if (b.skillName === 'overall') return 1;
          return b.currentRating - a.currentRating;
        });

        // Create timeline data
        const timelineData: TimelinePoint[] = [];
        const sortedFeedbacks = allFeedbacks
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        let sessionCount = 0;
        sortedFeedbacks.forEach((feedback) => {
          sessionCount++;
          timelineData.push({
            date: new Date(feedback.created_at),
            overallScore: feedback.overall_score,
            sessionCount
          });
        });

        setSkillProgress(skillData);
        setTimeline(timelineData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load progress data:', error);
        setLoading(false);
      }
    };

    loadProgressData();
  }, [user]);

  const getSkillLevel = (rating: number) => {
    if (rating >= 90) return { level: 'Master', color: 'text-purple-600 bg-purple-50' };
    if (rating >= 80) return { level: 'Expert', color: 'text-green-600 bg-green-50' };
    if (rating >= 70) return { level: 'Advanced', color: 'text-blue-600 bg-blue-50' };
    if (rating >= 60) return { level: 'Intermediate', color: 'text-yellow-600 bg-yellow-50' };
    if (rating >= 50) return { level: 'Developing', color: 'text-orange-600 bg-orange-50' };
    return { level: 'Beginner', color: 'text-red-600 bg-red-50' };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderProgressBar = (value: number, max: number = 100) => {
    const percentage = Math.min((value / max) * 100, 100);
    const { color } = getSkillLevel(value);
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${color.includes('purple') ? 'bg-purple-600' :
            color.includes('green') ? 'bg-green-600' :
            color.includes('blue') ? 'bg-blue-600' :
            color.includes('yellow') ? 'bg-yellow-600' :
            color.includes('orange') ? 'bg-orange-600' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderTimeline = () => {
    if (timeline.length === 0) return null;

    const filteredTimeline = timeline.filter(point => {
      const now = new Date();
      const cutoff = selectedTimeRange === '7d' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
        selectedTimeRange === '30d' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) :
        new Date(0);
      return point.date >= cutoff;
    });

    if (filteredTimeline.length === 0) return null;

    // Use fixed 0-100 scale
    const maxScore = 100;
    const minScore = 0;
    const scoreRange = 100;

    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Progress Timeline</h3>
        <div className="relative h-80">
          <div className="absolute inset-0 flex flex-col justify-between text-sm text-gray-500">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
          <div className="ml-8 h-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Smooth curve path */}
              <path
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={(() => {
                  if (filteredTimeline.length < 2) return '';
                  
                  const points = filteredTimeline.map((point, index) => ({
                    x: (index / (filteredTimeline.length - 1)) * 100,
                    y: 100 - ((point.overallScore - minScore) / scoreRange) * 100
                  }));
                  
                  // Create smooth curve using cubic bezier curves
                  let path = `M ${points[0].x} ${points[0].y}`;
                  
                  for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    
                    // Calculate control points for smooth curve
                    let cp1x, cp1y, cp2x, cp2y;
                    
                    if (i === 1) {
                      // First curve segment
                      cp1x = prev.x + (curr.x - prev.x) * 0.25;
                      cp1y = prev.y;
                      cp2x = curr.x - (curr.x - prev.x) * 0.25;
                      cp2y = curr.y;
                    } else if (i === points.length - 1) {
                      // Last curve segment
                      cp1x = prev.x + (curr.x - prev.x) * 0.25;
                      cp1y = prev.y;
                      cp2x = curr.x - (curr.x - prev.x) * 0.25;
                      cp2y = curr.y;
                    } else {
                      // Middle curve segments - use neighboring points for smoother curves
                      const prevPrev = points[i - 2] || prev;
                      const tension = 0.2;
                      
                      cp1x = prev.x + (curr.x - prevPrev.x) * tension;
                      cp1y = prev.y + (curr.y - prevPrev.y) * tension;
                      cp2x = curr.x - (next.x - prev.x) * tension;
                      cp2y = curr.y - (next.y - prev.y) * tension;
                    }
                    
                    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
                  }
                  
                  return path;
                })()}
              />
            </svg>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 ml-8">
          <span>{filteredTimeline[0]?.date.toLocaleDateString()}</span>
          <span>{filteredTimeline[filteredTimeline.length - 1]?.date.toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  const overallProgress = skillProgress.find(s => s.skillName === 'overall');
  const subSkills = skillProgress.filter(s => s.skillName !== 'overall');

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
          
          {/* Time Range Filter */}
          <div className="flex gap-2">
            {[
              { key: '7d', label: 'Last 7 days' },
              { key: '30d', label: 'Last 30 days' },
              { key: 'all', label: 'All time' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setSelectedTimeRange(range.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTimeRange === range.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          {/* Page Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Your Progress</h1>
                <p className="text-slate-600">Track your skill development over time</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {skillProgress.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Progress Data Yet</h3>
                <p className="text-slate-500 mb-6">Complete your first practice session to see your progress.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Practicing
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overall Progress Highlight */}
                {overallProgress && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-6 h-6 text-blue-600" />
                      Overall Performance
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold mb-2 ${getSkillLevel(overallProgress.currentRating).color.split(' ')[0]}`}>
                          {overallProgress.currentRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Current Rating</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getSkillLevel(overallProgress.currentRating).color}`}>
                          {getSkillLevel(overallProgress.currentRating).level}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {overallProgress.conversationCount}
                        </div>
                        <div className="text-sm text-gray-600">Total Sessions</div>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          {getTrendIcon(overallProgress.trend)}
                          <span className={`text-sm ${overallProgress.trend === 'up' ? 'text-green-600' : 
                            overallProgress.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                            {overallProgress.improvement > 0 ? '+' : ''}{overallProgress.improvement.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {overallProgress.bestScore}
                        </div>
                        <div className="text-sm text-gray-600">Best Score</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Since {overallProgress.firstConversationDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graph and Skills Side by Side */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Side - Timeline Chart */}
                  <div>
                    {renderTimeline()}
                  </div>

                  {/* Right Side - Individual Skills */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-600" />
                      Skill Breakdown
                    </h3>
                    
                    <div className="grid gap-2">
                      {subSkills.map((skill) => (
                        <div key={skill.skillName} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{skill.displayName}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">
                                {skill.currentRating.toFixed(1)}
                              </span>
                              {getTrendIcon(skill.trend)}
                            </div>
                          </div>
                          
                          {renderProgressBar(skill.currentRating)}
                          
                          <div className="text-right text-xs text-gray-600 mt-1">
                            <span>Best: {skill.bestScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {skillProgress.filter(s => s.trend === 'up').length}
                    </div>
                    <div className="text-sm text-green-700">Skills Improving</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {timeline.length}
                    </div>
                    <div className="text-sm text-blue-700">Practice Sessions</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}