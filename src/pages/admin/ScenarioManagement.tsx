// Scenario Management Admin Interface - PRD 4.1.1
// CRUD operations for training scenarios with file-based storage

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { scenarioService } from '../../services/scenarioService';
import { scenarioFileService } from '../../services/scenarioFileService';
import { characterService, type Character } from '../../services/characterService';
import UserHeader from '../../components/layout/UserHeader';
import type { Scenario } from '../../types/scenario';

interface ScenarioFormData {
  id?: number;
  title: string;
  generalContext: string;
  humanInstructions: string;
  aiInstructions: string;
  learningObjectives: string[];
  focusPoints: string[];
  debriefingPoints: string[];
  difficultyLevel: number;
  assignedCharacterId?: number;
  assignedCharacterName?: string;
}

export default function ScenarioManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScenario, setEditingScenario] = useState<ScenarioFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadScenarios();
  }, [user, navigate]);

  const loadScenarios = async () => {
    try {
      const [scenarioData, characterData] = await Promise.all([
        scenarioService.getAllScenarios(),
        characterService.getAllCharacters()
      ]);
      
      // Assign default characters to scenarios that don't have one
      const scenariosWithCharacters = await Promise.all(
        scenarioData.map(async (scenario) => {
          if (!scenario.assignedCharacterId) {
            const defaultChar = await characterService.getDefaultCharacterForScenario(scenario.difficultyLevel);
            return {
              ...scenario,
              assignedCharacterId: defaultChar?.id,
              assignedCharacterName: defaultChar?.name
            };
          }
          return scenario;
        })
      );
      
      setScenarios(scenariosWithCharacters);
      setCharacters(characterData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setLoading(false);
    }
  };

  const getEmptyFormData = (): ScenarioFormData => ({
    title: '',
    generalContext: '',
    humanInstructions: '',
    aiInstructions: '',
    learningObjectives: [''],
    focusPoints: [''],
    debriefingPoints: [''],
    difficultyLevel: 1,
    assignedCharacterId: undefined,
    assignedCharacterName: undefined
  });

  const startCreating = () => {
    setEditingScenario(getEmptyFormData());
    setIsCreating(true);
  };

  const startEditing = (scenario: Scenario) => {
    setEditingScenario({
      id: scenario.id,
      title: scenario.title,
      generalContext: scenario.generalContext,
      humanInstructions: scenario.humanInstructions,
      aiInstructions: scenario.aiInstructions,
      learningObjectives: [...scenario.learningObjectives],
      focusPoints: [...scenario.focusPoints],
      debriefingPoints: [...scenario.debriefingPoints],
      difficultyLevel: scenario.difficultyLevel,
      assignedCharacterId: scenario.assignedCharacterId,
      assignedCharacterName: scenario.assignedCharacterName
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingScenario(null);
    setIsCreating(false);
  };

  const updateArrayField = (field: 'learningObjectives' | 'focusPoints' | 'debriefingPoints', index: number, value: string) => {
    if (!editingScenario) return;
    
    const newArray = [...editingScenario[field]];
    newArray[index] = value;
    
    setEditingScenario({
      ...editingScenario,
      [field]: newArray
    });
  };

  const addArrayItem = (field: 'learningObjectives' | 'focusPoints' | 'debriefingPoints') => {
    if (!editingScenario) return;
    
    setEditingScenario({
      ...editingScenario,
      [field]: [...editingScenario[field], '']
    });
  };

  const removeArrayItem = (field: 'learningObjectives' | 'focusPoints' | 'debriefingPoints', index: number) => {
    if (!editingScenario) return;
    
    const newArray = editingScenario[field].filter((_, i) => i !== index);
    setEditingScenario({
      ...editingScenario,
      [field]: newArray
    });
  };

  const handleCharacterSelection = (characterId: string) => {
    if (!editingScenario) return;
    
    const selectedCharacter = characters.find(c => c.id === parseInt(characterId));
    setEditingScenario({
      ...editingScenario,
      assignedCharacterId: selectedCharacter?.id,
      assignedCharacterName: selectedCharacter?.name
    });
  };

  const saveScenario = async () => {
    if (!editingScenario) return;
    
    try {
      console.log('💾 ScenarioManagement: Saving scenario via scenarioFileService...');
      console.log('🔍 Scenario data being saved:', {
        title: editingScenario.title,
        assignedCharacterId: editingScenario.assignedCharacterId,
        assignedCharacterName: editingScenario.assignedCharacterName,
        fullData: editingScenario
      });
      
      // Create or update scenario
      let updatedScenarios: Scenario[];
      if (isCreating) {
        const newScenario: Scenario = {
          ...editingScenario,
          id: Math.max(...scenarios.map(s => s.id), 0) + 1
        };
        console.log('✅ New scenario created with character assignment:', newScenario);
        updatedScenarios = [...scenarios, newScenario];
        setScenarios(updatedScenarios);
      } else {
        const updatedScenario = { ...editingScenario } as Scenario;
        console.log('✅ Existing scenario updated with character assignment:', updatedScenario);
        updatedScenarios = scenarios.map(s => 
          s.id === editingScenario.id ? updatedScenario : s
        );
        setScenarios(updatedScenarios);
      }
      
      // BRIDGE: Save to persistent storage via scenarioFileService
      await scenarioFileService.saveScenarios(updatedScenarios);
      
      // Invalidate cache so dashboard sees new scenarios immediately
      scenarioFileService.invalidateScenarioCache();
      
      cancelEditing();
      
      console.log('✅ ScenarioManagement: Scenario saved and bridge updated');
      alert(isCreating ? 'Scenario created and saved successfully!' : 'Scenario updated and saved successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to save scenario:', error);
      alert(`Failed to save scenario: ${error.message}`);
    }
  };

  const deleteScenario = async (id: number) => {
    try {
      console.log('🗑️ ScenarioManagement: Deleting scenario ID:', id);
      
      // Update scenarios list (remove deleted scenario)
      const updatedScenarios = scenarios.filter(s => s.id !== id);
      setScenarios(updatedScenarios);
      
      // BRIDGE: Save updated list to persistent storage
      await scenarioFileService.saveScenarios(updatedScenarios);
      
      // Invalidate cache so dashboard sees changes immediately
      scenarioFileService.invalidateScenarioCache();
      
      setDeleteConfirm(null);
      
      console.log('✅ ScenarioManagement: Scenario deleted and bridge updated');
      alert('Scenario deleted successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to delete scenario:', error);
      alert(`Failed to delete scenario: ${error.message}`);
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-600';
    if (level <= 7) return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scenarios...</p>
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Scenario
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Scenario Management</h1>
              <p className="text-slate-600">Create, edit, and manage training scenarios</p>
            </div>
          </div>

          {editingScenario ? (
            // Scenario Edit Form
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreating ? 'Create New Scenario' : 'Edit Scenario'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={saveScenario}
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
                      Scenario Title *
                    </label>
                    <input
                      type="text"
                      value={editingScenario.title}
                      onChange={(e) => setEditingScenario({...editingScenario, title: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter scenario title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Difficulty Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingScenario.difficultyLevel}
                      onChange={(e) => setEditingScenario({...editingScenario, difficultyLevel: parseInt(e.target.value)})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Character Assignment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Assigned Character *
                    </label>
                    <button
                      onClick={() => navigate('/admin/characters')}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors underline"
                    >
                      Manage Characters
                    </button>
                  </div>
                  <select
                    value={editingScenario.assignedCharacterId || ''}
                    onChange={(e) => handleCharacterSelection(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a character...</option>
                    {characters.map(character => (
                      <option key={character.id} value={character.id}>
                        {character.name} (Complexity: {character.complexityLevel})
                      </option>
                    ))}
                  </select>
                  {editingScenario.assignedCharacterId && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      {(() => {
                        const selectedChar = characters.find(c => c.id === editingScenario.assignedCharacterId);
                        return selectedChar ? (
                          <div>
                            <button
                              onClick={() => navigate(`/admin/characters`)}
                              className="font-medium text-blue-900 mb-1 hover:text-blue-700 transition-colors underline"
                            >
                              {selectedChar.name}
                            </button>
                            <div className="text-sm text-blue-700 mb-2">{selectedChar.personalContext}</div>
                            <div className="text-xs text-blue-600">
                              Complexity Level {selectedChar.complexityLevel} • {selectedChar.voiceName}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Text Areas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    General Context *
                  </label>
                  <textarea
                    value={editingScenario.generalContext}
                    onChange={(e) => setEditingScenario({...editingScenario, generalContext: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Background information visible to both participants"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Human Instructions *
                  </label>
                  <textarea
                    value={editingScenario.humanInstructions}
                    onChange={(e) => setEditingScenario({...editingScenario, humanInstructions: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confidential instructions for human participant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    AI Instructions *
                  </label>
                  <textarea
                    value={editingScenario.aiInstructions}
                    onChange={(e) => setEditingScenario({...editingScenario, aiInstructions: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confidential instructions for AI participant"
                  />
                </div>

                {/* Dynamic Arrays */}
                {(['learningObjectives', 'focusPoints', 'debriefingPoints'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field === 'learningObjectives' ? 'Learning Objectives' : 
                       field === 'focusPoints' ? 'Focus Points' : 'Debriefing Points'}
                    </label>
                    <div className="space-y-2">
                      {editingScenario[field].map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateArrayField(field, index, e.target.value)}
                            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter ${field.slice(0, -1)}`}
                          />
                          <button
                            onClick={() => removeArrayItem(field, index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem(field)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add {field === 'learningObjectives' ? 'Objective' : 
                              field === 'focusPoints' ? 'Focus Point' : 'Debriefing Point'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Scenario List
            <div>
              {scenarios.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Scenarios Found</h3>
                  <p className="text-slate-500 mb-6">Get started by creating your first training scenario.</p>
                  <button
                    onClick={startCreating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Create First Scenario
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-slate-900">{scenario.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scenario.difficultyLevel)}`}>
                            Level {scenario.difficultyLevel}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(scenario)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(scenario.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 mb-4">{scenario.generalContext.substring(0, 200)}...</p>
                      
                      {/* Assigned Character */}
                      {scenario.assignedCharacterName && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-purple-800">Assigned Character:</span>
                            <button
                              onClick={() => navigate('/admin/characters')}
                              className="text-purple-700 hover:text-purple-900 transition-colors underline font-medium"
                            >
                              {scenario.assignedCharacterName}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Learning Objectives:</span>
                          <span className="ml-2 text-slate-800">{scenario.learningObjectives.length}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Focus Points:</span>
                          <span className="ml-2 text-slate-800">{scenario.focusPoints.length}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Debriefing Points:</span>
                          <span className="ml-2 text-slate-800">{scenario.debriefingPoints.length}</span>
                        </div>
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
                  <h3 className="text-xl font-bold text-slate-900">Delete Scenario</h3>
                  <p className="text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete this scenario? All associated data will be permanently removed.
              </p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteScenario(deleteConfirm)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Scenario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}