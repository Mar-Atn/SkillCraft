import { useState } from 'react'
import VoiceConversation from '../components/voice/VoiceConversation'
import ScenarioSelector from '../components/scenarios/ScenarioSelector'
import type { Scenario } from '../types/scenario'

export default function PracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [showVoiceConversation, setShowVoiceConversation] = useState(false)

  const handleScenarioSelect = (scenario: Scenario | null) => {
    setSelectedScenario(scenario)
    setShowVoiceConversation(false) // Reset voice conversation when scenario changes
  }

  const startPractice = () => {
    if (selectedScenario) {
      setShowVoiceConversation(true)
    }
  }

  const backToScenarios = () => {
    setShowVoiceConversation(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Setting Expectations</h1>
        <p className="text-slate-600">
          {selectedScenario 
            ? `Selected: ${selectedScenario.title}` 
            : 'Choose a scenario to begin practicing'
          }
        </p>
      </div>

      {!showVoiceConversation ? (
        <div className="space-y-6">
          <ScenarioSelector 
            onScenarioSelect={handleScenarioSelect}
            selectedScenario={selectedScenario}
          />
          
          {selectedScenario && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Scenario Context</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {selectedScenario.generalContext}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Your Role (Team Lead)</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    {selectedScenario.humanInstructions.substring(0, 150)}...
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">AI Role (Team Member)</h4>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {selectedScenario.aiInstructions.substring(0, 150)}...
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={startPractice}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Voice Practice Session
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {selectedScenario && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">{selectedScenario.title}</h3>
                  <p className="text-blue-600 text-sm">Practice Session Active</p>
                </div>
                <button
                  onClick={backToScenarios}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Back to Scenarios
                </button>
              </div>
            </div>
          )}
          
          <VoiceConversation />
          
          {selectedScenario && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Quick Reference - Your Objectives:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedScenario.learningObjectives.slice(0, 3).map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}