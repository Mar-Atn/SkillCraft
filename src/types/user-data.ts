// SkillCraft User Data Types
// Designed specifically for PRD requirements

export interface Conversation {
  id: string;
  userId: string;
  scenarioId: string;
  scenarioTitle: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  transcriptText?: string;
  elevenLabsConversationId?: string;
}

export interface ConversationFeedback {
  id: string;
  conversationId: string;
  userId: string;
  // PRD 5 criteria scores (0-100)
  overall_score: number;
  clarity_and_specificity: number;
  mutual_understanding: number;
  proactive_problem_solving: number;
  appropriate_customization: number;
  documentation_and_verification: number;
  // Feedback text
  feedback_text: string;
  ai_model_used: string;
  created_at: Date;
}

export interface UserProgress {
  userId: string;
  skillName: string;
  currentRating: number; // EWMA calculated rating
  conversationCount: number;
  lastUpdated: Date;
  bestScore: number;
  firstConversationDate: Date;
}

export interface UserScenarioPerformance {
  userId: string;
  scenarioId: string;
  bestScore: number;
  attemptCount: number;
  stars: 1 | 2 | 3; // PRD requirement: star ratings based on performance
  lastAttempt: Date;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  totalConversations: number;
  averageRating: number;
  createdAt: Date;
  lastActivity: Date;
}

// Aggregate data for dashboard display
export interface UserDashboardData {
  profile: UserProfile;
  progress: UserProgress[];
  recentConversations: Conversation[];
  scenarioPerformance: UserScenarioPerformance[];
  overallStats: {
    totalConversations: number;
    averageScore: number;
    improvementRate: number;
    scenariosCompleted: number;
  };
}