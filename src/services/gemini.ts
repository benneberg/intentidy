/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { PortableCard, Suggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function generateSuggestions(card: PortableCard): Promise<Suggestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given this software system card:
      ${JSON.stringify(card, null, 2)}
      
      Suggest 2-3 autonomous maintenance or improvement actions. 
      Focus on recent telemetry if available, or architectural gaps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["security", "performance", "feature", "test"] },
              message: { type: Type.STRING },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "type", "message", "actions"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}

export async function summarizeProject(context: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise 1-sentence semantic summary for this project context: ${context}. 
      Make it sound professional but technical.`,
    });
    return response.text || "Semantic summary unavailable.";
  } catch (error) {
    console.error("Error summarizing project:", error);
    return "Error generating summary.";
  }
}
