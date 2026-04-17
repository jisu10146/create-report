import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { loadAgentDefinition } from "@/lib/reportNormalizer";
import { resetTokenLog, getTotalTokens } from "@/lib/claude";
import { runReportPipeline } from "@/agents/runner/pipeline";

export async function POST(req: NextRequest) {
  try {
    const { agentId, input, inputFile } = await req.json() as {
      agentId: string;
      input?: string;
      inputFile?: string;
    };

    // inputFile이 있으면 파일에서 읽기
    let resolvedInput = input ?? "";
    if (inputFile) {
      resolvedInput = readFileSync(join(process.cwd(), inputFile), "utf-8");
    }

    resetTokenLog();

    const agent = await loadAgentDefinition(agentId);
    const report = await runReportPipeline(agent, resolvedInput);

    const tokenUsage = getTotalTokens();
    console.log(`[token-usage] input: ${tokenUsage.input}, output: ${tokenUsage.output}, total: ${tokenUsage.total}`);

    return NextResponse.json({ ...report, _tokenUsage: tokenUsage });
  } catch (err) {
    console.error("[run-agent]", err);
    return NextResponse.json(
      { error: "리포트 생성 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
