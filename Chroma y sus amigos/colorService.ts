
import { GoogleGenAI } from "@google/genai";

export const PIGMENT_MAP: { [key: string]: [number, number, number] } = {
  'azul': [20, 80, 220],
  'negro': [10, 10, 20],
  'blanco': [255, 255, 255],
  'amarillo': [255, 230, 0],
  'rojo': [220, 40, 40]
};

export const getHexFromColorName = (name: string): string => {
  const [r, g, b] = PIGMENT_MAP[name] || [255, 255, 255];
  const toHex = (val: number) => Math.round(val).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const mixColors = (portions: { [key: string]: number }): string => {
  const total = Object.values(portions).reduce((a, b) => a + (b as number), 0);
  if (total === 0) return '#F0F0F0';

  let r = 0, g = 0, b = 0;
  const blackPortion = portions['negro'] || 0;
  const darknessFactor = 1 - (blackPortion / total) * 0.7; 

  for (const [color, amount] of Object.entries(portions)) {
    const [pr, pg, pb] = PIGMENT_MAP[color] || [255, 255, 255];
    const weight = (amount as number) / total;
    r += pr * weight;
    g += pg * weight;
    b += pb * weight;
  }

  r *= darknessFactor;
  g *= darknessFactor;
  b *= darknessFactor;

  const hex = (val: number) => {
    const clamped = Math.round(Math.min(255, Math.max(0, val)));
    return clamped.toString(16).padStart(2, '0');
  };
  
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

export const checkAccuracy = (current: {[k:string]: number}, target: {[k:string]: number}): number => {
  const totalCurrent = Object.values(current).reduce((a, b) => a + (b as number), 0);
  const totalTarget = Object.values(target).reduce((a, b) => a + (b as number), 0);
  if (totalCurrent === 0 || totalTarget === 0) return 0;
  let totalDiff = 0;
  const allColors = Array.from(new Set([...Object.keys(current), ...Object.keys(target)]));
  allColors.forEach(color => {
    const pCurrent = (current[color] || 0) / totalCurrent;
    const pTarget = (target[color] || 0) / totalTarget;
    totalDiff += Math.abs(pCurrent - pTarget);
  });
  if (totalDiff <= 0.15) return 100;
  const score = Math.max(0, 100 - ((totalDiff - 0.15) * 60));
  return Math.round(score);
};

/**
 * AI Image Generation using Gemini 2.5 Flash Image
 */
export const generateAIImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, friendly, 3D animated style character for a children's educational app. ${prompt}. Soft lighting, clean white background, vibrant colors, 4k resolution.` }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Generation failed:", error);
    return null;
  }
};
