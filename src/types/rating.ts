// Rating System Types for SkillCraft Progressive Learning Engine

export interface UserRating {
  userId: string;
  ratings: SkillRatings;
  statistics: RatingStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface SkillRatings {
  overall: number;
  subSkills: {
    clarityAndSpecificity: number;
    mutualUnderstanding: number;
    proactiveProblemSolving: number;
    appropriateCustomization: number;
    documentationAndVerification: number;
  };
}

export interface RatingStatistics {
  conversationsCompleted: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: number; // Last 10 conversations trend
  streakCount: number; // Current improvement streak
  lastDifficultyLevel: number;
  skillDistribution: SkillDistribution;
}

export interface SkillDistribution {
  // Percentage of conversations where each skill was strongest/weakest
  strongestSkill: string;
  weakestSkill: string;
  skillVariance: number; // How consistent ratings are across skills
}

export interface RatingChange {
  conversationId: string;
  timestamp: string;
  scenarioId: number;
  difficultyLevel: number;
  scores: ConversationScores; // From feedback service
  ratingChanges: SkillRatingChanges;
  expectedPerformance: SkillRatings; // What was expected based on current rating
  actualPerformance: SkillRatings; // Converted from 1-100 scores
}

export interface SkillRatingChanges {
  overall: number;
  subSkills: {
    clarityAndSpecificity: number;
    mutualUnderstanding: number;
    proactiveProblemSolving: number;
    appropriateCustomization: number;
    documentationAndVerification: number;
  };
}

export interface ConversationScores {
  overall_score: number;
  sub_skills: {
    clarity_and_specificity: number;
    mutual_understanding: number;
    proactive_problem_solving: number;
    appropriate_customization: number;
    documentation_and_verification: number;
  };
}

export interface RatingConfig {
  // K-factor configuration for different rating ranges
  kFactors: {
    beginner: number; // 1000-1199: Higher volatility for faster learning
    developing: number; // 1200-1399
    proficient: number; // 1400-1599  
    advanced: number; // 1600-1799
    expert: number; // 1800-1999: Lower volatility for stability
    master: number; // 2000+: Minimal changes
  };
  
  // Starting ratings for new users
  initialRatings: SkillRatings;
  
  // Difficulty multipliers
  difficultyMultipliers: Record<number, number>;
  
  // Score-to-performance conversion parameters
  scoreConversion: {
    excellent: number; // Score threshold for "better than expected"
    good: number; // Score threshold for "as expected"
    poor: number; // Below this is "worse than expected"
  };
}

export interface RatingHistory {
  userId: string;
  changes: RatingChange[];
  milestones: RatingMilestone[];
}

export interface RatingMilestone {
  timestamp: string;
  type: 'skill_breakthrough' | 'rating_milestone' | 'consistency_achievement';
  description: string;
  ratingAtTime: SkillRatings;
  metadata: Record<string, any>;
}

// For UI components and analytics
export interface RatingProgress {
  currentRatings: SkillRatings;
  progressToNext: {
    overall: number; // Points needed to next tier
    subSkills: Record<string, number>;
  };
  recentTrend: 'improving' | 'stable' | 'declining';
  strengthsAndWeaknesses: {
    strengths: string[];
    improvements: string[];
  };
}

export type RatingTier = 'beginner' | 'developing' | 'proficient' | 'advanced' | 'expert' | 'master';

export interface PerformanceMetrics {
  consistency: number; // How consistent performance is (lower variance = higher consistency)
  growthRate: number; // Rate of improvement over time
  skillBalance: number; // How balanced skills are (penalty for having one very weak skill)
  adaptability: number; // Performance across different difficulty levels
}