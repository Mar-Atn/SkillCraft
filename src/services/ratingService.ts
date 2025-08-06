// Exponential Weighted Moving Average (EWMA) Rating Service
// Uses EWMA with α=0.25 to give more weight to recent scores (0-100 scale)

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
  private readonly STARTING_RATING = 0; // No rating until first conversation
  private readonly ALPHA = 0.25; // EWMA smoothing factor (25% weight to new scores)

  /**
   * Get current user ratings (creates default if not exists)
   */
  getUserRatings(): UserRatings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Check if this is old ELO data (ratings > 100 indicate old system)
        if (parsed.overall > 100) {
          console.log('🔄 Detected old ELO ratings, migrating to new averaging system...');
          this.resetRatings();
          return this.getUserRatings(); // Recurse to get fresh defaults
        }
        
        return parsed;
      } catch (error) {
        console.warn('Failed to parse stored ratings, creating defaults');
      }
    }

    // Create default ratings for new user (no ratings until first conversation)
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
   * Update ratings using Exponential Weighted Moving Average (EWMA)
   * New Average = α × New Score + (1 - α) × Previous Average
   * Where α = 0.25 (giving 25% weight to new score, 75% to history)
   * For first conversation (average = 0), new average = new score
   */
  updateRatings(conversationScores: ConversationScores): UserRatings {
    const currentRatings = this.getUserRatings();
    const currentCount = currentRatings.conversationsCount;
    const newCount = currentCount + 1;

    console.log('📊 UPDATING RATINGS WITH EWMA (α=0.25):');
    console.log('Previous ratings:', currentRatings);
    console.log('New scores:', conversationScores);

    // Calculate new ratings using EWMA for each skill
    const newRatings: UserRatings = {
      overall: this.calculateEWMA(currentRatings.overall, conversationScores.overall_score, currentCount),
      clarity_and_specificity: this.calculateEWMA(currentRatings.clarity_and_specificity, conversationScores.sub_skills.clarity_and_specificity, currentCount),
      mutual_understanding: this.calculateEWMA(currentRatings.mutual_understanding, conversationScores.sub_skills.mutual_understanding, currentCount),
      proactive_problem_solving: this.calculateEWMA(currentRatings.proactive_problem_solving, conversationScores.sub_skills.proactive_problem_solving, currentCount),
      appropriate_customization: this.calculateEWMA(currentRatings.appropriate_customization, conversationScores.sub_skills.appropriate_customization, currentCount),
      documentation_and_verification: this.calculateEWMA(currentRatings.documentation_and_verification, conversationScores.sub_skills.documentation_and_verification, currentCount),
      conversationsCount: newCount,
      lastUpdated: new Date().toISOString()
    };

    console.log('📈 NEW EWMA RATINGS:');
    console.log('Overall:', currentRatings.overall.toFixed(1), '→', newRatings.overall.toFixed(1));
    console.log('Clarity:', currentRatings.clarity_and_specificity.toFixed(1), '→', newRatings.clarity_and_specificity.toFixed(1));
    console.log('Understanding:', currentRatings.mutual_understanding.toFixed(1), '→', newRatings.mutual_understanding.toFixed(1));
    console.log('Problem Solving:', currentRatings.proactive_problem_solving.toFixed(1), '→', newRatings.proactive_problem_solving.toFixed(1));
    console.log('Customization:', currentRatings.appropriate_customization.toFixed(1), '→', newRatings.appropriate_customization.toFixed(1));
    console.log('Documentation:', currentRatings.documentation_and_verification.toFixed(1), '→', newRatings.documentation_and_verification.toFixed(1));
    console.log('Total Conversations:', newCount);

    this.saveRatings(newRatings);
    return newRatings;
  }

  /**
   * Calculate EWMA: α × newScore + (1 - α) × currentAverage
   * For first conversation (count = 0 or average = 0), return the new score
   * α = 0.25 gives 25% weight to new score, 75% to history
   */
  private calculateEWMA(currentAverage: number, newScore: number, conversationCount: number): number {
    // First conversation or no history - return the new score
    if (conversationCount === 0 || currentAverage === 0) {
      return newScore;
    }
    
    // Apply EWMA formula: new = α × new_score + (1 - α) × old_average
    const newAverage = this.ALPHA * newScore + (1 - this.ALPHA) * currentAverage;
    
    // Round to 1 decimal place
    return Math.round(newAverage * 10) / 10;
  }

  /**
   * Get skill level description based on average rating (0-100 scale)
   */
  getSkillLevel(rating: number): string {
    if (rating === 0) return 'Not Rated';
    if (rating >= 90) return 'Exceptional';
    if (rating >= 80) return 'Advanced';
    if (rating >= 70) return 'Proficient';
    if (rating >= 60) return 'Developing';
    if (rating >= 50) return 'Basic';
    return 'Needs Work';
  }

  /**
   * Save ratings to localStorage
   */
  private saveRatings(ratings: UserRatings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings));
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