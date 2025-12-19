export type Phase = 'SPLASH' | 'MIXER' | 'MAP' | 'SCENARIO' | 'LOUNGE' | 'SUMMARY';

export type Axis = 'label' | 'action' | 'pull' | 'heart';

export interface Identity {
  label: number;
  action: number;
  pull: number;
  heart: number;
  vibeName: string;
  avatar: string;
}

export type DriverType = 
  | 'Binary Brain'
  | 'Choice Trap'
  | 'The Rulebook'
  | 'Disgust Reflex'
  | 'Hierarchy Guard'
  | 'Threat Alert'
  | 'Time Capsule'
  | 'The Authority';

export interface DriverDef {
  id: DriverType;
  name: string;
  definition: string;
  incorrectDefinitions: string[];
}

export type ScenarioID = 'office' | 'cafe' | 'campus' | 'park' | 'family';

export type CardType = 'Humor' | 'Facts' | 'Deflect' | 'Vulnerability';

export interface ScenarioData {
  id: ScenarioID;
  title: string;
  description: string;
  rigidity: number; // 0-100
  relevantAxes: Axis[];
  correctDrivers: DriverType[]; // Array to support Challenge scenario (needs both)
  bestCards: CardType[];
  isChallenge: boolean;
  setupText: string;
  privilegedSetupText?: string; // Text for "Conventional" profiles
  cardDialogues: Record<CardType, string>; // Dialogue for standard play
  privilegedCardDialogues?: Record<CardType, string>; // Dialogue for privileged play
  correctResponse: string;
  wrongResponse: string;
  gradient: string;
}

export interface GameState {
  phase: Phase;
  identity: Identity;
  battery: number;
  xp: number;
  scenariosCompleted: ScenarioID[];
  loungeVisits: number;
  powerUpsOwned: ('Extra Battery' | 'Shield' | 'Insight')[];
  powerUpsUsed: string[];
  driversEncountered: Record<string, number>;
  frictionByAxis: Record<Axis, number>;
  activeScenarioId: ScenarioID | null;
  history: GameHistory[];
}

export interface GameHistory {
  scenarioId: ScenarioID;
  driversIdentified: boolean;
  batteryChange: number;
}