
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, MODEL_NAME } from "../constants";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIResponse = async (history: Message[], prompt: string) => {
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.9,
    }
  });

  return response.text || "";
};

export const analyzeSentiment = async (text: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analiza el sentimiento de este texto y sugiere un audio adecuado según el Katarsis Engine.
    Texto: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotion: { type: Type.STRING, description: "Melancolía, Enojo, Agradecimiento o Neutral" },
          suggestion: { type: Type.STRING, description: "Breve frase poética sobre el audio" },
          audioFrequency: { type: Type.STRING, description: "Nombre de la frecuencia recomendada" }
        },
        required: ["emotion", "suggestion", "audioFrequency"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return { emotion: 'Neutral', suggestion: 'Silencio reflexivo', audioFrequency: '432Hz' };
  }
};
