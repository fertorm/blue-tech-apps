export const CARDIO_TYPES = [
  { v: "hiit", l: "HIIT" },
  { v: "steady_state", l: "Steady State" },
  { v: "tabata", l: "Tabata" },
  { v: "circuit", l: "Circuito" },
];

export const CARDIO_INTENSITIES = [
  { v: "low", l: "Baja" },
  { v: "medium", l: "Media" },
  { v: "high", l: "Alta" },
];

export const CARDIO_DURATIONS = [15, 20, 30, 45];

export const CARDIO_INTENSITY_LABELS = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const CARDIO_TYPE_LABELS = {
  hiit: "HIIT",
  steady_state: "Steady State",
  tabata: "Tabata",
  circuit: "Circuito",
};

export const DEFAULT_CARDIO_STATE = {
  type: "hiit",
  intensity: "medium",
  dur: 30,
};
