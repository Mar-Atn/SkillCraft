// Mini Rating Display Component - Sprint 5
// Compact rating display for practice page

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { userDataService } from '../services/userDataService';
import { useAuth } from '../context/AuthContext';

interface UserRatings {
  overall: number;
  conversationsCount: number;
}

export default function MiniRatingDisplay() {
  const [ratings, setRatings] = useState<UserRatings | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Load user-specific ratings from new data service
    const loadRatings = () => {
      const overallProgress = userDataService.getUserProgress(user.id, 'overall');
      
      setRatings({
        overall: overallProgress?.currentRating || 0,
        conversationsCount: overallProgress?.conversationCount || 0
      });
    };

    loadRatings();

    // Update when storage changes (when new conversations complete)
    const handleStorageChange = () => loadRatings();
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for updates every 2 seconds (for real-time updates during practice)
    const interval = setInterval(loadRatings, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  if (!ratings || ratings.conversationsCount === 0) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">No rating yet</span>
        </div>
      </div>
    );
  }

  const getSkillColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 70) return 'text-blue-600';
    if (rating >= 60) return 'text-yellow-600';
    if (rating >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSkillLevel = (rating: number) => {
    if (rating >= 90) return 'Master';
    if (rating >= 80) return 'Expert';
    if (rating >= 70) return 'Advanced';
    if (rating >= 60) return 'Intermediate';
    if (rating >= 50) return 'Developing';
    return 'Beginner';
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-600">Rating:</span>
          <span className={`text-lg font-bold ${getSkillColor(ratings.overall)}`}>
            {ratings.overall.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({getSkillLevel(ratings.overall)})
          </span>
        </div>
        <div className="text-xs text-gray-500 border-l pl-3">
          {ratings.conversationsCount} sessions
        </div>
      </div>
    </div>
  );
}