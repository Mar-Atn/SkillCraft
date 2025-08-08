// Rating Display Component - Sprint 5
// Shows user's current ratings with EWMA system (α=0.25)

import { useEffect, useState } from 'react';
import { TrendingUp, Target, Users, CheckCircle, FileText, BarChart3 } from 'lucide-react';
import { userDataService } from '../services/userDataService';
import { useAuth } from '../context/AuthContext';

interface UserRatings {
  overall: number;
  clarity_and_specificity: number;
  mutual_understanding: number;
  proactive_problem_solving: number;
  appropriate_customization: number;
  documentation_and_verification: number;
  conversationsCount: number;
  lastUpdated: string;
}

export default function RatingDisplay() {
  const [ratings, setRatings] = useState<UserRatings | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Load user progress from new data service
    const allProgress = userDataService.getUserAllProgress(user.id);
    
    // Convert progress records to ratings format
    const ratingsData: UserRatings = {
      overall: 0,
      clarity_and_specificity: 0,
      mutual_understanding: 0,
      proactive_problem_solving: 0,
      appropriate_customization: 0,
      documentation_and_verification: 0,
      conversationsCount: 0,
      lastUpdated: 'No conversations yet'
    };
    
    // Map progress records to ratings
    allProgress.forEach(progress => {
      switch (progress.skillName) {
        case 'overall':
          ratingsData.overall = progress.currentRating;
          ratingsData.conversationsCount = progress.conversationCount;
          ratingsData.lastUpdated = progress.lastUpdated.toLocaleDateString();
          break;
        case 'clarity_and_specificity':
          ratingsData.clarity_and_specificity = progress.currentRating;
          break;
        case 'mutual_understanding':
          ratingsData.mutual_understanding = progress.currentRating;
          break;
        case 'proactive_problem_solving':
          ratingsData.proactive_problem_solving = progress.currentRating;
          break;
        case 'appropriate_customization':
          ratingsData.appropriate_customization = progress.currentRating;
          break;
        case 'documentation_and_verification':
          ratingsData.documentation_and_verification = progress.currentRating;
          break;
      }
    });
    
    setRatings(ratingsData);
  }, [user]);

  if (!ratings) {
    return <div>Loading ratings...</div>;
  }

  // Get skill level for color coding
  const getSkillColor = (rating: number) => {
    if (rating === 0) return 'bg-gray-200';
    if (rating >= 90) return 'bg-purple-500';
    if (rating >= 80) return 'bg-green-500';
    if (rating >= 70) return 'bg-blue-500';
    if (rating >= 60) return 'bg-yellow-500';
    if (rating >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSkillLevel = (rating: number) => {
    if (rating >= 90) return 'Master';
    if (rating >= 80) return 'Expert';
    if (rating >= 70) return 'Advanced';
    if (rating >= 60) return 'Intermediate';
    if (rating >= 50) return 'Developing';
    return 'Beginner';
  };

  const getSkillTextColor = (rating: number) => {
    if (rating === 0) return 'text-gray-600';
    if (rating >= 90) return 'text-purple-600';
    if (rating >= 80) return 'text-green-600';
    if (rating >= 70) return 'text-blue-600';
    if (rating >= 60) return 'text-yellow-600';
    if (rating >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const skills = [
    { 
      name: 'Clarity & Specificity', 
      value: ratings.clarity_and_specificity, 
      icon: Target,
      description: 'Clear communication of expectations'
    },
    { 
      name: 'Mutual Understanding', 
      value: ratings.mutual_understanding, 
      icon: Users,
      description: 'Two-way dialogue and empathy'
    },
    { 
      name: 'Problem Solving', 
      value: ratings.proactive_problem_solving, 
      icon: TrendingUp,
      description: 'Addressing concerns proactively'
    },
    { 
      name: 'Customization', 
      value: ratings.appropriate_customization, 
      icon: CheckCircle,
      description: 'Adapting to individual needs'
    },
    { 
      name: 'Documentation', 
      value: ratings.documentation_and_verification, 
      icon: FileText,
      description: 'Clear next steps and follow-up'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Your Progress</h2>
        <div className="text-sm text-slate-500">
          {ratings.conversationsCount === 0 
            ? 'No conversations yet' 
            : `${ratings.conversationsCount} conversation${ratings.conversationsCount !== 1 ? 's' : ''} completed`}
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-2xl font-bold">Overall Rating</h3>
              <p className="text-sm text-slate-600">EWMA weighted average (α=0.25)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {ratings.conversationsCount === 0 ? '—' : ratings.overall.toFixed(1)}
            </div>
            <div className={`text-sm font-medium ${getSkillTextColor(ratings.overall)}`}>
              {getSkillLevel(ratings.overall)}
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${getSkillColor(ratings.overall)}`}
            style={{ width: `${Math.min(100, ratings.overall)}%` }}
          />
        </div>
        
        {/* Scale markers */}
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Sub-skills */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-slate-700 border-b pb-2">Skill Breakdown</h4>
        
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <div key={skill.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <div>
                    <span className="font-medium text-slate-900">{skill.name}</span>
                    <p className="text-xs text-slate-500">{skill.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold">
                    {ratings.conversationsCount === 0 ? '—' : skill.value.toFixed(1)}
                  </span>
                  <span className={`ml-2 text-sm ${getSkillTextColor(skill.value)}`}>
                    {ratings.conversationsCount > 0 && `(${getSkillLevel(skill.value)})`}
                  </span>
                </div>
              </div>
              
              {/* Skill Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${getSkillColor(skill.value)}`}
                  style={{ width: `${Math.min(100, skill.value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      {ratings.conversationsCount === 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Get Started:</strong> Complete your first practice conversation to see your initial ratings. 
            Your rating uses EWMA (Exponential Weighted Moving Average) which gives 25% weight to new scores 
            and 75% to your history, making recent performance more impactful.
          </p>
        </div>
      )}

      {ratings.conversationsCount > 0 && ratings.conversationsCount < 3 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Building Your Profile:</strong> Complete more conversations to establish a reliable skill rating. 
            Early conversations have larger impact on your average.
          </p>
        </div>
      )}

      {ratings.conversationsCount >= 3 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Keep Practicing:</strong> Your ratings reflect your recent performance more heavily (25% weight) 
            while maintaining historical context (75% weight). Consistent practice leads to steady improvement.
          </p>
        </div>
      )}

      {/* Last Updated */}
      {ratings.lastUpdated && ratings.conversationsCount > 0 && (
        <div className="mt-4 text-xs text-slate-500 text-right">
          Last updated: {new Date(ratings.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}