import { NextRequest, NextResponse } from "next/server";
import {
  runTagAgent,
  parseAgentTag,
  isValidAgent,
  type AgentName,
  type TagContext,
} from "@/agents/runner/agent-tag";
import { resetTokenLog, getTotalTokens } from "@/lib/claude";

/**
 * POST /api/agent-tag
 *
 * 방법 1 — 직접 지정:
 *   { agent: "strategy-writer", task: "헤드라인 수정해줘", context: { ... } }
 *
 * 방법 2 — @태그 파싱:
 *   { message: "@strategy-writer 헤드라인 수정해줘", context: { ... } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let agent: AgentName;
    let task: string;

    // @태그 메시지에서 파싱
    if (body.message && !body.agent) {
      const parsed = parseAgentTag(body.message);
      if (!parsed) {
        return NextResponse.json(
          {
            error: "유효한 @에이전트 태그를 찾을 수 없습니다",
            available: [
              "data-analyst",
              "domain-expert",
              "strategy-writer",
              "chart-specialist",
              "sample-generator",
              "persona-critic",
            ],
          },
          { status: 400 },
        );
      }
      agent = parsed.agent;
      task = parsed.task;
    } else if (body.agent && body.task) {
      if (!isValidAgent(body.agent)) {
        return NextResponse.json(
          { error: `알 수 없는 에이전트: ${body.agent}` },
          { status: 400 },
        );
      }
      agent = body.agent;
      task = body.task;
    } else {
      return NextResponse.json(
        { error: "message 또는 agent+task 필수" },
        { status: 400 },
      );
    }

    const context: TagContext = body.context ?? {};

    resetTokenLog();
    const raw = await runTagAgent(agent, task, context);
    const tokenUsage = getTotalTokens();

    // JSON 파싱 시도
    let result: unknown;
    try {
      result = JSON.parse(raw);
    } catch {
      result = raw;
    }

    return NextResponse.json({ agent, result, _tokenUsage: tokenUsage });
  } catch (error) {
    console.error("[agent-tag] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
