// Live Rating System Testing Utility
// Run these commands in browser console to see the averaging system in action

import { ratingService } from '../services/ratingService';

// Expose ratingService globally for console testing
(window as any).ratingService = ratingService;
(window as any).testRatingSystem = {
  
  // Test 1: Show current state
  showCurrentRatings() {
    const ratings = ratingService.getUserRatings();
    console.log('📊 CURRENT RATINGS:');
    console.log('Overall:', ratings.overall, '(' + ratingService.getSkillLevel(ratings.overall) + ')');
    console.log('Clarity:', ratings.clarity_and_specificity, '(' + ratingService.getSkillLevel(ratings.clarity_and_specificity) + ')');
    console.log('Understanding:', ratings.mutual_understanding, '(' + ratingService.getSkillLevel(ratings.mutual_understanding) + ')');
    console.log('Problem Solving:', ratings.proactive_problem_solving, '(' + ratingService.getSkillLevel(ratings.proactive_problem_solving) + ')');
    console.log('Customization:', ratings.appropriate_customization, '(' + ratingService.getSkillLevel(ratings.appropriate_customization) + ')');
    console.log('Documentation:', ratings.documentation_and_verification, '(' + ratingService.getSkillLevel(ratings.documentation_and_verification) + ')');
    console.log('Total Conversations:', ratings.conversationsCount);
    return ratings;
  },

  // Test 2: Simulate realistic 10-conversation progression
  simulateBeginnerJourney() {
    console.log('🌱 SIMULATING REALISTIC 10-CONVERSATION JOURNEY...');
    console.log('─'.repeat(60));
    ratingService.resetRatings();
    
    // Realistic scores: starts weak, gradual improvement with some variance
    const conversations = [
      { score: 55, desc: 'First attempt - nervous, unclear' },
      { score: 62, desc: 'Second try - slightly better' },
      { score: 58, desc: 'Third - had a setback' },
      { score: 68, desc: 'Fourth - good improvement' },
      { score: 74, desc: 'Fifth - breakthrough moment' },
      { score: 71, desc: 'Sixth - slight regression' },
      { score: 76, desc: 'Seventh - solid performance' },
      { score: 82, desc: 'Eighth - great conversation!' },
      { score: 78, desc: 'Ninth - good but not perfect' },
      { score: 85, desc: 'Tenth - excellent finale!' }
    ];
    
    console.log('Starting from: 0 (Not Rated)\n');
    
    let runningTotal = 0;
    conversations.forEach((conv, i) => {
      const mockScores = {
        overall_score: conv.score,
        sub_skills: {
          clarity_and_specificity: Math.max(0, Math.min(100, conv.score + Math.floor(Math.random() * 10 - 5))),
          mutual_understanding: Math.max(0, Math.min(100, conv.score + Math.floor(Math.random() * 10 - 5))),
          proactive_problem_solving: Math.max(0, Math.min(100, conv.score + Math.floor(Math.random() * 10 - 5))),
          appropriate_customization: Math.max(0, Math.min(100, conv.score + Math.floor(Math.random() * 10 - 5))),
          documentation_and_verification: Math.max(0, Math.min(100, conv.score + Math.floor(Math.random() * 10 - 5)))
        }
      };
      
      const before = ratingService.getUserRatings();
      const newRatings = ratingService.updateRatings(mockScores);
      runningTotal += conv.score;
      
      console.log(`Conv ${String(i+1).padStart(2)}: Score=${conv.score} │ Avg: ${before.overall.toFixed(1)} → ${newRatings.overall.toFixed(1)} │ ${ratingService.getSkillLevel(newRatings.overall).padEnd(11)} │ ${conv.desc}`);
      
      // Show calculation for first few
      if (i < 3) {
        console.log(`         Math: (${before.overall} × ${before.conversationsCount} + ${conv.score}) / ${i + 1} = ${newRatings.overall}`);
      }
    });
    
    console.log('\n─'.repeat(60));
    console.log('FINAL SUMMARY AFTER 10 CONVERSATIONS:');
    const final = this.showCurrentRatings();
    console.log('\n📊 Key Insights:');
    console.log('• Started at 0 (unrated), ended at', final.overall.toFixed(1));
    console.log('• Average improved gradually as skills developed');
    console.log('• Some conversations better than others (realistic variance)');
    console.log('• Final rating reflects cumulative performance over time');
    
    return final;
  },

  // Test 3: Compare first conversation vs experienced user averaging
  compareAveraging() {
    console.log('📈 COMPARING FIRST CONVERSATION VS EXPERIENCED USER AVERAGING...');
    
    // Reset to new user (0 conversations)
    ratingService.resetRatings();
    const newUserBefore = ratingService.getUserRatings().overall;
    
    // Great performance as new user
    const greatScores = {
      overall_score: 85,
      sub_skills: {
        clarity_and_specificity: 85, mutual_understanding: 85,
        proactive_problem_solving: 85, appropriate_customization: 85,
        documentation_and_verification: 85
      }
    };
    
    const newUserAfter = ratingService.updateRatings(greatScores).overall;
    const newUserChange = newUserAfter - newUserBefore;
    
    console.log(`🌱 NEW USER (0 convs): ${newUserBefore} → ${newUserAfter} (${newUserChange > 0 ? '+' : ''}${newUserChange})`);
    
    // Simulate experienced user (manually set average rating and conversations)
    const experiencedRatings = ratingService.getUserRatings();
    experiencedRatings.overall = 75.0;
    experiencedRatings.conversationsCount = 20;
    localStorage.setItem('skillcraft_ratings', JSON.stringify(experiencedRatings));
    
    const experiencedBefore = ratingService.getUserRatings().overall;
    const experiencedAfter = ratingService.updateRatings(greatScores).overall;
    const experiencedChange = Math.round((experiencedAfter - experiencedBefore) * 10) / 10;
    
    console.log(`🏆 EXPERIENCED USER (20 convs): ${experiencedBefore} → ${experiencedAfter} (${experiencedChange > 0 ? '+' : ''}${experiencedChange})`);
    console.log(`📊 New user gets full score (${newUserChange}), experienced user's average moves slowly (${experiencedChange})`);
  },

  // Test 4: Skill level progression demonstration  
  showSkillLevels() {
    console.log('🎖️ SKILL LEVEL TIERS (0-100 Scale):');
    [0, 45, 55, 65, 75, 85, 95].forEach(rating => {
      console.log(`${rating}: ${ratingService.getSkillLevel(rating)}`);
    });
  },

  // Test 5: Averaging calculation examples
  testAveragingMath() {
    console.log('🧮 AVERAGING CALCULATION EXAMPLES...');
    
    ratingService.resetRatings();
    
    const testCases = [
      { score: 60, desc: 'First conversation (60)' },
      { score: 80, desc: 'Second conversation (80)' }, 
      { score: 70, desc: 'Third conversation (70)' },
      { score: 90, desc: 'Fourth conversation (90)' }
    ];
    
    testCases.forEach((test, i) => {
      const before = ratingService.getUserRatings();
      const mockScores = {
        overall_score: test.score,
        sub_skills: {
          clarity_and_specificity: test.score,
          mutual_understanding: test.score,
          proactive_problem_solving: test.score,
          appropriate_customization: test.score,
          documentation_and_verification: test.score
        }
      };
      
      const after = ratingService.updateRatings(mockScores);
      
      if (i === 0) {
        console.log(`${test.desc}: 0 → ${after.overall} (first score becomes the average)`);
      } else {
        const expectedAverage = Math.round(((before.overall * before.conversationsCount) + test.score) / (before.conversationsCount + 1) * 10) / 10;
        console.log(`${test.desc}: ${before.overall} → ${after.overall} (expected: ${expectedAverage})`);
      }
    });
  }
};

console.log('🎮 SIMPLE AVERAGING RATING SYSTEM TEST COMMANDS LOADED!');
console.log('Try these in console:');
console.log('  testRatingSystem.showCurrentRatings()');
console.log('  testRatingSystem.simulateBeginnerJourney()');  
console.log('  testRatingSystem.compareAveraging()');
console.log('  testRatingSystem.showSkillLevels()');
console.log('  testRatingSystem.testAveragingMath()');
console.log('  ratingService.resetRatings() // Reset to defaults');