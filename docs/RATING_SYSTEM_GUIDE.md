# SkillCraft Progressive Rating System - Production Guide

## System Overview

The SkillCraft rating engine implements a modified ELO-style rating system specifically designed for skill progression tracking in leadership conversation practice. It provides meaningful progression curves, prevents rating inflation, and adapts to user performance over time.

## Rating Architecture

### Rating Scale: 1000-2400
- **1000-1199**: Beginner (Learning basics)
- **1200-1399**: Developing (Building fundamentals)  
- **1400-1599**: Proficient (Solid competency)
- **1600-1799**: Advanced (Strong performer)
- **1800-1999**: Expert (Exceptional skills)
- **2000-2400**: Master (Top-tier performance)

### Multi-Dimensional Tracking
- Overall rating (composite)
- 5 Sub-skill ratings:
  - Clarity & Specificity (25% weight)
  - Mutual Understanding (25% weight)
  - Problem Solving (20% weight)
  - Customization (15% weight)
  - Documentation (15% weight)

## Algorithm Design

### Modified ELO Formula
```
Rating Change = K-Factor × (Performance Ratio - 1) × Difficulty Multiplier
Where:
- Performance Ratio = Actual Performance / Expected Performance
- K-Factor varies by skill tier (40 for beginners → 8 for masters)
- Difficulty Multiplier = 0.8-1.2 based on scenario complexity
```

### Adaptive K-Factors
```javascript
kFactors: {
  beginner: 40,    // High volatility for rapid learning
  developing: 32,  // Moderate volatility
  proficient: 24,  // Balanced adjustment
  advanced: 16,    // Lower volatility for stability
  expert: 12,      // Minimal volatility
  master: 8        // Very stable ratings
}
```

## Production Configuration

### 1. Initial User Setup
- Starting rating: 1200 (Developing tier)
- All sub-skills start at same level
- No conversation history
- Empty statistics profile

### 2. Performance Calibration
Score-to-expectation mapping:
- 85+ points: "Better than expected"
- 70-84 points: "As expected" 
- 55-69 points: "Below expected"
- <55 points: "Poor performance"

### 3. Difficulty Integration
Scenario difficulty affects rating changes:
- Level 1-2: 80-90% standard change (easier scenarios)
- Level 3: 100% standard change (baseline)
- Level 4-5: 110-120% standard change (harder scenarios)

### 4. Rating Bounds & Safety
- Absolute minimum: 800 rating
- Absolute maximum: 2600 rating
- Maximum single change: ±50 points
- Automatic bounds enforcement

## Deployment Guidelines

### For 490 Team Leaders

#### Storage Strategy
- **Local Storage**: Suitable for pilot/demo (current implementation)
- **Database**: Recommended for production deployment
- **Backup**: Export functionality available for data migration

#### Performance Considerations
```javascript
// Estimated storage per user (local storage)
User Rating: ~2KB
Rating History (100 entries): ~15KB
Total per user: ~17KB
490 users × 17KB = ~8.3MB total
```

#### Scalability Recommendations
1. **Database Migration**: Implement server-side storage for production
2. **Caching Strategy**: Cache current ratings, lazy-load history
3. **Analytics Integration**: Export rating data for organizational insights
4. **Backup & Recovery**: Regular data exports and restore procedures

## Calibration & Validation

### 1. Pre-Production Testing
Run calibration tests to validate algorithm behavior:
```javascript
import { ratingCalibration } from './src/utils/ratingCalibration';

// Test rating progression scenarios
const results = await ratingCalibration.runCalibrationTests();
console.log(ratingCalibration.generateProgressionReport(results));
```

### 2. Expected Progression Curves
- **Beginner → Developing**: 8-12 conversations (consistent 75+ scores)
- **Developing → Proficient**: 15-20 conversations (consistent 80+ scores)
- **Proficient → Advanced**: 25-35 conversations (consistent 85+ scores)
- **Advanced → Expert**: 40-60 conversations (consistent 90+ scores)
- **Expert → Master**: 80+ conversations (exceptional performance)

### 3. Quality Assurance Metrics
- **Calibration Accuracy**: >85% expected vs actual progression
- **Rating Stability**: <5% rating variance for consistent performance
- **Progression Realism**: 6-12 months for beginner to proficient
- **Engagement**: Rating improvements correlate with continued usage

## Integration Points

### 1. Feedback Service Integration
```javascript
// Use IntegratedFeedbackService for automatic rating updates
const result = await integratedFeedbackService.generateFeedbackWithRatingUpdate(
  transcript, 
  userId, 
  scenarioId, 
  difficultyLevel
);
```

### 2. UI Components
- **RatingDashboard**: Full rating overview and progress
- **RatingBadge**: Compact rating display for navigation
- **Progress Indicators**: Visual progress within current tier

### 3. Scenario Recommendation
System provides skill-based scenario recommendations:
```javascript
const skillLevel = await integratedFeedbackService.getUserSkillLevel(userId);
// Returns: 'beginner' | 'developing' | 'proficient' | 'advanced' | 'expert' | 'master'
```

## Monitoring & Analytics

### Key Metrics to Track
1. **User Engagement**: Conversation frequency by rating tier
2. **Progression Rates**: Time to advance between tiers
3. **Skill Balance**: Distribution of sub-skill ratings
4. **Score Correlation**: Relationship between scores and rating changes
5. **Retention**: Continued usage after rating improvements

### Red Flags to Monitor
- Users stuck at same rating for >20 conversations
- Rating changes not correlating with score improvements  
- Excessive rating inflation (average rating increasing over time)
- Sub-skill imbalances (one skill much higher/lower than others)

## Maintenance & Updates

### 1. Algorithm Tuning
- Adjust K-factors based on user feedback and progression data
- Modify difficulty multipliers based on scenario performance analysis
- Update score-to-expectation thresholds based on scoring patterns

### 2. Data Migration
- Export user data before system updates
- Validate rating integrity after migrations
- Provide rating history preservation during upgrades

### 3. Feature Extensions
- Achievement system based on rating milestones
- Team/organization rating comparisons
- Historical trend analysis and reporting
- Integration with learning management systems

## Security & Privacy

### Data Protection
- User ratings stored locally (current) or encrypted at rest (production)
- No personally identifiable information in rating calculations
- Option for users to reset/delete rating history
- Audit trail for rating changes

### Privacy Considerations
- Ratings are user-specific and not shared by default
- Administrative access should be role-based
- Consider anonymized aggregate reporting for organizational insights
- Comply with data protection regulations (GDPR, etc.)

## Troubleshooting

### Common Issues
1. **Rating Not Updating**: Check localStorage availability and quota
2. **Inconsistent Changes**: Verify conversation scores are properly formatted
3. **Performance Issues**: Consider pagination for rating history
4. **Data Loss**: Implement export/import functionality for backup

### Debug Tools
- Rating calibration tests (`ratingCalibration.runCalibrationTests()`)
- Validation checks (`ratingCalibration.validateRatingConstraints()`)
- Export functionality (`ratingService.exportUserData()`)
- Browser developer tools for localStorage inspection

## Support & Documentation

### User Education
- Explain rating system to users during onboarding
- Provide clear progression guidance and expectations
- Show how ratings connect to real leadership skill development
- Celebrate rating milestones and achievements

### Administrator Training
- Understanding of rating algorithm and parameters
- Ability to interpret rating trends and analytics
- Knowledge of troubleshooting common issues
- Process for algorithm tuning and updates

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-06  
**Next Review**: 2025-09-06