export const GOALS = [
  { v: "hypertrophy", l: "Ganar músculo" },
  { v: "strength", l: "Fuerza máxima" },
  { v: "fat_loss", l: "Quemar grasa" },
  { v: "endurance", l: "Resistencia" },
];

export const LEVELS = [
  { v: "beginner", l: "Principiante" },
  { v: "intermediate", l: "Intermedio" },
  { v: "advanced", l: "Avanzado" },
];

export const MUSCLES = [
  { v: "Chest", l: "Pecho" },
  { v: "Back", l: "Espalda" },
  { v: "Shoulders", l: "Hombros" },
  { v: "Biceps", l: "Bíceps" },
  { v: "Triceps", l: "Tríceps" },
  { v: "Quadriceps", l: "Cuádriceps" },
  { v: "Hamstrings", l: "Isquiotibiales" },
  { v: "Glutes", l: "Glúteos" },
  { v: "Abs", l: "Core / Abs" },
  { v: "Calves", l: "Pantorrillas" },
];

export const EQUIP = [
  { v: "Dumbbells", l: "Mancuernas" },
  { v: "Barbell", l: "Barra" },
  { v: "Cables", l: "Poleas" },
  { v: "Machines", l: "Máquinas" },
  { v: "Bodyweight", l: "Peso corporal" },
];

export const QUOTES = [
  "NO PAIN, NO GAIN",
  "IRON NEVER LIES",
  "TRAIN HARD, WIN EASY",
  "EVERY REP COUNTS",
  "YOUR ONLY LIMIT IS YOU",
];

export const LEVEL_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const GOAL_LABELS = {
  hypertrophy: "Hipertrofia",
  strength: "Fuerza",
  fat_loss: "Definición",
  endurance: "Resistencia",
};

export const DEFAULT_WORKOUT_STATE = {
  goal: "hypertrophy",
  level: "intermediate",
  muscles: [],
  equip: ["Dumbbells"],
  dur: 45,
};

export const DEFAULT_PROFILE_DRAFT = {
  age: "",
  sex: "male",
  weight: "",
  height: "",
};
