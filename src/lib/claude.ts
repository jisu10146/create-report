import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function callClaude(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction:
        systemPrompt ??
        "You are an expert B2B SaaS product designer and data analyst. Always respond with valid JSON only, no markdown fences.",
      maxOutputTokens: 8192,
    },
  });

  const text = (response.text ?? "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return text;
}

export default ai;
