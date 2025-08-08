// SkillCraft User Data Service
// Manages persistent user data with localStorage
// Designed for PRD requirements with easy migration to real DB later

import { 
  Conversation, 
  ConversationFeedback, 
  UserProgress, 
  UserScenarioPerformance, 
  UserProfile,
  UserDashboardData
} from '../types/user-data';

class UserDataService {
  private readonly STORAGE_KEYS = {
    CONVERSATIONS: 'scsx_conversations',
    FEEDBACK: 'scsx_feedback', 
    PROGRESS: 'scsx_progress',
    SCENARIO_PERFORMANCE: 'scsx_scenario_performance',
    PROFILES: 'scsx_profiles'
  };

  // ========== CONVERSATION MANAGEMENT ==========
  
  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }

  getConversations(userId?: string): Conversation[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS);
    const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    const converted = conversations.map(c => ({
      ...c,
      startedAt: new Date(c.startedAt),
      completedAt: c.completedAt ? new Date(c.completedAt) : undefined
    }));
    
    return userId ? converted.filter(c => c.userId === userId) : converted;
  }

  getConversationById(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.id === id) || null;
  }

  // ========== FEEDBACK MANAGEMENT ==========
  
  saveFeedback(feedback: ConversationFeedback): void {
    const feedbacks = this.getFeedbacks();
    const index = feedbacks.findIndex(f => f.id === feedback.id);
    
    if (index >= 0) {
      feedbacks[index] = feedback;
    } else {
      feedbacks.push(feedback);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
    
    // Update user progress after saving feedback
    this.updateUserProgress(feedback);
  }

  getFeedbacks(userId?: string): ConversationFeedback[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.FEEDBACK);
    const feedbacks: ConversationFeedback[] = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    const converted = feedbacks.map(f => ({
      ...f,
      created_at: new Date(f.created_at)
    }));
    
    return userId ? converted.filter(f => f.userId === userId) : converted;
  }

  getFeedbackByConversationId(conversationId: string): ConversationFeedback | null {
    const feedbacks = this.getFeedbacks();
    return feedbacks.find(f => f.conversationId === conversationId) || null;
  }

  // ========== PROGRESS TRACKING (EWMA) ==========
  
  private updateUserProgress(feedback: ConversationFeedback): void {
    const skillMappings = {
      'overall': feedback.overall_score,
      'clarity_and_specificity': feedback.clarity_and_specificity,
      'mutual_understanding': feedback.mutual_understanding,
      'proactive_problem_solving': feedback.proactive_problem_solving,
      'appropriate_customization': feedback.appropriate_customization,
      'documentation_and_verification': feedback.documentation_and_verification
    };

    const alpha = 0.25; // EWMA smoothing factor (25% weight to new score)

    Object.entries(skillMappings).forEach(([skillName, newScore]) => {
      const currentProgress = this.getUserProgress(feedback.userId, skillName);
      
      if (currentProgress) {
        // Update existing progress with EWMA
        const newRating = alpha * newScore + (1 - alpha) * currentProgress.currentRating;
        
        currentProgress.currentRating = Math.round(newRating * 100) / 100;
        currentProgress.conversationCount += 1;
        currentProgress.lastUpdated = new Date();
        currentProgress.bestScore = Math.max(currentProgress.bestScore, newScore);
        
        this.saveUserProgress(currentProgress);
      } else {
        // Create new progress record
        const newProgress: UserProgress = {
          userId: feedback.userId,
          skillName,
          currentRating: newScore,
          conversationCount: 1,
          lastUpdated: new Date(),
          bestScore: newScore,
          firstConversationDate: new Date()
        };
        
        this.saveUserProgress(newProgress);
      }
    });
  }

  saveUserProgress(progress: UserProgress): void {
    const allProgress = this.getAllProgress();
    const index = allProgress.findIndex(p => 
      p.userId === progress.userId && p.skillName === progress.skillName
    );
    
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
  }

  getUserProgress(userId: string, skillName?: string): UserProgress | null {
    const allProgress = this.getAllProgress();
    
    if (skillName) {
      return allProgress.find(p => p.userId === userId && p.skillName === skillName) || null;
    } else {
      return allProgress.find(p => p.userId === userId && p.skillName === 'overall') || null;
    }
  }

  getUserAllProgress(userId: string): UserProgress[] {
    const allProgress = this.getAllProgress();
    return allProgress.filter(p => p.userId === userId);
  }

  private getAllProgress(): UserProgress[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
    const progress: UserProgress[] = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    return progress.map(p => ({
      ...p,
      lastUpdated: new Date(p.lastUpdated),
      firstConversationDate: new Date(p.firstConversationDate)
    }));
  }

  // ========== SCENARIO PERFORMANCE ==========
  
  updateScenarioPerformance(userId: string, scenarioId: string, score: number): void {
    const performance = this.getScenarioPerformance(userId, scenarioId);
    
    if (performance) {
      performance.attemptCount += 1;
      performance.bestScore = Math.max(performance.bestScore, score);
      performance.lastAttempt = new Date();
    } else {
      const newPerformance: UserScenarioPerformance = {
        userId,
        scenarioId,
        bestScore: score,
        attemptCount: 1,
        stars: this.calculateStars(score),
        lastAttempt: new Date()
      };
      
      this.saveScenarioPerformance(newPerformance);
      return;
    }
    
    // Recalculate stars based on best score
    performance.stars = this.calculateStars(performance.bestScore);
    this.saveScenarioPerformance(performance);
  }

  private calculateStars(score: number): 1 | 2 | 3 {
    if (score >= 80) return 3;
    if (score >= 60) return 2;
    return 1;
  }

  private saveScenarioPerformance(performance: UserScenarioPerformance): void {
    const allPerformance = this.getAllScenarioPerformance();
    const index = allPerformance.findIndex(p => 
      p.userId === performance.userId && p.scenarioId === performance.scenarioId
    );
    
    if (index >= 0) {
      allPerformance[index] = performance;
    } else {
      allPerformance.push(performance);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.SCENARIO_PERFORMANCE, JSON.stringify(allPerformance));
  }

  getScenarioPerformance(userId: string, scenarioId: string): UserScenarioPerformance | null {
    const allPerformance = this.getAllScenarioPerformance();
    return allPerformance.find(p => p.userId === userId && p.scenarioId === scenarioId) || null;
  }

  getUserScenarioPerformances(userId: string): UserScenarioPerformance[] {
    const allPerformance = this.getAllScenarioPerformance();
    return allPerformance.filter(p => p.userId === userId);
  }

  private getAllScenarioPerformance(): UserScenarioPerformance[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SCENARIO_PERFORMANCE);
    const performance: UserScenarioPerformance[] = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    return performance.map(p => ({
      ...p,
      lastAttempt: new Date(p.lastAttempt)
    }));
  }

  // ========== USER PROFILES ==========
  
  saveUserProfile(profile: UserProfile): void {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.userId === profile.userId);
    
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  getUserProfile(userId: string): UserProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.userId === userId) || null;
  }

  private getAllProfiles(): UserProfile[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PROFILES);
    const profiles: UserProfile[] = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    return profiles.map(p => ({
      ...p,
      createdAt: new Date(p.createdAt),
      lastActivity: new Date(p.lastActivity)
    }));
  }

  // ========== DASHBOARD DATA AGGREGATION ==========
  
  getUserDashboardData(userId: string): UserDashboardData | null {
    const profile = this.getUserProfile(userId);
    if (!profile) return null;

    const progress = this.getUserAllProgress(userId);
    const conversations = this.getConversations(userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 10); // Recent 10 conversations
    
    const scenarioPerformance = this.getUserScenarioPerformances(userId);
    
    const overallProgress = progress.find(p => p.skillName === 'overall');
    
    return {
      profile,
      progress,
      recentConversations: conversations,
      scenarioPerformance,
      overallStats: {
        totalConversations: conversations.length,
        averageScore: overallProgress?.currentRating || 0,
        improvementRate: this.calculateImprovementRate(userId),
        scenariosCompleted: scenarioPerformance.length
      }
    };
  }

  private calculateImprovementRate(userId: string): number {
    const feedbacks = this.getFeedbacks(userId);
    if (feedbacks.length < 2) return 0;
    
    const recent = feedbacks.slice(-5); // Last 5 conversations
    const earlier = feedbacks.slice(-10, -5); // Previous 5 conversations
    
    if (earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, f) => sum + f.overall_score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, f) => sum + f.overall_score, 0) / earlier.length;
    
    return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
  }

  // ========== UTILITY METHODS ==========
  
  clearUserData(userId: string): void {
    const conversations = this.getConversations().filter(c => c.userId !== userId);
    const feedbacks = this.getFeedbacks().filter(f => f.userId !== userId);
    const progress = this.getAllProgress().filter(p => p.userId !== userId);
    const scenarioPerformance = this.getAllScenarioPerformance().filter(p => p.userId !== userId);
    const profiles = this.getAllProfiles().filter(p => p.userId !== userId);
    
    localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    localStorage.setItem(this.STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    localStorage.setItem(this.STORAGE_KEYS.SCENARIO_PERFORMANCE, JSON.stringify(scenarioPerformance));
    localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  generateId(): string {
    return `scsx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const userDataService = new UserDataService();
export default userDataService;