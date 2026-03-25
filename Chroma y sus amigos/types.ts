
export type Biome = 'Bosque' | 'Oceano' | 'Selva' | 'Savana';

export interface World {
  id: string;
  name: string;
  biome: Biome;
  icon: string;
  requiredLevel: number;
  description: string;
  characterImage?: string; // AI Generated character base64
}

export interface ColorData {
  id: string;
  level: number;
  worldId: string;
  name: string;
  hex: string;
  targetProportions: { [key: string]: number };
  fractionDisplay: string;
}

export interface Sticker {
  id: string;
  level: number;
  name: string;
  biome: Biome;
  unlocked: boolean;
  colorHex: string;
  accessory: string; 
  imageData?: string; // AI Generated base64 image
}

export interface GameState {
  currentLevel: number;
  currentBiome: Biome;
  unlockedWorlds: string[];
  stickers: Sticker[];
  mathProficiency: number;
  accuracyLevel: number;
  discoveryProgress: number;
  characterAvatars: { [key: string]: string }; // Store generated character images
}

export type View = 'home' | 'game' | 'album' | 'parents' | 'intro';
