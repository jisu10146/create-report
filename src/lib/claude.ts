import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

/** 토큰 사용량 추적 */
export interface TokenUsage {
  stage: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

const _tokenLog: TokenUsage[] = [];
let _currentStage = "unknown";

export function setStage(stage: string) { _currentStage = stage; }
export function getTokenLog(): TokenUsage[] { return [..._tokenLog]; }
export function resetTokenLog() { _tokenLog.length = 0; }
export function getTotalTokens(): { input: number; output: number; total: number } {
  const input = _tokenLog.reduce((a, t) => a + t.inputTokens, 0);
  const output = _tokenLog.reduce((a, t) => a + t.outputTokens, 0);
  return { input, output, total: input + output };
}

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

  // 토큰 사용량 기록
  const usage = response.usageMetadata;
  if (usage) {
    _tokenLog.push({
      stage: _currentStage,
      inputTokens: usage.promptTokenCount ?? 0,
      outputTokens: usage.candidatesTokenCount ?? 0,
      totalTokens: (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0),
    });
  }

  const text = (response.text ?? "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return text;
}

export default ai;
