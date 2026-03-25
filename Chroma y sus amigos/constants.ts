
import { ColorData, Sticker, World } from './types';

const ACCESSORIES = [
  '🕶️', '👑', '🎩', '🦸‍♂️', '🎈', 
  '🎸', '🍦', '🍕', '⚽', '🎨',
  '🎀', '🎧', '🚀', '⭐', '🍀'
];

export const WORLDS: World[] = [
  {
    id: 'bosque',
    name: 'Bosque de Chroma',
    biome: 'Bosque',
    icon: '🦎',
    requiredLevel: 0,
    description: '¡Aprende los colores básicos con Chroma!'
  },
  {
    id: 'oceano',
    name: 'Océano de Olly',
    biome: 'Oceano',
    icon: '🐋',
    requiredLevel: 11,
    description: 'Explora las profundidades marinas con Olly.'
  }
];

export const COLORS: ColorData[] = [
  // --- MUNDO 1: BOSQUE DE CHROMA (1-10) ---
  {
    id: 'verde-hoja', level: 1, worldId: 'bosque', name: 'Verde Hoja', hex: '#4CAF50',
    targetProportions: { 'amarillo': 2, 'azul': 2 }, fractionDisplay: '2/4 Amarillo + 2/4 Azul'
  },
  {
    id: 'naranja-sol', level: 2, worldId: 'bosque', name: 'Naranja Atardecer', hex: '#FF9800',
    targetProportions: { 'rojo': 2, 'amarillo': 2 }, fractionDisplay: '2/4 Rojo + 2/4 Amarillo'
  },
  {
    id: 'morado-uva', level: 3, worldId: 'bosque', name: 'Morado Uva', hex: '#9C27B0',
    targetProportions: { 'rojo': 2, 'azul': 2 }, fractionDisplay: '2/4 Rojo + 2/4 Azul'
  },
  {
    id: 'celeste-cielo', level: 4, worldId: 'bosque', name: 'Celeste Cielo', hex: '#81D4FA',
    targetProportions: { 'azul': 2, 'blanco': 2 }, fractionDisplay: '2/4 Azul + 2/4 Blanco'
  },
  {
    id: 'rosado-pastel', level: 5, worldId: 'bosque', name: 'Rosado Pastel', hex: '#F48FB1',
    targetProportions: { 'rojo': 1, 'blanco': 3 }, fractionDisplay: '1/4 Rojo + 3/4 Blanco'
  },
  {
    id: 'gris-humo', level: 6, worldId: 'bosque', name: 'Gris Humo', hex: '#9E9E9E',
    targetProportions: { 'negro': 1, 'blanco': 3 }, fractionDisplay: '1/4 Negro + 3/4 Blanco'
  },
  {
    id: 'azul-noche', level: 7, worldId: 'bosque', name: 'Azul Noche', hex: '#1A237E',
    targetProportions: { 'azul': 3, 'negro': 1 }, fractionDisplay: '3/4 Azul + 1/4 Negro'
  },
  {
    id: 'marron-tierra', level: 8, worldId: 'bosque', name: 'Marrón Tierra', hex: '#795548',
    targetProportions: { 'rojo': 1, 'amarillo': 2, 'negro': 1 }, fractionDisplay: '1/4 Rojo + 2/4 Amarillo + 1/4 Negro'
  },
  {
    id: 'turquesa-bosque', level: 9, worldId: 'bosque', name: 'Turquesa Bosque', hex: '#006064',
    targetProportions: { 'azul': 2, 'amarillo': 1, 'negro': 1 }, fractionDisplay: '2/4 Azul + 1/4 Amarillo + 1/4 Negro'
  },
  {
    id: 'verde-oliva', level: 10, worldId: 'bosque', name: 'Verde Oliva', hex: '#558B2F',
    targetProportions: { 'amarillo': 2, 'azul': 1, 'negro': 1 }, fractionDisplay: '2/4 Amarillo + 1/4 Azul + 1/4 Negro'
  },

  // --- MUNDO 2: OCÉANO DE OLLY (11-20) ---
  {
    id: 'azul-marino', level: 11, worldId: 'oceano', name: 'Azul Marino', hex: '#0D47A1',
    targetProportions: { 'azul': 3, 'negro': 1 }, fractionDisplay: '3/4 Azul + 1/4 Negro'
  },
  {
    id: 'celeste-glaciar', level: 12, worldId: 'oceano', name: 'Celeste Glaciar', hex: '#B3E5FC',
    targetProportions: { 'azul': 1, 'blanco': 3 }, fractionDisplay: '1/4 Azul + 3/4 Blanco'
  },
  {
    id: 'turquesa-tropical', level: 13, worldId: 'oceano', name: 'Turquesa Tropical', hex: '#00B8D4',
    targetProportions: { 'azul': 2, 'amarillo': 1, 'blanco': 1 }, fractionDisplay: '2/4 Azul + 1/4 Amarillo + 1/4 Blanco'
  },
  {
    id: 'violeta-medusa', level: 14, worldId: 'oceano', name: 'Violeta Medusa', hex: '#7E57C2',
    targetProportions: { 'azul': 2, 'rojo': 1, 'blanco': 1 }, fractionDisplay: '2/4 Azul + 1/4 Rojo + 1/4 Blanco'
  },
  {
    id: 'rosa-coral', level: 15, worldId: 'oceano', name: 'Rosa Coral', hex: '#FF8A80',
    targetProportions: { 'rojo': 2, 'amarillo': 1, 'blanco': 1 }, fractionDisplay: '2/4 Rojo + 1/4 Amarillo + 1/4 Blanco'
  },
  {
    id: 'naranja-nemo', level: 16, worldId: 'oceano', name: 'Naranja Nemo', hex: '#FF6D00',
    targetProportions: { 'rojo': 2, 'amarillo': 2 }, fractionDisplay: '2/4 Rojo + 2/4 Amarillo'
  },
  {
    id: 'verde-alga', level: 17, worldId: 'oceano', name: 'Verde Alga', hex: '#1B5E20',
    targetProportions: { 'azul': 2, 'amarillo': 1, 'negro': 1 }, fractionDisplay: '2/4 Azul + 1/4 Amarillo + 1/4 Negro'
  },
  {
    id: 'gris-perla', level: 18, worldId: 'oceano', name: 'Gris Perla', hex: '#CFD8DC',
    targetProportions: { 'negro': 1, 'blanco': 3 }, fractionDisplay: '1/4 Negro + 3/4 Blanco'
  },
  {
    id: 'oro-pirata', level: 19, worldId: 'oceano', name: 'Oro Pirata', hex: '#FFD600',
    targetProportions: { 'amarillo': 3, 'rojo': 1 }, fractionDisplay: '3/4 Amarillo + 1/4 Rojo'
  },
  {
    id: 'azul-abisal', level: 20, worldId: 'oceano', name: 'Azul Abisal', hex: '#010A1A',
    targetProportions: { 'azul': 1, 'negro': 3 }, fractionDisplay: '1/4 Azul + 3/4 Negro'
  }
];

export const INITIAL_STICKERS: Sticker[] = COLORS.map((c, index) => ({
  id: `sticker-${c.id}`,
  level: c.level,
  name: c.name,
  biome: c.worldId === 'bosque' ? 'Bosque' : 'Oceano',
  unlocked: false,
  colorHex: c.hex,
  accessory: ACCESSORIES[index % ACCESSORIES.length] // Asignar un accesorio único por nivel
}));

export const BIOME_THEMES = {
  Bosque: {
    primary: '#4caf50', secondary: '#2e7d32', accent: '#ffeb3b',
    friend: 'Chroma el Camaleón', food: 'Hoja Mágica',
    heroImg: 'https://img.icons8.com/color/240/chameleon.png'
  },
  Oceano: {
    primary: '#0ea5e9', secondary: '#0369a1', accent: '#fde047',
    friend: 'Olly la Orca', food: 'Sushi Redondo',
    heroImg: 'https://img.icons8.com/color/240/killer-whale.png'
  }
};
