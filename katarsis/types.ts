
export enum RitualStage {
  INTRO = 'INTRO',
  STEP_BACK = 'STEP_BACK',
  ALCHEMIST = 'ALCHEMIST',
  CLOSURE = 'CLOSURE',
  FINAL_RITUAL = 'FINAL_RITUAL'
}

export enum ClosureAction {
  TRUNK = 'TRUNK',
  PYRE = 'PYRE',
  MESSENGER = 'MESSENGER'
}

export interface SentimentAnalysis {
  emotion: 'Melancolía' | 'Enojo' | 'Agradecimiento' | 'Neutral';
  suggestion: string;
  audioFrequency: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
