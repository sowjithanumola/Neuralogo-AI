
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, DiscoveryQuestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateDiscoveryQuestions = async (name: string, concept: string): Promise<DiscoveryQuestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Brand Name: "${name}". Mission: "${concept}". Generate exactly 5 highly strategic discovery questions for a brand identity designer. The questions should help extract unique visual metaphors, desired brand personality (e.g., playful vs corporate), and specific aesthetic preferences.`,
    config: {
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
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
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
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
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
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Refinement engine failed.");
};
