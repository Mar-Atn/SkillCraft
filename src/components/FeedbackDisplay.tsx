// Feedback Display Component - Shows AI feedback and scores after conversation
// Displays both conversation scores and detailed feedback

import { CheckCircle, TrendingUp, Target, Users, FileText, Award, Lightbulb } from 'lucide-react';

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

interface FeedbackData {
  scores: ConversationScores | null;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallAssessment: string;
  rawResponse: string;
  newRating?: number;
  previousRating?: number;
  skillLevel?: string;
}

interface FeedbackDisplayProps {
  feedback: FeedbackData;
  onClose: () => void;
}

export default function FeedbackDisplay({ feedback, onClose }: FeedbackDisplayProps) {
  // Clean the feedback text by removing the JSON scores block
  const cleanFeedbackText = (text: string): string => {
    if (!text) return '';
    
    // Remove JSON code blocks (```json ... ```)
    const withoutJsonBlocks = text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '');
    
    // Remove standalone JSON objects that might not be in code blocks
    const withoutStandaloneJson = withoutJsonBlocks.replace(/\{\s*"overall_score"[\s\S]*?\}\s*\n*/g, '');
    
    // Clean up extra whitespace and line breaks
    const cleaned = withoutStandaloneJson.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    return cleaned;
  };

  // Convert markdown-like text to JSX elements
  const renderFormattedFeedback = (text: string) => {
    if (!text) return <span className="text-gray-500">No detailed feedback available</span>;
    
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'bullet' | 'none' = 'none';
    
    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="ml-4 my-2 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex">
                <span className="text-blue-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        listType = 'none';
      }
    };
    
    lines.forEach((line, index) => {
      // Check for headers (lines starting with ## or ###)
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-semibold text-gray-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mt-4 mb-3">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Check for bullet points
      else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const bulletContent = line.replace(/^[-*•]\s+/, '');
        currentList.push(bulletContent);
        listType = 'bullet';
      }
      // Check for bold text lines (lines starting with **)
      else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        flushList();
        const boldText = line.replace(/^\*\*|\*\*$/g, '');
        elements.push(
          <h4 key={`bold-${index}`} className="font-semibold text-gray-800 mt-3 mb-2">
            {boldText}
          </h4>
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        flushList();
        // Process inline bold text
        const processedLine = line.replace(/\*\*(.*?)\*\*/g, (match, p1) => p1);
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 mb-2">
            {processedLine}
          </p>
        );
      }
    });
    
    // Flush any remaining list
    flushList();
    
    return <div className="space-y-2">{elements}</div>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const skillIcons = {
    clarity_and_specificity: Target,
    mutual_understanding: Users,
    proactive_problem_solving: TrendingUp,
    appropriate_customization: CheckCircle,
    documentation_and_verification: FileText
  };

  const skillNames = {
    clarity_and_specificity: 'Clarity & Specificity',
    mutual_understanding: 'Mutual Understanding',
    proactive_problem_solving: 'Problem Solving',
    appropriate_customization: 'Customization',
    documentation_and_verification: 'Documentation'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Conversation Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score Section */}
          {feedback.scores && (
            <div className={`rounded-lg border-2 p-6 ${getScoreBgColor(feedback.scores.overall_score)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-bold">Conversation Score</h3>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(feedback.scores.overall_score)}`}>
                    {feedback.scores.overall_score}/100
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This conversation
                  </div>
                </div>
              </div>

              {/* Sub-skills Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {Object.entries(feedback.scores.sub_skills).map(([skill, score]) => {
                  const Icon = skillIcons[skill as keyof typeof skillIcons];
                  return (
                    <div key={skill} className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {skillNames[skill as keyof typeof skillNames]}
                        </span>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(score)}`}>
                        {score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rating Update */}
          {feedback.previousRating !== undefined && feedback.newRating !== undefined && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Your Rating Updated:</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{feedback.previousRating.toFixed(1)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-xl font-bold text-blue-600">{feedback.newRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-600">({feedback.skillLevel})</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Using EWMA formula: 25% weight to this score, 75% to your history
              </div>
            </div>
          )}

          {/* Personal Feedback - Formatted Text */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h4 className="text-xl font-semibold text-gray-900">Personal Feedback</h4>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              {renderFormattedFeedback(cleanFeedbackText(feedback.rawResponse))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue to Next Practice
          </button>
        </div>
      </div>
    </div>
  );
}