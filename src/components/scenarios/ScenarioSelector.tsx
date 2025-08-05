import React, { useState, useEffect } from 'react';
import type { Scenario } from '../../types/scenario';
import { scenarioService } from '../../services/scenarioService';

interface ScenarioSelectorProps {
  onScenarioSelect: (scenario: Scenario | null) => void;
  selectedScenario: Scenario | null;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onScenarioSelect,
  selectedScenario
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setLoading(true);
        const scenarioData = await scenarioService.getAllScenarios();
        setScenarios(scenarioData);
      } catch (err) {
        setError('Failed to load scenarios. Please try again.');
        console.error('Error loading scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const getDifficultyColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Basic';
      case 3: return 'Intermediate';
      case 5: return 'Advanced';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">⚠ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Choose a Practice Scenario</h2>
        <p className="text-gray-600">Select a scenario to practice your expectation-setting skills</p>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedScenario?.id === scenario.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onScenarioSelect(scenario)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{scenario.title}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(scenario.difficultyLevel)}`}>
                Level {scenario.difficultyLevel} - {getDifficultyLabel(scenario.difficultyLevel)}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              {scenario.generalContext.substring(0, 200)}...
            </p>
            
            {scenario.learningObjectives.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Key Learning Objectives:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {scenario.learningObjectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                  {scenario.learningObjectives.length > 2 && (
                    <li className="text-gray-500 italic">
                      +{scenario.learningObjectives.length - 2} more objectives
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedScenario && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Selected: {selectedScenario.title}</h4>
              <p className="text-blue-600 text-sm">Ready to start practice session</p>
            </div>
            <button
              onClick={() => onScenarioSelect(null)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Change Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;