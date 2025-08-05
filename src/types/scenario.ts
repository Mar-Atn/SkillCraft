export interface Scenario {
  id: number;
  title: string;
  generalContext: string;
  humanInstructions: string;
  aiInstructions: string;
  learningObjectives: string[];
  focusPoints: string[];
  debriefingPoints: string[];
  difficultyLevel: number;
}

export interface ScenarioData {
  scenarios: Scenario[];
  totalScenarios: number;
  difficultyRange: string;
  focusArea: string;
}

export interface SelectedScenario {
  scenario: Scenario;
  roleType: 'human' | 'ai';
  instructions: string;
}

export interface ScenarioContextProps {
  scenario: Scenario | null;
}