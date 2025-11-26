import { GoogleGenAI, Type } from "@google/genai";
import { Category, Story } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSeedStories = async (count: number = 5): Promise<Story[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning empty seed.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} distinct, emotional, short stories about 'firsts' in people's lives.
      They should be located in diverse real-world locations (latitude/longitude).
      The categories must be one of: First Kiss, First Heartbreak, First Job, First Ocean, First Travel.
      The text should be 1-2 sentences max.
      The year should be realistic (1950-2024).
      Include City, State (or Region), and Country for every story.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: Object.values(Category) },
              year: { type: Type.INTEGER },
              text: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              city: { type: Type.STRING },
              state: { type: Type.STRING },
              country: { type: Type.STRING }
            },
            required: ["category", "year", "text", "lat", "lng", "city", "country"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        ...item,
        id: `seed-${Date.now()}-${index}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to generate seed stories:", error);
    return [];
  }
};