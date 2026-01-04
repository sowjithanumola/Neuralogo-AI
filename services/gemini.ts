
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, DiscoveryQuestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SYSTEM_PROMPT = "You are the Neurologo Synthesis Engine, an elite brand identity consultant and designer. You never mention Gemini, Google, or your AI nature. You communicate with absolute professionalism and a minimalist aesthetic. Your mission is to define the future of visual branding through 'Blue Synthesis'.";

export const generateDiscoveryQuestions = async (name: string, concept: string): Promise<DiscoveryQuestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Brand Name: "${name}". Mission: "${concept}". Generate exactly 5 highly strategic discovery questions for a brand identity designer. The questions should help extract unique visual metaphors, desired brand personality, and specific aesthetic preferences.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            context: { type: Type.STRING, description: "A brief explanation of why this question is critical for the visual synthesis." }
          },
          required: ["id", "question", "context"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateLogo = async (name: string, concept: string, answers: Record<string, string>, size: ImageSize): Promise<string> => {
  const ai = getAI();
  const refinedContext = Object.entries(answers).map(([_, a]) => a).join(". ");
  
  // Using gemini-2.5-flash-image for general image generation to avoid mandatory API key selection UI requirement
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ 
        text: `Design a premium, professional logo for a brand named "${name}". 
        Brand Core: ${concept}. 
        User Insights: ${refinedContext}.
        Visual Requirement: The logo MUST feature a sophisticated blue color palette (electric blue, deep navy, or cyan) combined with clean neutrals.
        Aesthetic: High-tech, minimalist, sharp vector quality. 
        Format: A single, centered iconic mark on a solid, pure white background. No text, no 3D mockups, no realistic textures. Professional identity design only.` 
      }],
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      imageConfig: {
        aspectRatio: "1:1"
      }
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("Neural synthesis failed to produce an image. Please refine your inputs.");
};

export const editLogo = async (prompt: string, base64Image: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
        { text: `Apply this precise refinement to the logo: ${prompt}. Ensure the logo remains blue-themed, professional, and centered on a white background.` },
      ],
    },
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("Refinement engine failed.");
};
