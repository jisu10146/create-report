import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { normalizeReport } from "@/lib/reportNormalizer";
import { callClaude } from "@/lib/claude";
import { AUDIENCE_GUIDE, VALID_COMPONENTS, DESIGN_SYSTEM_PROMPT, COMPONENT_DATA_SCHEMA, SAMPLE_REPORT_SYSTEM } from "@/lib/constants";
import { buildPatternPrompt, validatePattern } from "@/lib/layout-patterns";
import type { AgentDefinition } from "@/types";

const AGENTS_DIR = path.join(process.cwd(), "src", "agents");

function ensureAgentsDir() {
  if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

/* ═══════════════════════════════════════════════════════════════════════════
   1단계 — Claude가 에이전트 설명 분석 → 구성안 설계
   ═══════════════════════════════════════════════════════════════════════════ */

async function buildAgentWithClaude(body: {
  name: string;
  desc: string;
  audience?: string;
  keyQuestions?: string[];
  dataTypes?: string[];
  volume?: string;
}): Promise<{ agent: AgentDefinition; storyLine?: string; keyDecision?: string }> {
  const volume = body.volume ?? "standard";
  const audience = body.audience ?? "";
  const questionsStr = (body.keyQuestions ?? []).filter(q => q.trim()).map((q, i) => `Q${i + 1}. ${q}`).join("\n  ");
  const dataStr = (body.dataTypes ?? []).join(", ");

  const patternPrompt = buildPatternPrompt(volume);

  const prompt = `에이전트명: ${body.name}
설명: ${body.desc}

읽는 사람: ${audience || "미지정"}
${audience ? `톤 가이드: ${AUDIENCE_GUIDE[audience] ?? ""}` : ""}

${questionsStr ? `핵심 질문:\n  ${questionsStr}\n이 질문들에 자연스럽게 답하는 흐름으로 섹션을 구성해.` : ""}
${dataStr ? `입력 데이터 유형: ${dataStr}` : ""}

── 레이아웃 패턴 조건 ──
${patternPrompt}

위 정보를 바탕으로 리포트 구성안을 설계해줘.
각 섹션을 왜 넣었는지 reason 필드에 꼭 써줘.`;

  const raw = await callClaude(prompt, DESIGN_SYSTEM_PROMPT);
  const parsed = JSON.parse(raw);

  const id = body.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "agent";

  const agent: AgentDefinition = {
    id,
    name: body.name.trim(),
    description: body.desc.trim(),
    category: parsed.category ?? "analysis",
    inputType: parsed.inputType ?? "none",
    layout: parsed.layout ?? "single-section",
    modalType: parsed.modalType ?? "none",
    reportSections: (parsed.sections ?? []).map((s: { id: string; label: string; componentType: string; reason?: string }) => ({
      id: s.id,
      label: s.label,
      componentType: s.componentType,
      reason: s.reason,
    })),
    promptTemplate: "",
  };

  return {
    agent,
    storyLine: parsed.storyLine as string | undefined,
    keyDecision: parsed.keyDecision as string | undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   2단계 — 유효성 검증 (규칙은 검증만, 추가/제거 하지 않음)
   ═══════════════════════════════════════════════════════════════════════════ */

interface ReviewResult {
  agent: AgentDefinition;
  changes: string[];
}

function validateAgentStructure(
  agent: AgentDefinition,
  context: { volume?: string }
): ReviewResult {
  const changes: string[] = [];
  let sections = [...(agent.reportSections ?? [])];
  const volume = context.volume ?? "standard";

  /* 1. 유효하지 않은 컴포넌트 제거 */
  sections = sections.filter((s) => {
    if (!VALID_COMPONENTS.has(s.componentType)) {
      changes.push(`- ${s.componentType} 제거 — 유효하지 않은 컴포넌트`);
      return false;
    }
    return true;
  });

  /* 2. 패턴 기반 forbidden 제거 */
  const patternViolations = validatePattern(sections, volume);
  for (const v of patternViolations) {
    if (v.startsWith("사용 불가 컴포넌트 포함:")) {
      const forbidden = v.replace("사용 불가 컴포넌트 포함: ", "");
      sections = sections.filter((s) => {
        if (s.componentType === forbidden) {
          changes.push(`- ${s.label || forbidden} 제거 — ${volume} 패턴에서 사용 불가`);
          return false;
        }
        return true;
      });
    }
  }

  /* 3. ExecutiveSummary 맨 앞 보장 (required 규칙) */
  const esIdx = sections.findIndex((s) => s.componentType === "ExecutiveSummary");
  if (esIdx === -1) {
    sections.unshift({ id: "executive-summary", label: "Executive Summary", componentType: "ExecutiveSummary" });
    changes.push("+ ExecutiveSummary 추가 — 필수 섹션 누락");
  } else if (esIdx > 0) {
    const [es] = sections.splice(esIdx, 1);
    sections.unshift(es);
    changes.push("→ ExecutiveSummary를 맨 앞으로 이동");
  }

  /* 4. InterpretationBlock이 차트 바로 뒤인지 확인 */
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].componentType === "InterpretationBlock") {
      const prev = sections[i - 1];
      if (!prev || prev.componentType !== "HorizontalBarChart") {
        changes.push(`⚠ InterpretationBlock (${sections[i].label || "AI 해석"}) — 차트 바로 뒤에 위치하지 않음`);
      }
    }
  }

  /* 5. 중복 컴포넌트 체크 */
  const seen = new Set<string>();
  sections = sections.filter((s) => {
    if (seen.has(s.componentType)) {
      changes.push(`- 중복 제거: ${s.label || s.componentType}`);
      return false;
    }
    seen.add(s.componentType);
    return true;
  });

  /* 6. 패턴 조건 최종 검증 (제거 후 다시 체크) */
  const finalViolations = validatePattern(sections, volume);
  for (const v of finalViolations) {
    if (!v.startsWith("사용 불가")) {
      changes.push(`⚠ ${v}`);
    }
  }

  if (changes.length === 0) {
    changes.push("검토 완료 — 보완 사항 없음");
  }

  /* Claude 설계 이유 로깅 */
  const reasons = (agent.reportSections ?? [])
    .filter((s: { reason?: string }) => s.reason)
    .map((s: { componentType: string; label: string; reason?: string }) => `· ${s.label} (${s.componentType}): ${s.reason}`);

  if (reasons.length > 0) {
    changes.push("", "── Claude 설계 이유 ──", ...reasons);
  }

  return {
    agent: { ...agent, reportSections: sections },
    changes,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   3단계 — Claude가 구성안 기반으로 샘플 리포트 데이터 생성
   ═══════════════════════════════════════════════════════════════════════════ */

async function generateSampleWithClaude(
  agent: AgentDefinition,
  context: { audience?: string; dataTypes?: string[] }
): Promise<object> {
  const sections = agent.reportSections ?? [];

  // 각 섹션별 데이터 스키마를 조합
  const sectionSchemas = sections.map((s) => {
    const schema = COMPONENT_DATA_SCHEMA[s.componentType] ?? "{}";
    return `  {
    "id": "${s.id}",
    "label": "${s.label}",
    "componentType": "${s.componentType}",
    "data": ${schema}
  }`;
  }).join(",\n");

  const prompt = `에이전트: ${agent.name}
설명: ${agent.description}
읽는 사람: ${context.audience ?? "미지정"}
입력 데이터: ${(context.dataTypes ?? []).join(", ") || "미지정"}

아래 구성안의 각 섹션에 맞는 현실적인 샘플 데이터를 생성해줘.
데이터는 에이전트의 주제에 맞는 구체적인 수치·이름·설명이어야 해.

구성안:
[
${sectionSchemas}
]

출력 형식 (JSON만, 설명 없이):
{
  "meta": {
    "agentId": "${agent.id}",
    "agentName": "${agent.name}",
    "createdAt": "${new Date().toISOString()}"
  },
  "executiveSummary": {
    "keyFindings": ["핵심 발견 3-5개"]
  },
  "sections": [
    위 구성안의 각 섹션에 대해:
    {
      "id": "섹션 id",
      "label": "섹션 label",
      "componentType": "컴포넌트 타입",
      "data": { 해당 컴포넌트의 스키마에 맞는 현실적 데이터 }
    }
  ]
}`;

  const raw = await callClaude(prompt, SAMPLE_REPORT_SYSTEM);
  const parsed = JSON.parse(raw);

  return normalizeReport(parsed, agent);
}

/* ═══════════════════════════════════════════════════════════════════════════
   API Route Handler
   ═══════════════════════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    phase: "definition" | "review" | "sample";
    name?: string;
    desc?: string;
    audience?: string;
    keyQuestions?: string[];
    dataTypes?: string[];
    volume?: string;
    agent?: AgentDefinition;
  };

  try {
    if (body.phase === "definition") {
      const { name, desc } = body;
      if (!name || !desc) {
        return NextResponse.json({ error: "name과 desc가 필요합니다." }, { status: 400 });
      }

      const result = await buildAgentWithClaude(body as Parameters<typeof buildAgentWithClaude>[0]);

      ensureAgentsDir();
      fs.writeFileSync(
        path.join(AGENTS_DIR, `${result.agent.id}.json`),
        JSON.stringify(result.agent, null, 2),
        "utf-8"
      );

      return NextResponse.json({
        agent: result.agent,
        storyLine: result.storyLine,
        keyDecision: result.keyDecision,
      });
    }

    if (body.phase === "review") {
      const { agent } = body;
      if (!agent) {
        return NextResponse.json({ error: "agent가 필요합니다." }, { status: 400 });
      }

      const result = validateAgentStructure(agent, {
        volume: body.volume,
      });

      ensureAgentsDir();
      fs.writeFileSync(
        path.join(AGENTS_DIR, `${result.agent.id}.json`),
        JSON.stringify(result.agent, null, 2),
        "utf-8"
      );

      return NextResponse.json({ agent: result.agent, reviewChanges: result.changes });
    }

    if (body.phase === "sample") {
      const { agent } = body;
      if (!agent) {
        return NextResponse.json({ error: "agent가 필요합니다." }, { status: 400 });
      }

      const report = await generateSampleWithClaude(agent, {
        audience: body.audience,
        dataTypes: body.dataTypes,
      });

      ensureAgentsDir();
      fs.writeFileSync(
        path.join(AGENTS_DIR, `${agent.id}.sample.json`),
        JSON.stringify(report, null, 2),
        "utf-8"
      );

      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: "유효하지 않은 phase입니다." }, { status: 400 });
  } catch (err) {
    console.error("[create-agent]", err);
    return NextResponse.json({ error: "생성 실패", detail: String(err) }, { status: 500 });
  }
}
