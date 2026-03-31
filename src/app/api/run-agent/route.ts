import { NextRequest, NextResponse } from "next/server";
import { loadAgentDefinition } from "@/lib/reportNormalizer";
import { callClaude } from "@/lib/claude";
import { normalizeReport } from "@/lib/reportNormalizer";

export async function POST(req: NextRequest) {
  try {
    const { agentId, input } = await req.json() as { agentId: string; input: string };

    const agent = await loadAgentDefinition(agentId);
    const prompt = agent.promptTemplate.replace("{input}", input ?? "");

    const raw = await callClaude(prompt);
    const parsed = JSON.parse(raw);
    const report = normalizeReport(parsed, agent);

    return NextResponse.json(report);
  } catch (err) {
    console.error("[run-agent]", err);
    return NextResponse.json(
      { error: "리포트 생성 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
