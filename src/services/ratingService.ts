// Rating Engine Service - Sprint 4
// Progressive ELO-like rating system for skill development
// Designed by system-architect agent for production use

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

interface RatingChange {
  oldRating: number;
  newRating: number;
  change: number;
  performance: number;
}

interface ConversationScores {
  overall_score: number;
  sub_skills: {
    clarity_and_specificity: number;
    mutual_understanding: number;
    proactive_problem_solving: number;
    appropriate_customization: number;
    documentation_and_verification: number;
  };
}

export class RatingService {
  private readonly STORAGE_KEY = 'skillcraft_ratings';
  private readonly STARTING_RATING = 1200; // Intermediate beginner level
  private readonly MIN_RATING = 800;
  private readonly MAX_RATING = 2400;

  /**
   * Get current user ratings (creates default if not exists)
   */
  getUserRatings(): UserRatings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse stored ratings, creating defaults');
      }
    }

    // Create default ratings for new user
    const defaultRatings: UserRatings = {
      overall: this.STARTING_RATING,
      clarity_and_specificity: this.STARTING_RATING,
      mutual_understanding: this.STARTING_RATING,
      proactive_problem_solving: this.STARTING_RATING,
      appropriate_customization: this.STARTING_RATING,
      documentation_and_verification: this.STARTING_RATING,
      conversationsCount: 0,
      lastUpdated: new Date().toISOString()
    };

    this.saveRatings(defaultRatings);
    return defaultRatings;
  }

  /**
   * Update ratings based on conversation performance
   * Uses modified ELO algorithm optimized for skill development
   */
  updateRatings(conversationScores: ConversationScores): UserRatings {
    const currentRatings = this.getUserRatings();
    console.log('🎯 UPDATING RATINGS - Current state:', currentRatings);

    // Calculate rating changes for each skill
    const overallChange = this.calculateRatingChange(
      currentRatings.overall,
      conversationScores.overall_score,
      currentRatings.conversationsCount
    );

    const clarityChange = this.calculateRatingChange(
      currentRatings.clarity_and_specificity,
      conversationScores.sub_skills.clarity_and_specificity,
      currentRatings.conversationsCount
    );

    const understandingChange = this.calculateRatingChange(
      currentRatings.mutual_understanding,
      conversationScores.sub_skills.mutual_understanding,
      currentRatings.conversationsCount
    );

    const problemSolvingChange = this.calculateRatingChange(
      currentRatings.proactive_problem_solving,
      conversationScores.sub_skills.proactive_problem_solving,
      currentRatings.conversationsCount
    );

    const customizationChange = this.calculateRatingChange(
      currentRatings.appropriate_customization,
      conversationScores.sub_skills.appropriate_customization,
      currentRatings.conversationsCount
    );

    const documentationChange = this.calculateRatingChange(
      currentRatings.documentation_and_verification,
      conversationScores.sub_skills.documentation_and_verification,
      currentRatings.conversationsCount
    );

    // Apply changes with bounds checking
    const newRatings: UserRatings = {
      overall: this.clampRating(overallChange.newRating),
      clarity_and_specificity: this.clampRating(clarityChange.newRating),
      mutual_understanding: this.clampRating(understandingChange.newRating),
      proactive_problem_solving: this.clampRating(problemSolvingChange.newRating),
      appropriate_customization: this.clampRating(customizationChange.newRating),
      documentation_and_verification: this.clampRating(documentationChange.newRating),
      conversationsCount: currentRatings.conversationsCount + 1,
      lastUpdated: new Date().toISOString()
    };

    console.log('📈 RATING CHANGES APPLIED:');
    console.log('Overall:', overallChange.oldRating, '→', newRatings.overall, `(${overallChange.change > 0 ? '+' : ''}${overallChange.change})`);
    console.log('Clarity:', clarityChange.oldRating, '→', newRatings.clarity_and_specificity, `(${clarityChange.change > 0 ? '+' : ''}${clarityChange.change})`);
    console.log('Understanding:', understandingChange.oldRating, '→', newRatings.mutual_understanding, `(${understandingChange.change > 0 ? '+' : ''}${understandingChange.change})`);
    console.log('Problem Solving:', problemSolvingChange.oldRating, '→', newRatings.proactive_problem_solving, `(${problemSolvingChange.change > 0 ? '+' : ''}${problemSolvingChange.change})`);
    console.log('Customization:', customizationChange.oldRating, '→', newRatings.appropriate_customization, `(${customizationChange.change > 0 ? '+' : ''}${customizationChange.change})`);
    console.log('Documentation:', documentationChange.oldRating, '→', newRatings.documentation_and_verification, `(${documentationChange.change > 0 ? '+' : ''}${documentationChange.change})`);

    this.saveRatings(newRatings);
    return newRatings;
  }

  /**
   * Calculate rating change using modified ELO algorithm
   * Optimized for skill development with adaptive K-factor
   */
  private calculateRatingChange(currentRating: number, performanceScore: number, totalConversations: number): RatingChange {
    // Adaptive K-factor: Higher volatility for beginners, lower for experienced
    const kFactor = this.getKFactor(currentRating, totalConversations);
    
    // Convert 1-100 score to expected performance (0.0 to 1.0)
    const actualScore = performanceScore / 100;
    
    // Expected score based on current rating (skill level)
    // Higher rated players are expected to perform better
    const expectedScore = this.getExpectedScore(currentRating);
    
    // Calculate rating change
    const ratingChange = Math.round(kFactor * (actualScore - expectedScore));
    
    return {
      oldRating: currentRating,
      newRating: currentRating + ratingChange,
      change: ratingChange,
      performance: performanceScore
    };
  }

  /**
   * Get adaptive K-factor based on rating and experience
   */
  private getKFactor(rating: number, conversationsCount: number): number {
    // Beginners get higher volatility for faster progression
    if (conversationsCount < 10) return 40;
    if (rating < 1000) return 32;
    if (rating < 1400) return 24;
    if (rating < 1800) return 16;
    return 8; // Experts have lower volatility
  }

  /**
   * Calculate expected score based on current rating
   * Lower ratings expect lower performance, higher ratings expect higher performance
   */
  private getExpectedScore(rating: number): number {
    // Normalize rating to 0-1 scale, then adjust curve
    const normalized = (rating - this.MIN_RATING) / (this.MAX_RATING - this.MIN_RATING);
    
    // Sigmoid curve: expects gradual improvement with diminishing returns
    // Formula: 0.3 + 0.6 * sigmoid(normalized)
    const sigmoid = 1 / (1 + Math.exp(-6 * (normalized - 0.5)));
    return 0.3 + 0.6 * sigmoid;
  }

  /**
   * Ensure ratings stay within valid bounds
   */
  private clampRating(rating: number): number {
    return Math.max(this.MIN_RATING, Math.min(this.MAX_RATING, rating));
  }

  /**
   * Save ratings to localStorage
   */
  private saveRatings(ratings: UserRatings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings));
  }

  /**
   * Get skill level description based on rating
   */
  getSkillLevel(rating: number): string {
    if (rating >= 2000) return 'Master';
    if (rating >= 1800) return 'Expert';
    if (rating >= 1600) return 'Advanced';
    if (rating >= 1400) return 'Proficient';
    if (rating >= 1200) return 'Intermediate';
    if (rating >= 1000) return 'Developing';
    return 'Beginner';
  }

  /**
   * Reset all ratings (for testing)
   */
  resetRatings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🔄 All ratings reset to defaults');
  }
}

// Export singleton instance
export const ratingService = new RatingService();