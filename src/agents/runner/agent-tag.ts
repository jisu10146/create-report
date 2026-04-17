/**
 * Agent Tag — @에이전트 태그로 특정 에이전트에게 직접 작업 지시
 *
 * 사용 예:
 *   @sample-generator nps-distribution 섹션 body를 두괄식으로 다시 써줘
 *   @strategy-writer 헤드라인만 위에서 아래로 스토리가 되게 수정해줘
 *   @chart-specialist 이 섹션에 더 적합한 차트 타입 추천해줘
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude, setStage } from "@/lib/claude";
import type { ReportSchema } from "@/types";

/* ─── 에이전트 목록 ─── */

const AVAILABLE_AGENTS = [
  "data-analyst",
  "domain-expert",
  "strategy-writer",
  "chart-specialist",
  "sample-generator",
  "persona-critic",
] as const;

export type AgentName = (typeof AVAILABLE_AGENTS)[number];

export function isValidAgent(name: string): name is AgentName {
  return (AVAILABLE_AGENTS as readonly string[]).includes(name);
}

/* ─── 프롬프트 로딩 (캐시) ─── */

const _promptCache: Record<string, string> = {};

function loadAgentPrompt(name: AgentName): string {
  if (!_promptCache[name]) {
    _promptCache[name] = readFileSync(
      join(process.cwd(), "src/agents", `${name}.md`),
      "utf-8",
    );
  }
  return _promptCache[name];
}

/* ─── 태그 파싱 ─── */

export interface ParsedTag {
  agent: AgentName;
  task: string;
}

/**
 * "@strategy-writer 헤드라인 수정해줘" → { agent, task }
 * 유효하지 않은 에이전트면 null
 */
export function parseAgentTag(message: string): ParsedTag | null {
  const match = message.match(/^@([\w-]+)\s+([\s\S]+)/);
  if (!match) return null;

  const name = match[1];
  if (!isValidAgent(name)) return null;

  return { agent: name, task: match[2].trim() };
}

/* ─── 컨텍스트 ─── */

export interface TagContext {
  /** 현재 리포트 전체 (섹션 다시 쓰기 시) */
  report?: ReportSchema;
  /** 수정 대상 섹션 ID */
  sectionId?: string;
  /** 에이전트 정의 (agent.json) */
  agentDefinition?: Record<string, unknown>;
}

/* ─── 실행 ─── */

export async function runTagAgent(
  agentName: AgentName,
  task: string,
  context: TagContext = {},
): Promise<string> {
  setStage(`tag-${agentName}`);
  const systemPrompt = loadAgentPrompt(agentName);

  // ── 컨텍스트 조립 ──
  const parts: string[] = [];

  if (context.agentDefinition) {
    parts.push(
      `에이전트 정의:\n${JSON.stringify(context.agentDefinition, null, 2)}`,
    );
  }

  if (context.report && context.sectionId) {
    // 대상 섹션 전문
    const target = context.report.sections?.find(
      (s) => s.id === context.sectionId,
    );
    if (target) {
      parts.push(`수정 대상 섹션:\n${JSON.stringify(target, null, 2)}`);
    }
    // 나머지 섹션 (label만 — 스토리 흐름 파악용)
    const others = (context.report.sections ?? [])
      .filter((s) => s.id !== context.sectionId)
      .map((s) => ({
        id: s.id,
        headline: (s as Record<string, unknown>).headline,
        componentType: s.componentType,
      }));
    parts.push(`다른 섹션 (참고):\n${JSON.stringify(others, null, 2)}`);
  } else if (context.report) {
    parts.push(`현재 리포트:\n${JSON.stringify(context.report, null, 2)}`);
  }

  const contextBlock =
    parts.length > 0
      ? `\n---\n컨텍스트:\n${parts.join("\n\n")}\n---\n`
      : "";

  const prompt = `${contextBlock}\n사용자 요청: ${task}\n\n위 요청에 맞게 결과를 JSON으로 반환해줘.`;

  return callClaude(prompt, systemPrompt);
}
