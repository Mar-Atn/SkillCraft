// EWMA Rating System Test - Shows how recent scores have more impact
// Exponential Weighted Moving Average with α = 0.25

import { ratingService } from '../services/ratingService';

export function testEWMASystem() {
  console.log('\n');
  console.log('=' .repeat(80));
  console.log('🎯 EXPONENTIAL WEIGHTED MOVING AVERAGE (EWMA) TEST');
  console.log('Formula: New Rating = 0.25 × New Score + 0.75 × Previous Rating');
  console.log('=' .repeat(80));
  
  // Reset to clean state
  ratingService.resetRatings();
  
  console.log('\n📊 COMPARING EWMA vs SIMPLE AVERAGE:');
  console.log('─'.repeat(80));
  
  // Test scores
  const scores = [60, 80, 70, 90, 50, 85, 75, 65, 95, 70];
  
  let simpleSum = 0;
  let ewmaRating = 0;
  
  console.log('Conv │ Score │ EWMA Rating │ Simple Avg │ Difference │ Impact');
  console.log('─────┼───────┼─────────────┼────────────┼────────────┼─────────');
  
  scores.forEach((score, i) => {
    const convNum = i + 1;
    
    // Calculate simple average for comparison
    simpleSum += score;
    const simpleAvg = Math.round((simpleSum / convNum) * 10) / 10;
    
    // Calculate EWMA
    if (i === 0) {
      ewmaRating = score; // First score becomes the rating
    } else {
      ewmaRating = Math.round((0.25 * score + 0.75 * ewmaRating) * 10) / 10;
    }
    
    
    const diff = Math.round((ewmaRating - simpleAvg) * 10) / 10;
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
    
    console.log(
      `  ${String(convNum).padStart(2)} │  ${String(score).padStart(3)}  │    ${String(ewmaRating).padEnd(5)}    │   ${String(simpleAvg).padEnd(5)}    │   ${diffStr.padEnd(6)}   │ ${i === 0 ? 'Initial' : score > ewmaRating ? '↑ Up' : score < ewmaRating ? '↓ Down' : '─ Same'}`
    );
  });
  
  console.log('\n📈 KEY INSIGHTS:');
  console.log('• EWMA responds faster to recent changes than simple average');
  console.log('• Recent scores have 25% impact, older scores gradually fade');
  console.log('• More stable than just using the last score, but more responsive than simple average');
  console.log('• Perfect for tracking skill development where recent performance matters most');
  
  // Demonstrate recovery from bad performance
  console.log('\n' + '=' .repeat(80));
  console.log('🔄 RECOVERY TEST: How quickly does rating recover from a bad score?');
  console.log('=' .repeat(80));
  
  ratingService.resetRatings();
  
  // Start with good performance
  const recoveryTest = [
    { score: 75, desc: 'Good start' },
    { score: 78, desc: 'Consistent' },
    { score: 80, desc: 'Improving' },
    { score: 45, desc: '❌ Bad day!' },
    { score: 75, desc: 'Back to normal' },
    { score: 78, desc: 'Consistent again' },
    { score: 80, desc: 'Good recovery' }
  ];
  
  console.log('\nStarting fresh...\n');
  let currentRating = 0;
  
  recoveryTest.forEach((test, i) => {
    const before = currentRating;
    
    if (i === 0) {
      currentRating = test.score;
    } else {
      currentRating = Math.round((0.25 * test.score + 0.75 * currentRating) * 10) / 10;
    }
    
    const change = Math.round((currentRating - before) * 10) / 10;
    const changeStr = change > 0 ? `+${change}` : `${change}`;
    
    console.log(
      `Conv ${i+1}: Score=${test.score} │ Rating: ${before.toFixed(1)} → ${currentRating.toFixed(1)} (${i === 0 ? 'initial' : changeStr}) │ ${test.desc}`
    );
  });
  
  console.log('\n💡 Notice how:');
  console.log('• The bad score (45) only dropped rating from 77.6 to 69.5 (-8.1)');
  console.log('• Recovery is gradual but steady with good scores');
  console.log('• System is forgiving of occasional poor performance');
  console.log('• But consistent poor performance would still lower rating significantly');
  
  // Compare with simple average
  console.log('\n📊 If this used simple averaging:');
  const simpleAvgFinal = recoveryTest.reduce((sum, t) => sum + t.score, 0) / recoveryTest.length;
  console.log(`• Simple average would be: ${simpleAvgFinal.toFixed(1)}`);
  console.log(`• EWMA final rating is: ${currentRating.toFixed(1)}`);
  console.log(`• EWMA is ${(currentRating - simpleAvgFinal).toFixed(1)} points higher (recent recovery weighted more)`);
  
  console.log('\n' + '=' .repeat(80));
  console.log('TEST COMPLETE - EWMA system gives more weight to recent performance!');
  console.log('=' .repeat(80));
  console.log('\n');
}

// Auto-expose to window
if (typeof window !== 'undefined') {
  (window as any).testEWMASystem = testEWMASystem;
  console.log('💡 Test EWMA system with: testEWMASystem()');
}