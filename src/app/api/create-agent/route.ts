import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { normalizeReport } from "@/lib/reportNormalizer";
import type { AgentDefinition } from "@/types";

const AGENTS_DIR = path.join(process.cwd(), "src", "agents");

function ensureAgentsDir() {
  if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

/* ── Volume → section count guidance ── */
const VOLUME_GUIDE: Record<string, string> = {
  compact: "3~4개 섹션. 핵심 지표 + 결론만. 탭 사용하지 않음(single-section).",
  standard: "6~8개 섹션. 분석 + 인사이트 + 실행안. 탭 없이 single-section 권장.",
  detailed: "8~12개 섹션. 데이터 심층 분석 + 페르소나 + 전략. 필요시 tab-grid 허용.",
};

/* ── Audience → tone guidance ── */
const AUDIENCE_GUIDE: Record<string, string> = {
  "경영진 (C-level)": "수치 중심, 요약 우선, 실행 결정에 필요한 정보만. MetricCard, RevenueScenarioBar 적극 활용.",
  "팀 리더 / 매니저": "인사이트 + 실행안 균형. StrategyTable, DoDontCard 포함.",
  "실무 담당자": "상세 데이터, 차트, 해석 포함. HorizontalBarChart, InterpretationBlock 적극 활용.",
  "외부 클라이언트": "깔끔한 시각화, 전문적 톤. ExecutiveSummary 필수, ScoreCard로 핵심 성과 강조.",
};

/* ── Mock definition (uses audience/volume to adjust structure) ── */
function buildMockAgent(body: {
  name: string;
  desc: string;
  audience?: string;
  keyQuestions?: string[];
  dataTypes?: string[];
  volume?: string;
}): AgentDefinition {
  const id = body.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "mock-agent";
  const volume = body.volume ?? "standard";

  const baseSections: Array<{ id: string; label: string; componentType: string }> = [
    { id: "executive-summary", label: "Executive Summary", componentType: "ExecutiveSummary" },
    { id: "kpi-overview", label: "핵심 지표", componentType: "MetricCard" },
  ];

  if (volume !== "compact") {
    baseSections.push(
      { id: "main-chart", label: "데이터 분석", componentType: "HorizontalBarChart" },
      { id: "ai-interpretation", label: "", componentType: "InterpretationBlock" },
    );
  }

  if (volume === "detailed" || body.dataTypes?.includes("고객 DB")) {
    baseSections.push(
      { id: "personas", label: "소비자 프로필", componentType: "SyntheticPersonaCard" },
    );
  }

  if (volume !== "compact") {
    baseSections.push(
      { id: "signals", label: "주요 시그널", componentType: "SignalCard" },
      { id: "do-dont", label: "DO / DON'T", componentType: "DoDontCard" },
    );
  }

  const audienceNeedsAction = ["경영진 (C-level)", "팀 리더 / 매니저"].includes(body.audience ?? "");
  if (audienceNeedsAction || volume === "detailed") {
    baseSections.push(
      { id: "strategy-table", label: "실행 계획", componentType: "StrategyTable" },
      { id: "revenue-scenario", label: "수익 시나리오", componentType: "RevenueScenarioBar" },
    );
  }

  return {
    id,
    name: body.name.trim(),
    description: body.desc.trim(),
    category: "analysis",
    inputType: body.dataTypes?.includes("서베이 응답") ? "survey-form" : "none",
    layout: "single-section",
    modalType: body.dataTypes?.includes("고객 DB") ? "persona-detail" : "none",
    reportSections: baseSections.map((s) => ({
      id: s.id,
      label: s.label,
      componentType: s.componentType,
    })),
    promptTemplate: "",
  };
}

/* ── Review: validate & improve agent structure ── */

interface ReviewResult {
  agent: AgentDefinition;
  changes: string[];
}

function reviewAgentStructure(
  agent: AgentDefinition,
  context: {
    audience?: string;
    keyQuestions?: string[];
    dataTypes?: string[];
    volume?: string;
  }
): ReviewResult {
  // TODO: Replace with AI call when API key is configured
  // AI prompt is in agentGenerator.ts → reviewAgentDefinition()

  const changes: string[] = [];
  let sections = [...(agent.reportSections ?? [])];
  const volume = context.volume ?? "standard";
  const audience = context.audience ?? "";
  const questions = context.keyQuestions ?? [];
  const dataTypes = context.dataTypes ?? [];
  const allQText = questions.join(" ").toLowerCase();

  const has = (type: string) => sections.some((s) => s.componentType === type);

  /* ── 1. 핵심 질문에 대응되는 섹션이 있는가 (추가) ── */

  if (allQText.match(/가격|pricing|price|적정|psm/) && !has("MetricCard")) {
    sections.splice(1, 0, { id: "price-kpi", label: "가격 분석 지표", componentType: "MetricCard" });
    changes.push("+ MetricCard 추가 — 가격 관련 질문에 수치 지표 필요");
  }

  if (allQText.match(/타겟|고객|페르소나|소비자|누구/) && !has("SyntheticPersonaCard") && dataTypes.includes("고객 DB")) {
    sections.push({ id: "target-personas", label: "타겟 소비자 프로필", componentType: "SyntheticPersonaCard" });
    changes.push("+ SyntheticPersonaCard 추가 — 타겟 고객 질문에 대응");
  }

  if (allQText.match(/인사이트|발견|결과|패턴|분포/) && !has("HorizontalBarChart") && dataTypes.includes("서베이 응답")) {
    const kpiIdx = sections.findIndex((s) => s.componentType === "MetricCard");
    sections.splice(kpiIdx + 1, 0, { id: "insight-chart", label: "데이터 분석", componentType: "HorizontalBarChart" });
    changes.push("+ HorizontalBarChart 추가 — 서베이 데이터 분포 시각화 필요");
  }

  if (allQText.match(/액션|실행|계획|전략|어떻게/) && !has("StrategyTable")) {
    sections.push({ id: "action-plan", label: "실행 계획", componentType: "StrategyTable" });
    changes.push("+ StrategyTable 추가 — 실행 계획 질문에 대응");
  }

  if (allQText.match(/수익|매출|성과|roi|효과/) && !has("RevenueScenarioBar")) {
    sections.push({ id: "revenue-impact", label: "수익 시나리오", componentType: "RevenueScenarioBar" });
    changes.push("+ RevenueScenarioBar 추가 — 수익 관련 질문에 대응");
  }

  /* ── 2. 독자 수준에 맞는 깊이인가 (추가/제거) ── */

  if (audience === "경영진 (C-level)") {
    if (!has("RevenueScenarioBar")) {
      sections.push({ id: "revenue-scenario", label: "수익 시나리오", componentType: "RevenueScenarioBar" });
      changes.push("+ RevenueScenarioBar — 경영진에게 의사결정용 수치 필요");
    }
    // 경영진은 상세 해석보다 수치 선호
    if (has("InterpretationBlock")) {
      sections = sections.filter((s) => s.componentType !== "InterpretationBlock");
      changes.push("- InterpretationBlock 제거 — 경영진은 수치 중심, 상세 해석 불필요");
    }
    // 경영진에게 SignalCard는 과한 디테일
    if (has("SignalCard") && volume !== "detailed") {
      sections = sections.filter((s) => s.componentType !== "SignalCard");
      changes.push("- SignalCard 제거 — 경영진 대상 리포트에 과도한 디테일");
    }
  }

  if (audience === "외부 클라이언트") {
    if (!has("ScoreCard")) {
      const esIdx = sections.findIndex((s) => s.componentType === "ExecutiveSummary");
      sections.splice(esIdx + 1, 0, { id: "performance-score", label: "핵심 성과 스코어", componentType: "ScoreCard" });
      changes.push("+ ScoreCard — 외부 클라이언트에게 성과 강조 필요");
    }
    // 외부에 DO/DON'T는 내부 가이드 성격이라 부적합
    if (has("DoDontCard")) {
      sections = sections.filter((s) => s.componentType !== "DoDontCard");
      changes.push("- DoDontCard 제거 — 외부 클라이언트에 내부 가이드 부적합");
    }
  }

  /* ── 3. 핵심 질문에 대응되지 않는 섹션 제거 ── */

  // 질문과 무관한 섹션 정리 (ExecutiveSummary, InterpretationBlock은 보조 섹션이므로 제외)
  const supportTypes = new Set(["ExecutiveSummary", "InterpretationBlock"]);

  if (!allQText.match(/리스크|위험|이탈|방지|시그널/) && has("SignalCard") && audience !== "실무 담당자") {
    sections = sections.filter((s) => s.componentType !== "SignalCard");
    changes.push("- SignalCard 제거 — 핵심 질문에 리스크/시그널 관련 내용 없음");
  }

  if (!allQText.match(/실행|계획|전략|로드맵|액션/) && has("StrategyTable") && audience !== "팀 리더 / 매니저") {
    sections = sections.filter((s) => s.componentType !== "StrategyTable");
    changes.push("- StrategyTable 제거 — 핵심 질문에 실행 계획 관련 내용 없음");
  }

  if (!allQText.match(/수익|매출|성과|시나리오|roi/) && has("RevenueScenarioBar") && audience !== "경영진 (C-level)") {
    sections = sections.filter((s) => s.componentType !== "RevenueScenarioBar");
    changes.push("- RevenueScenarioBar 제거 — 핵심 질문에 수익 관련 내용 없음");
  }

  /* ── 4. 분량 제한 준수 ── */

  const maxSections: Record<string, number> = { compact: 4, standard: 8, detailed: 12 };
  const limit = maxSections[volume] ?? 8;

  if (sections.length > limit) {
    // 뒤에서부터 보조적 섹션 제거
    const removePriority = ["RevenueScenarioBar", "StrategyTable", "SignalCard", "DoDontCard", "InterpretationBlock"];
    for (const type of removePriority) {
      if (sections.length <= limit) break;
      const idx = sections.findIndex((s) => s.componentType === type);
      if (idx !== -1) {
        changes.push(`- ${sections[idx].label || type} 제거 — ${volume} 분량 제한(${limit}개) 초과`);
        sections.splice(idx, 1);
      }
    }
  }

  /* ── 5. 구조 정리 ── */

  // ExecutiveSummary를 맨 앞으로
  const esIdx = sections.findIndex((s) => s.componentType === "ExecutiveSummary");
  if (esIdx === -1) {
    sections.unshift({ id: "executive-summary", label: "Executive Summary", componentType: "ExecutiveSummary" });
    changes.push("+ ExecutiveSummary 추가 — 필수 섹션 누락");
  } else if (esIdx > 0) {
    const [es] = sections.splice(esIdx, 1);
    sections.unshift(es);
    changes.push("→ ExecutiveSummary를 맨 앞으로 이동");
  }

  // InterpretationBlock이 차트 바로 뒤에 있는지 확인
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].componentType === "InterpretationBlock") {
      const prev = sections[i - 1];
      if (!prev || prev.componentType !== "HorizontalBarChart") {
        // 차트 뒤가 아니면 제거
        changes.push(`- InterpretationBlock 제거 — 차트 바로 뒤에 위치하지 않아 맥락 부족`);
        sections.splice(i, 1);
      }
    }
  }

  // 중복 제거
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

  if (changes.length === 0) {
    changes.push("검토 완료 — 보완 사항 없음");
  }

  return {
    agent: { ...agent, reportSections: sections },
    changes,
  };
}

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

      const agent = buildMockAgent(body as Parameters<typeof buildMockAgent>[0]);

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

      const result = reviewAgentStructure(agent, {
        audience: body.audience,
        keyQuestions: body.keyQuestions,
        dataTypes: body.dataTypes,
        volume: body.volume,
      });

      // Save reviewed agent
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
