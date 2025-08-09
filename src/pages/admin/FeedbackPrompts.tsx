// Feedback Prompt Management - Admin Interface
// Allows admins to configure AI feedback generation prompts

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserHeader from '../../components/layout/UserHeader';
import { feedbackService } from '../../services/feedbackService';

export default function FeedbackPrompts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadCurrentPrompt();
  }, [user, navigate]);

  const loadCurrentPrompt = async () => {
    try {
      // First check if there's a custom prompt saved in localStorage
      const customSavedPrompt = localStorage.getItem('skillcraft_custom_feedback_prompt');
      
      if (customSavedPrompt) {
        // If custom prompt exists, it's the active one
        setActivePrompt(customSavedPrompt);
        setCustomPrompt(customSavedPrompt);
        setLoading(false);
        console.log('✅ Loaded custom prompt from localStorage');
      } else {
        // Otherwise load the default from file
        const response = await fetch('/feedback_prompts.md');
        if (!response.ok) {
          throw new Error('Failed to load feedback prompts');
        }
        
        const content = await response.text();
        
        // Extract the active prompt section (everything under "Default Setting Expectations Prompt")
        const defaultPromptMatch = content.match(/## Default Setting Expectations Prompt\n\n([\s\S]*?)(?=\n## Alternative Prompts|\n---|\n$)/);
        if (defaultPromptMatch) {
          setActivePrompt(defaultPromptMatch[1].trim());
          setCustomPrompt(defaultPromptMatch[1].trim());
        }
        
        setLoading(false);
        console.log('✅ Loaded default prompt from file');
      }
    } catch (error) {
      console.error('Failed to load feedback prompts:', error);
      setStatus('error');
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    setSaving(true);
    setStatus('idle');
    
    try {
      // Check if we're saving the default prompt
      const response = await fetch('/feedback_prompts.md');
      const content = await response.text();
      const defaultPromptMatch = content.match(/## Default Setting Expectations Prompt\n\n([\s\S]*?)(?=\n## Alternative Prompts|\n---|\n$)/);
      const isDefault = defaultPromptMatch && defaultPromptMatch[1].trim() === customPrompt.trim();
      
      if (isDefault) {
        // If saving default, remove custom prompt from localStorage
        localStorage.removeItem('skillcraft_custom_feedback_prompt');
        localStorage.removeItem('skillcraft_feedback_config');
        console.log('✅ Reset to default prompt');
      } else {
        // Save custom prompt to localStorage
        localStorage.setItem('skillcraft_custom_feedback_prompt', customPrompt);
        
        // Also save metadata
        const savedData = {
          prompt: customPrompt,
          timestamp: new Date().toISOString(),
          adminId: user?.id
        };
        
        localStorage.setItem('skillcraft_feedback_config', JSON.stringify(savedData));
        console.log('✅ Custom feedback prompt saved');
      }
      
      // Clear the cached prompt in feedback service to force reload
      feedbackService.clearCachedPrompt();
      
      setActivePrompt(customPrompt);
      setStatus('success');
      
      console.log('✅ Feedback prompt saved successfully and cache cleared');
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Failed to save feedback prompt:', error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    try {
      const response = await fetch('/feedback_prompts.md');
      const content = await response.text();
      
      const defaultPromptMatch = content.match(/## Default Setting Expectations Prompt\n\n([\s\S]*?)(?=\n## Alternative Prompts|\n---|\n$)/);
      if (defaultPromptMatch) {
        const defaultPrompt = defaultPromptMatch[1].trim();
        setCustomPrompt(defaultPrompt);
        
        // If user wants to save this as the active prompt, they need to click Save
        // Just updating the editor for now
        console.log('✅ Reset editor to default prompt (not saved yet)');
      }
    } catch (error) {
      console.error('Failed to reset prompt:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading feedback prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin Dashboard
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Feedback Prompts</h1>
                <p className="text-slate-600">Configure how AI analyzes conversations and provides feedback</p>
              </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">Feedback prompt updated successfully! Changes will apply to new conversations.</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">Failed to save feedback prompt. Please try again.</p>
              </div>
            )}

            {/* Current Active Prompt Display */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Currently Active Prompt
              </h2>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <p className="text-sm text-green-800 whitespace-pre-wrap">{activePrompt}</p>
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Edit Feedback Prompt</h2>
                <button
                  onClick={resetToDefault}
                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={20}
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter your custom feedback prompt here..."
              />
              
              <div className="mt-4 text-sm text-slate-600">
                <p className="mb-2"><strong>Tips for effective prompts:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Be specific about evaluation criteria and scoring scales</li>
                  <li>Include clear formatting requirements (JSON scores, structured sections)</li>
                  <li>Define the role and expertise of the AI evaluator</li>
                  <li>Specify the target audience (team leaders, specific skills)</li>
                  <li>Include examples of good vs. poor performance when helpful</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={savePrompt}
                disabled={saving || customPrompt.trim() === ''}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Prompt'}
              </button>
              
              <button
                onClick={() => setCustomPrompt(activePrompt)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel Changes
              </button>
            </div>

            {/* Information Box */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-900 mb-2">How Feedback Prompts Work</h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p>• The AI feedback system uses your custom prompt to analyze conversation transcripts</p>
                <p>• Prompts should include evaluation criteria, scoring methods, and response format requirements</p>
                <p>• Changes apply immediately to new conversations (existing conversations use the original prompt)</p>
                <p>• The system expects structured output including JSON scores and categorized feedback</p>
                <p>• Test your prompts with sample conversations to ensure they generate useful feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}