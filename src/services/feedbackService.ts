// Gemini Feedback Service - Sprint 2
// Uses Gemini as default model per user request
// Admin prompt loaded from AI_feedback.md (PRD 4.1.3)

const GEMINI_API_KEY = 'AIzaSyC1eczAbf38_I2QZDekkPEa21FpROjFKtc';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
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

interface FeedbackResult {
  scores: ConversationScores | null;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallAssessment: string;
  rawResponse: string;
}

export class FeedbackService {
  private adminPrompt: string | null = null;

  /**
   * Load admin-defined prompt from AI_feedback.md
   */
  async loadAdminPrompt(): Promise<string> {
    if (this.adminPrompt) {
      return this.adminPrompt;
    }

    try {
      const response = await fetch('/AI_feedback.md');
      if (!response.ok) {
        throw new Error('Failed to load admin prompt');
      }
      
      this.adminPrompt = await response.text();
      console.log('✅ Admin prompt loaded from AI_feedback.md');
      return this.adminPrompt;
    } catch (error) {
      console.error('❌ Failed to load admin prompt:', error);
      // Fallback prompt
      this.adminPrompt = `
Analyze this setting expectations conversation and provide feedback on:
1. Clarity and Specificity
2. Two-Way Communication  
3. Supportive Approach
4. Practical Next Steps

Provide strengths, areas for improvement, and actionable recommendations.
      `.trim();
      return this.adminPrompt;
    }
  }

  /**
   * Generate feedback using Gemini AI
   */
  async generateFeedback(transcript: TranscriptMessage[]): Promise<FeedbackResult> {
    console.log('🤖 Generating Gemini feedback for transcript with', transcript.length, 'messages');

    try {
      // Load admin prompt
      const adminPrompt = await this.loadAdminPrompt();

      // Format transcript for analysis
      const conversationText = transcript.map(msg => {
        const speaker = msg.role === 'user' ? 'LEADER' : 'TEAM_MEMBER';
        return `${speaker}: ${msg.message}`;
      }).join('\n\n');

      // Construct full prompt
      const fullPrompt = `${adminPrompt}\n\n## CONVERSATION TRANSCRIPT:\n\n${conversationText}\n\nPlease provide your feedback analysis:`;

      // Call Gemini API (using correct model name)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH', 
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const feedbackText = data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini feedback generated successfully');
      console.log('Feedback length:', feedbackText.length, 'characters');

      // Parse scores from JSON format
      const scores = this.extractScores(feedbackText);

      // Parse the structured response (basic parsing)
      const result: FeedbackResult = {
        scores: scores,
        strengths: this.extractSection(feedbackText, 'STRENGTHS'),
        areasForImprovement: this.extractSection(feedbackText, 'AREAS FOR IMPROVEMENT'),
        recommendations: this.extractSection(feedbackText, 'ACTIONABLE RECOMMENDATIONS'),
        overallAssessment: this.extractSection(feedbackText, 'OVERALL ASSESSMENT')[0] || 'Assessment not provided',
        rawResponse: feedbackText
      };

      return result;

    } catch (error: any) {
      console.error('❌ Gemini feedback generation failed:', error);
      throw new Error(`Feedback generation failed: ${error.message}`);
    }
  }

  /**
   * Extract numerical scores from JSON format in feedback text
   */
  private extractScores(text: string): ConversationScores | null {
    try {
      // Look for JSON block in the response
      const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        // Try to find JSON without code blocks
        const directJsonMatch = text.match(/\{[\s\S]*?"overall_score"[\s\S]*?\}/);
        if (!directJsonMatch) {
          console.warn('⚠️ No JSON scores found in feedback response');
          return null;
        }
        return JSON.parse(directJsonMatch[0]);
      }

      const scoresData = JSON.parse(jsonMatch[1]);
      
      // Validate structure
      if (!scoresData.overall_score || !scoresData.sub_skills) {
        console.warn('⚠️ Invalid scores structure in feedback response');
        return null;
      }

      console.log('🎯 SCORES EXTRACTED SUCCESSFULLY!');
      console.log('Overall Score:', scoresData.overall_score);
      console.log('Sub-skills:', scoresData.sub_skills);

      return scoresData as ConversationScores;

    } catch (error) {
      console.error('❌ Failed to parse scores from feedback:', error);
      return null;
    }
  }

  /**
   * Extract sections from structured feedback text
   */
  private extractSection(text: string, sectionName: string): string[] {
    const regex = new RegExp(`\\*\\*${sectionName}:?\\*\\*([^*]+)(?=\\*\\*|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) {
      return [];
    }

    // Split by bullet points or new lines and clean up
    return match[1]
      .split(/[-•\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();