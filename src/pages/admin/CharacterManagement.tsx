// Character Management Admin Interface - PRD 4.1.2
// CRUD operations for AI characters with ElevenLabs voice integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  MessageSquare,
  AlertCircle,
  Volume2,
  RefreshCw,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserHeader from '../../components/layout/UserHeader';

interface Character {
  id: number;
  name: string;
  personalContext: string;
  characterDescription: string;
  complexityLevel: number;
  voiceId?: string;
  voiceName?: string;
}

interface CharacterFormData {
  id?: number;
  name: string;
  personalContext: string;
  characterDescription: string;
  complexityLevel: number;
  voiceId?: string;
  voiceName?: string;
}

export default function CharacterManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<CharacterFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  // Mock data for demonstration
  const mockCharacters: Character[] = [
    {
      id: 1,
      name: "Sarah Mitchell",
      personalContext: "Senior Marketing Manager with 8 years experience. Direct communication style, results-oriented.",
      characterDescription: "Experienced professional who values efficiency and clear expectations. Can be impatient with unclear instructions.",
      complexityLevel: 3,
      voiceId: "voice_001",
      voiceName: "Professional Female"
    },
    {
      id: 2,
      name: "David Chen",
      personalContext: "New graduate, enthusiastic but overwhelmed. First corporate job, eager to learn.",
      characterDescription: "Recent graduate who asks many questions and needs detailed guidance. Sometimes misunderstands instructions.",
      complexityLevel: 2,
      voiceId: "voice_002", 
      voiceName: "Young Male Professional"
    },
    {
      id: 3,
      name: "Karen Williams",
      personalContext: "Veteran employee, 15 years with company. Resistant to change, skeptical of new processes.",
      characterDescription: "Experienced but set in her ways. Challenges new ideas and needs strong justification for changes.",
      complexityLevel: 7,
      voiceId: "voice_003",
      voiceName: "Mature Female Authority"
    }
  ];

  useEffect(() => {
    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadCharacters();
  }, [user, navigate]);

  const loadCharacters = async () => {
    try {
      // TODO: Implement actual data loading from AI_characters.md
      setCharacters(mockCharacters);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load characters:', error);
      setLoading(false);
    }
  };

  const getEmptyFormData = (): CharacterFormData => ({
    name: '',
    personalContext: '',
    characterDescription: '',
    complexityLevel: 1,
    voiceId: undefined,
    voiceName: undefined
  });

  const startCreating = () => {
    setEditingCharacter(getEmptyFormData());
    setIsCreating(true);
  };

  const startEditing = (character: Character) => {
    setEditingCharacter({
      id: character.id,
      name: character.name,
      personalContext: character.personalContext,
      characterDescription: character.characterDescription,
      complexityLevel: character.complexityLevel,
      voiceId: character.voiceId,
      voiceName: character.voiceName
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingCharacter(null);
    setIsCreating(false);
  };

  const generateNewVoice = async () => {
    if (!editingCharacter) return;
    
    setGeneratingVoice(true);
    
    try {
      // TODO: Implement actual ElevenLabs voice generation
      // This would call ElevenLabs API to generate a new voice
      
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVoiceId = `voice_${Date.now()}`;
      const newVoiceName = `Generated Voice ${Math.floor(Math.random() * 1000)}`;
      
      setEditingCharacter({
        ...editingCharacter,
        voiceId: newVoiceId,
        voiceName: newVoiceName
      });
      
      alert('New voice generated successfully!');
      
    } catch (error) {
      console.error('Failed to generate voice:', error);
      alert('Failed to generate new voice. Please try again.');
    } finally {
      setGeneratingVoice(false);
    }
  };

  const saveCharacter = async () => {
    if (!editingCharacter) return;
    
    try {
      // TODO: Implement actual save functionality to AI_characters.md
      
      if (isCreating) {
        const newCharacter: Character = {
          ...editingCharacter,
          id: Math.max(...characters.map(c => c.id)) + 1
        };
        setCharacters([...characters, newCharacter]);
      } else {
        setCharacters(characters.map(c => 
          c.id === editingCharacter.id ? { ...editingCharacter } as Character : c
        ));
      }
      
      cancelEditing();
      alert(isCreating ? 'Character created successfully!' : 'Character updated successfully!');
      
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character. Please try again.');
    }
  };

  const deleteCharacter = async (id: number) => {
    try {
      // TODO: Implement actual delete functionality
      setCharacters(characters.filter(c => c.id !== id));
      setDeleteConfirm(null);
      alert('Character deleted successfully!');
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert('Failed to delete character. Please try again.');
    }
  };

  const getComplexityColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-700';
    if (level <= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getComplexityLabel = (level: number) => {
    if (level <= 3) return 'Easy';
    if (level <= 7) return 'Moderate';
    return 'Challenging';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading characters...</p>
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
          
          <div className="flex items-center gap-3">
            <button
              onClick={startCreating}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Character
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Character Management</h1>
              <p className="text-slate-600">Create and manage AI characters for training scenarios</p>
            </div>
          </div>

          {editingCharacter ? (
            // Character Edit Form
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreating ? 'Create New Character' : 'Edit Character'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={saveCharacter}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Character Name *
                    </label>
                    <input
                      type="text"
                      value={editingCharacter.name}
                      onChange={(e) => setEditingCharacter({...editingCharacter, name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter character name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Complexity Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingCharacter.complexityLevel}
                      onChange={(e) => setEditingCharacter({...editingCharacter, complexityLevel: parseInt(e.target.value)})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Personal Context */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personal Context *
                  </label>
                  <textarea
                    value={editingCharacter.personalContext}
                    onChange={(e) => setEditingCharacter({...editingCharacter, personalContext: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Background information about the character (role, experience, personality)"
                  />
                </div>

                {/* Character Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Character Description *
                  </label>
                  <textarea
                    value={editingCharacter.characterDescription}
                    onChange={(e) => setEditingCharacter({...editingCharacter, characterDescription: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Detailed description of character behavior, communication style, and traits"
                  />
                </div>

                {/* Voice Settings */}
                <div className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    ElevenLabs Voice Settings
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Voice ID
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.voiceId || ''}
                        onChange={(e) => setEditingCharacter({...editingCharacter, voiceId: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Auto-generated voice ID"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Voice Name
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.voiceName || ''}
                        onChange={(e) => setEditingCharacter({...editingCharacter, voiceName: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Voice description"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={generateNewVoice}
                    disabled={generatingVoice}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      generatingVoice 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {generatingVoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Voice...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Generate New Voice
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    Click to automatically generate a new voice from ElevenLabs based on character description
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Character List
            <div>
              {characters.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Characters Found</h3>
                  <p className="text-slate-500 mb-6">Get started by creating your first AI character.</p>
                  <button
                    onClick={startCreating}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Create First Character
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {characters.map((character) => (
                    <div key={character.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{character.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(character.complexityLevel)}`}>
                              Level {character.complexityLevel} • {getComplexityLabel(character.complexityLevel)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(character)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(character.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-slate-800 mb-1">Personal Context:</h4>
                          <p className="text-sm text-slate-700">{character.personalContext}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-800 mb-1">Character Description:</h4>
                          <p className="text-sm text-slate-700">{character.characterDescription}</p>
                        </div>
                        
                        {character.voiceName && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-blue-700">
                              <Volume2 className="w-4 h-4" />
                              <span className="font-medium text-sm">Voice: {character.voiceName}</span>
                            </div>
                            <span className="text-xs text-blue-600">ID: {character.voiceId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center gap-4 mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Delete Character</h3>
                  <p className="text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete this character? All associated voice data will be permanently removed.
              </p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCharacter(deleteConfirm)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Character
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}