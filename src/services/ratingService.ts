// Simple Average Rating Service - Sprint 4 Simplified
// Maintains running average of all conversation scores (0-100 scale)

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
   * Update ratings using simple averaging
   * New Average = (Previous Average × Count + New Score) / (Count + 1)
   */
  updateRatings(conversationScores: ConversationScores): UserRatings {
    const currentRatings = this.getUserRatings();
    const currentCount = currentRatings.conversationsCount;
    const newCount = currentCount + 1;

    console.log('📊 UPDATING AVERAGE RATINGS:');
    console.log('Previous ratings:', currentRatings);
    console.log('New scores:', conversationScores);

    // Calculate new averages for each skill
    const newRatings: UserRatings = {
      overall: this.calculateAverage(currentRatings.overall, currentCount, conversationScores.overall_score),
      clarity_and_specificity: this.calculateAverage(currentRatings.clarity_and_specificity, currentCount, conversationScores.sub_skills.clarity_and_specificity),
      mutual_understanding: this.calculateAverage(currentRatings.mutual_understanding, currentCount, conversationScores.sub_skills.mutual_understanding),
      proactive_problem_solving: this.calculateAverage(currentRatings.proactive_problem_solving, currentCount, conversationScores.sub_skills.proactive_problem_solving),
      appropriate_customization: this.calculateAverage(currentRatings.appropriate_customization, currentCount, conversationScores.sub_skills.appropriate_customization),
      documentation_and_verification: this.calculateAverage(currentRatings.documentation_and_verification, currentCount, conversationScores.sub_skills.documentation_and_verification),
      conversationsCount: newCount,
      lastUpdated: new Date().toISOString()
    };

    console.log('📈 NEW AVERAGE RATINGS:');
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
   * Calculate new average: (oldAvg × count + newScore) / (count + 1)
   * For first conversation (count = 0), just return the new score
   */
  private calculateAverage(currentAverage: number, conversationCount: number, newScore: number): number {
    if (conversationCount === 0) {
      // First conversation - return the score as the starting average
      return newScore;
    }
    
    // Calculate running average
    const totalPreviousPoints = currentAverage * conversationCount;
    const newAverage = (totalPreviousPoints + newScore) / (conversationCount + 1);
    
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