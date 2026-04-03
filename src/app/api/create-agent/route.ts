import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { normalizeReport } from "@/lib/reportNormalizer";
import { callClaude } from "@/lib/claude";
import { VOLUME_GUIDE, VOLUME_LIMITS, AUDIENCE_GUIDE, VALID_COMPONENTS, DESIGN_SYSTEM_PROMPT } from "@/lib/constants";
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
}): Promise<AgentDefinition> {
  const volume = body.volume ?? "standard";
  const audience = body.audience ?? "";
  const questionsStr = (body.keyQuestions ?? []).filter(q => q.trim()).map((q, i) => `Q${i + 1}. ${q}`).join("\n  ");
  const dataStr = (body.dataTypes ?? []).join(", ");

  const prompt = `에이전트명: ${body.name}
설명: ${body.desc}

읽는 사람: ${audience || "미지정"}
${audience ? `톤 가이드: ${AUDIENCE_GUIDE[audience] ?? ""}` : ""}

${questionsStr ? `핵심 질문:\n  ${questionsStr}\n이 질문들에 자연스럽게 답하는 흐름으로 섹션을 구성해.` : ""}
${dataStr ? `입력 데이터 유형: ${dataStr}` : ""}

분량: ${VOLUME_GUIDE[volume] ?? VOLUME_GUIDE.standard}

위 정보를 바탕으로 리포트 구성안을 설계해줘.
각 섹션을 왜 넣었는지 reason 필드에 꼭 써줘.`;

  const raw = await callClaude(prompt, DESIGN_SYSTEM_PROMPT);
  const parsed = JSON.parse(raw);

  const id = body.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "agent";

  return {
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
  const limit = VOLUME_LIMITS[volume] ?? 8;

  /* 1. 유효하지 않은 컴포넌트 제거 */
  const beforeCount = sections.length;
  sections = sections.filter((s) => {
    if (!VALID_COMPONENTS.has(s.componentType)) {
      changes.push(`- ${s.componentType} 제거 — 유효하지 않은 컴포넌트`);
      return false;
    }
    return true;
  });

  /* 2. ExecutiveSummary 맨 앞 보장 */
  const esIdx = sections.findIndex((s) => s.componentType === "ExecutiveSummary");
  if (esIdx === -1) {
    sections.unshift({ id: "executive-summary", label: "Executive Summary", componentType: "ExecutiveSummary" });
    changes.push("+ ExecutiveSummary 추가 — 필수 섹션 누락");
  } else if (esIdx > 0) {
    const [es] = sections.splice(esIdx, 1);
    sections.unshift(es);
    changes.push("→ ExecutiveSummary를 맨 앞으로 이동");
  }

  /* 3. InterpretationBlock이 차트 바로 뒤인지 확인 */
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].componentType === "InterpretationBlock") {
      const prev = sections[i - 1];
      if (!prev || prev.componentType !== "HorizontalBarChart") {
        changes.push(`⚠ InterpretationBlock (${sections[i].label}) — 차트 바로 뒤에 위치하지 않음. 확인 필요`);
      }
    }
  }

  /* 4. 중복 컴포넌트 체크 */
  const seen = new Set<string>();
  sections = sections.filter((s) => {
    if (s.componentType === "MetricCard") return true;
    if (seen.has(s.componentType)) {
      changes.push(`- 중복 제거: ${s.label || s.componentType}`);
      return false;
    }
    seen.add(s.componentType);
    return true;
  });

  /* 5. 분량 제한 체크 (경고만, 강제 제거 안 함) */
  if (sections.length > limit) {
    changes.push(`⚠ 분량 초과: ${sections.length}개 섹션 (${volume} 제한: ${limit}개). 검토 필요`);
  }

  if (changes.length === 0) {
    changes.push("검토 완료 — 보완 사항 없음");
  }

  /* 3단계 — Claude가 판단한 이유 로깅 */
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

      const agent = await buildAgentWithClaude(body as Parameters<typeof buildAgentWithClaude>[0]);

      ensureAgentsDir();
      fs.writeFileSync(
        path.join(AGENTS_DIR, `${agent.id}.json`),
        JSON.stringify(agent, null, 2),
        "utf-8"
      );

      return NextResponse.json({ agent });
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

      const samplePath = path.join(AGENTS_DIR, "audience-strategy.sample.json");
      const raw = JSON.parse(fs.readFileSync(samplePath, "utf-8"));
      const report = normalizeReport(
        { ...raw, meta: { ...raw.meta, agentId: agent.id, agentName: agent.name, createdAt: new Date().toISOString() } },
        agent
      );

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
