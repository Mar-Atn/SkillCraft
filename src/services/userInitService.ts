// User Initialization Service
// Creates user profile when user first logs in

import { userDataService } from './userDataService';
import type { UserProfile } from '../types/user-data';

class UserInitService {
  initializeUser(userId: string, email: string, firstName?: string, lastName?: string, role: 'user' | 'admin' = 'user'): void {
    // Check if user profile already exists
    const existingProfile = userDataService.getUserProfile(userId);
    if (existingProfile) {
      // Update last activity
      existingProfile.lastActivity = new Date();
      userDataService.saveUserProfile(existingProfile);
      return;
    }

    // Create new user profile
    const newProfile: UserProfile = {
      userId,
      email,
      firstName,
      lastName,
      role,
      totalConversations: 0,
      averageRating: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    userDataService.saveUserProfile(newProfile);
    console.log('👤 User profile created for:', email);
  }

  updateUserActivity(userId: string): void {
    const profile = userDataService.getUserProfile(userId);
    if (profile) {
      profile.lastActivity = new Date();
      
      // Update conversation count from actual data
      const conversations = userDataService.getConversations(userId);
      profile.totalConversations = conversations.length;
      
      // Update average rating from progress
      const overallProgress = userDataService.getUserProgress(userId, 'overall');
      profile.averageRating = overallProgress?.currentRating || 0;
      
      userDataService.saveUserProfile(profile);
    }
  }
}

export const userInitService = new UserInitService();
export default userInitService;