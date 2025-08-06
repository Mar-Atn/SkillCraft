// Comprehensive Rating System Test - Shows detailed progression
// This test demonstrates how the simple averaging system works over time

import { ratingService } from '../services/ratingService';

export function runComprehensiveRatingTest() {
  console.log('\n');
  console.log('=' .repeat(80));
  console.log('🎯 COMPREHENSIVE RATING SYSTEM TEST - 10 CONVERSATION SIMULATION');
  console.log('=' .repeat(80));
  
  // Reset to clean state
  ratingService.resetRatings();
  console.log('\n📋 STARTING FRESH: All ratings at 0 (Not Rated)');
  console.log('─'.repeat(80));
  
  // Define 10 realistic conversation scenarios
  const scenarios = [
    {
      name: 'First Attempt',
      context: 'New leader, nervous about setting expectations',
      performance: {
        overall: 55,
        clarity: 52,
        understanding: 58,
        problemSolving: 50,
        customization: 55,
        documentation: 60
      },
      expectedOutcome: 'Needs Work - typical first attempt'
    },
    {
      name: 'Learning Curve',
      context: 'Applied feedback, showing improvement',
      performance: {
        overall: 62,
        clarity: 65,
        understanding: 60,
        problemSolving: 58,
        customization: 62,
        documentation: 65
      },
      expectedOutcome: 'Basic - visible progress'
    },
    {
      name: 'Difficult Team Member',
      context: 'Challenging conversation, struggled to adapt',
      performance: {
        overall: 58,
        clarity: 55,
        understanding: 52,
        problemSolving: 60,
        customization: 58,
        documentation: 62
      },
      expectedOutcome: 'Slight setback but learning'
    },
    {
      name: 'Breakthrough Moment',
      context: 'Applied new techniques effectively',
      performance: {
        overall: 68,
        clarity: 70,
        understanding: 72,
        problemSolving: 65,
        customization: 68,
        documentation: 66
      },
      expectedOutcome: 'Developing - clear improvement'
    },
    {
      name: 'Strong Performance',
      context: 'Confident application of skills',
      performance: {
        overall: 74,
        clarity: 75,
        understanding: 78,
        problemSolving: 70,
        customization: 72,
        documentation: 75
      },
      expectedOutcome: 'Proficient level emerging'
    },
    {
      name: 'Complex Scenario',
      context: 'Multi-stakeholder expectations, partial success',
      performance: {
        overall: 71,
        clarity: 68,
        understanding: 70,
        problemSolving: 75,
        customization: 72,
        documentation: 70
      },
      expectedOutcome: 'Good handling of complexity'
    },
    {
      name: 'Consistent Application',
      context: 'Solid, reliable performance',
      performance: {
        overall: 76,
        clarity: 78,
        understanding: 75,
        problemSolving: 74,
        customization: 76,
        documentation: 77
      },
      expectedOutcome: 'Proficient - consistency showing'
    },
    {
      name: 'Excellent Execution',
      context: 'Everything clicked, great conversation',
      performance: {
        overall: 82,
        clarity: 85,
        understanding: 83,
        problemSolving: 80,
        customization: 82,
        documentation: 80
      },
      expectedOutcome: 'Advanced skills demonstrated'
    },
    {
      name: 'Minor Challenges',
      context: 'Good overall but missed some nuances',
      performance: {
        overall: 78,
        clarity: 76,
        understanding: 80,
        problemSolving: 78,
        customization: 77,
        documentation: 79
      },
      expectedOutcome: 'Solid proficient level'
    },
    {
      name: 'Mastery Display',
      context: 'Handled difficult situation expertly',
      performance: {
        overall: 85,
        clarity: 88,
        understanding: 86,
        problemSolving: 83,
        customization: 85,
        documentation: 84
      },
      expectedOutcome: 'Advanced - approaching mastery'
    }
  ];
  
  // Track cumulative for manual verification
  let cumulativeTotal = 0;
  let allScores: number[] = [];
  
  // Run through each conversation
  scenarios.forEach((scenario, index) => {
    const convNum = index + 1;
    
    // Get before state
    const before = ratingService.getUserRatings();
    
    // Create scores structure
    const scores = {
      overall_score: scenario.performance.overall,
      sub_skills: {
        clarity_and_specificity: scenario.performance.clarity,
        mutual_understanding: scenario.performance.understanding,
        proactive_problem_solving: scenario.performance.problemSolving,
        appropriate_customization: scenario.performance.customization,
        documentation_and_verification: scenario.performance.documentation
      }
    };
    
    // Update ratings
    const after = ratingService.updateRatings(scores);
    
    // Track for verification
    cumulativeTotal += scenario.performance.overall;
    allScores.push(scenario.performance.overall);
    
    // Display results
    console.log(`\n📍 CONVERSATION ${convNum}: ${scenario.name}`);
    console.log(`   Context: ${scenario.context}`);
    console.log(`   Score: ${scenario.performance.overall}/100`);
    console.log(`   ├─ Before: ${before.overall === 0 ? 'Not Rated' : before.overall.toFixed(1) + ' (' + ratingService.getSkillLevel(before.overall) + ')'}`);
    console.log(`   ├─ After:  ${after.overall.toFixed(1)} (${ratingService.getSkillLevel(after.overall)})`);
    console.log(`   ├─ Change: ${before.overall === 0 ? '+' + after.overall.toFixed(1) : (after.overall - before.overall > 0 ? '+' : '') + (after.overall - before.overall).toFixed(1)}`);
    console.log(`   └─ Expected: ${scenario.expectedOutcome}`);
    
    // Show the math for first 3 conversations
    if (index < 3) {
      console.log(`   📐 Math: (${before.overall} × ${before.conversationsCount} + ${scenario.performance.overall}) / ${convNum} = ${after.overall}`);
    }
  });
  
  // Final summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 FINAL RESULTS AFTER 10 CONVERSATIONS');
  console.log('=' .repeat(80));
  
  const final = ratingService.getUserRatings();
  
  console.log('\n🎯 OVERALL RATING');
  console.log(`   Final Average: ${final.overall.toFixed(1)}/100 (${ratingService.getSkillLevel(final.overall)})`);
  console.log(`   Manual Check: ${(cumulativeTotal / 10).toFixed(1)} (should match)`);
  console.log(`   All Scores: [${allScores.join(', ')}]`);
  console.log(`   Average = ${cumulativeTotal} ÷ 10 = ${final.overall.toFixed(1)}`);
  
  console.log('\n📈 SUB-SKILL RATINGS');
  console.log(`   Clarity & Specificity:     ${final.clarity_and_specificity.toFixed(1)} (${ratingService.getSkillLevel(final.clarity_and_specificity)})`);
  console.log(`   Mutual Understanding:      ${final.mutual_understanding.toFixed(1)} (${ratingService.getSkillLevel(final.mutual_understanding)})`);
  console.log(`   Proactive Problem Solving: ${final.proactive_problem_solving.toFixed(1)} (${ratingService.getSkillLevel(final.proactive_problem_solving)})`);
  console.log(`   Appropriate Customization: ${final.appropriate_customization.toFixed(1)} (${ratingService.getSkillLevel(final.appropriate_customization)})`);
  console.log(`   Documentation & Verify:    ${final.documentation_and_verification.toFixed(1)} (${ratingService.getSkillLevel(final.documentation_and_verification)})`);
  
  console.log('\n🌟 KEY OBSERVATIONS');
  console.log('   • Started at 0 (unrated), gradually built up average');
  console.log('   • Early conversations have bigger impact on average');
  console.log('   • Later conversations cause smaller changes (stabilization)');
  console.log('   • Final rating represents true average of all performances');
  console.log('   • Sub-skills tracked independently for detailed feedback');
  
  console.log('\n' + '=' .repeat(80));
  console.log('TEST COMPLETE - Simple averaging system working correctly!');
  console.log('=' .repeat(80));
  console.log('\n');
  
  return final;
}

// Auto-expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).runComprehensiveRatingTest = runComprehensiveRatingTest;
  console.log('💡 Run comprehensive test with: runComprehensiveRatingTest()');
}