// Character Management Admin Interface - PRD 4.1.2
// CRUD operations for AI characters with ElevenLabs agent integration

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
  User,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { characterService, type Character } from '../../services/characterService';
import { elevenLabsService, type ElevenLabsAgent } from '../../services/elevenLabsService';
import UserHeader from '../../components/layout/UserHeader';

interface CharacterFormData {
  id?: number;
  name: string;
  personalContext: string;
  characterDescription: string;
  complexityLevel: number;
  elevenLabsAgentId?: string;
  elevenLabsAgentName?: string;
  elevenLabsVoiceId?: string;
  elevenLabsVoiceName?: string;
  elevenLabsVoiceGender?: 'male' | 'female' | 'unknown';
}

export default function CharacterManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [availableAgents, setAvailableAgents] = useState<ElevenLabsAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
      console.log('🔄 Loading characters from characterService...');
      const characterData = await characterService.getAllCharacters();
      setCharacters(characterData);
      console.log('✅ Loaded', characterData.length, 'characters');
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to load characters:', error);
      setLoading(false);
    }
  };

  const loadElevenLabsAgents = async () => {
    setLoadingAgents(true);
    try {
      console.log('🔄 Fetching ElevenLabs agents...');
      const agents = await elevenLabsService.fetchAgents();
      setAvailableAgents(agents);
      console.log('✅ Loaded', agents.length, 'ElevenLabs agents');
    } catch (error: any) {
      console.error('❌ Failed to load ElevenLabs agents:', error);
      alert(`Failed to load ElevenLabs agents: ${error.message}`);
    } finally {
      setLoadingAgents(false);
    }
  };

  const getEmptyFormData = (): CharacterFormData => ({
    name: '',
    personalContext: '',
    characterDescription: '',
    complexityLevel: 1,
    elevenLabsAgentId: undefined,
    elevenLabsAgentName: undefined,
    elevenLabsVoiceId: undefined,
    elevenLabsVoiceName: undefined,
    elevenLabsVoiceGender: undefined
  });

  const startCreating = async () => {
    setEditingCharacter(getEmptyFormData());
    setIsCreating(true);
    
    // Auto-load agents when creating/editing
    if (availableAgents.length === 0) {
      await loadElevenLabsAgents();
    }
  };

  const startEditing = async (character: Character) => {
    setEditingCharacter({
      id: character.id,
      name: character.name,
      personalContext: character.personalContext,
      characterDescription: character.characterDescription,
      complexityLevel: character.complexityLevel,
      elevenLabsAgentId: character.elevenLabsAgentId,
      elevenLabsAgentName: character.elevenLabsAgentName,
      elevenLabsVoiceId: character.elevenLabsVoiceId,
      elevenLabsVoiceName: character.elevenLabsVoiceName,
      elevenLabsVoiceGender: character.elevenLabsVoiceGender
    });
    setIsCreating(false);
    
    // Auto-load agents when creating/editing
    if (availableAgents.length === 0) {
      await loadElevenLabsAgents();
    }
  };

  const cancelEditing = () => {
    setEditingCharacter(null);
    setIsCreating(false);
  };

  const handleAgentSelection = (agentId: string) => {
    if (!editingCharacter) return;
    
    const selectedAgent = availableAgents.find(agent => agent.agent_id === agentId);
    if (selectedAgent) {
      setEditingCharacter({
        ...editingCharacter,
        elevenLabsAgentId: selectedAgent.agent_id,
        elevenLabsAgentName: selectedAgent.name,
        elevenLabsVoiceId: selectedAgent.voice_id,
        elevenLabsVoiceName: selectedAgent.voice_name,
        elevenLabsVoiceGender: selectedAgent.voice_gender
      });
      
      console.log('✅ Agent selected:', {
        agent: selectedAgent.name,
        voice: selectedAgent.voice_name,
        gender: selectedAgent.voice_gender
      });
    }
  };

  const saveCharacter = async () => {
    if (!editingCharacter) return;
    
    try {
      console.log('💾 Saving character:', editingCharacter.name);
      
      const characterToSave: Character = {
        id: editingCharacter.id || 0,
        name: editingCharacter.name,
        personalContext: editingCharacter.personalContext,
        characterDescription: editingCharacter.characterDescription,
        complexityLevel: editingCharacter.complexityLevel,
        elevenLabsAgentId: editingCharacter.elevenLabsAgentId,
        elevenLabsAgentName: editingCharacter.elevenLabsAgentName,
        elevenLabsVoiceId: editingCharacter.elevenLabsVoiceId,
        elevenLabsVoiceName: editingCharacter.elevenLabsVoiceName,
        elevenLabsVoiceGender: editingCharacter.elevenLabsVoiceGender
      };
      
      const savedCharacter = await characterService.saveCharacter(characterToSave);
      
      // Update local state
      if (isCreating) {
        setCharacters([...characters, savedCharacter]);
      } else {
        setCharacters(characters.map(c => 
          c.id === savedCharacter.id ? savedCharacter : c
        ));
      }
      
      cancelEditing();
      alert(isCreating ? 'Character created successfully!' : 'Character updated successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to save character:', error);
      alert(`Failed to save character: ${error.message}`);
    }
  };

  const deleteCharacter = async (id: number) => {
    try {
      const success = await characterService.deleteCharacter(id);
      if (success) {
        setCharacters(characters.filter(c => c.id !== id));
        setDeleteConfirm(null);
        alert('Character deleted successfully!');
      } else {
        alert('Failed to delete character.');
      }
    } catch (error: any) {
      console.error('❌ Failed to delete character:', error);
      alert(`Failed to delete character: ${error.message}`);
    }
  };

  const getComplexityColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-600';
    if (level <= 7) return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
  };

  const getVoiceGenderColor = (gender?: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-600';
      case 'female': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
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
              <p className="text-slate-600">Manage AI characters and assign ElevenLabs voices</p>
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

                {/* Text Areas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personal Context *
                  </label>
                  <textarea
                    value={editingCharacter.personalContext}
                    onChange={(e) => setEditingCharacter({...editingCharacter, personalContext: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Character's background, experience, and context"
                  />
                </div>

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

                {/* ElevenLabs Agent Selection */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-blue-600" />
                      ElevenLabs Agent Assignment
                    </h3>
                    <button
                      onClick={loadElevenLabsAgents}
                      disabled={loadingAgents}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        loadingAgents 
                          ? 'bg-gray-400 cursor-not-allowed text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loadingAgents ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Refresh Agents
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select ElevenLabs Agent
                    </label>
                    <select
                      value={editingCharacter.elevenLabsAgentId || ''}
                      onChange={(e) => handleAgentSelection(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingAgents}
                    >
                      <option value="">Select an agent...</option>
                      {availableAgents.map(agent => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.name} ({agent.voice_name || 'Unknown Voice'} - {agent.voice_gender || 'Unknown'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {editingCharacter.elevenLabsAgentId && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Agent Name</label>
                        <div className="text-sm font-mono text-slate-800">{editingCharacter.elevenLabsAgentName}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Agent ID</label>
                        <div className="text-xs font-mono text-slate-600">{editingCharacter.elevenLabsAgentId}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Voice Name</label>
                        <div className="text-sm font-mono text-slate-800">{editingCharacter.elevenLabsVoiceName}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Voice Gender</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getVoiceGenderColor(editingCharacter.elevenLabsVoiceGender)}`}>
                          {editingCharacter.elevenLabsVoiceGender || 'unknown'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {availableAgents.length === 0 && !loadingAgents && (
                    <div className="text-center py-4 text-slate-500">
                      <p>No agents loaded. Click "Refresh Agents" to fetch from ElevenLabs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Character List
            <div>
              {characters.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
                <div className="space-y-4">
                  {characters.map((character) => (
                    <div key={character.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-slate-900">{character.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(character.complexityLevel)}`}>
                            Complexity {character.complexityLevel}
                          </span>
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
                      
                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-medium text-slate-800 mb-1">Personal Context:</h4>
                          <p className="text-sm text-slate-700">{character.personalContext}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-800 mb-1">Character Description:</h4>
                          <p className="text-sm text-slate-700">{character.characterDescription}</p>
                        </div>
                        
                        {/* ElevenLabs Agent Info */}
                        {character.elevenLabsAgentId ? (
                          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">ElevenLabs Agent Assigned</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 text-sm text-green-700">
                              <div>
                                <span className="font-medium">Agent:</span> {character.elevenLabsAgentName}
                              </div>
                              <div>
                                <span className="font-medium">Voice:</span> {character.elevenLabsVoiceName}
                                {character.elevenLabsVoiceGender && (
                                  <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getVoiceGenderColor(character.elevenLabsVoiceGender)}`}>
                                    {character.elevenLabsVoiceGender}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">No ElevenLabs Agent Assigned</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                              Edit this character to assign an ElevenLabs agent for voice conversations.
                            </p>
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
                Are you sure you want to delete this character? All associated data will be permanently removed.
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