import { callClaude } from "./claude";
import type { AgentDefinition } from "@/types";

/* ── Volume / Audience guidance ── */

const VOLUME_GUIDE: Record<string, string> = {
  compact: "3~4개 섹션. 핵심 지표 + 결론만. 탭 사용하지 않음(single-section).",
  standard: "6~8개 섹션. 분석 + 인사이트 + 실행안. 탭 없이 single-section 권장.",
  detailed: "8~12개 섹션. 데이터 심층 분석 + 페르소나 + 전략. 필요시 tab-grid 허용.",
};

const AUDIENCE_GUIDE: Record<string, string> = {
  "경영진 (C-level)": "수치 중심, 요약 우선, 실행 결정에 필요한 정보만. MetricCard, RevenueScenarioBar 적극 활용.",
  "팀 리더 / 매니저": "인사이트 + 실행안 균형. StrategyTable, DoDontCard 포함.",
  "실무 담당자": "상세 데이터, 차트, 해석 포함. HorizontalBarChart, InterpretationBlock 적극 활용.",
  "외부 클라이언트": "깔끔한 시각화, 전문적 톤. ExecutiveSummary 필수, ScoreCard로 핵심 성과 강조.",
};

const AGENT_DEFINITION_SYSTEM = `You are an expert B2B SaaS report designer.
Given an agent name, description, audience, key questions, data types, and volume preference,
generate a complete AgentDefinition JSON.

Rules:
- id: kebab-case English, derived from the name
- category: one of research | prediction | strategy | analysis
- inputType: choose based on data types (survey → survey-form, text feedback → text, etc.)
- layout: prefer single-section unless the report truly benefits from tabs
- modalType: none | tab-detail | persona-detail
- For "tab-grid" layout, populate reportTabs (2-3 tabs max, each with 2-4 sections)
- For "single-repeat" or "single-section" layout, populate reportSections
- componentType must be one of: MetricCard | BulletCard | ScoreCard | DoDontCard | SampleCard | HorizontalBarChart | InterpretationBlock | SyntheticPersonaCard | SignalCard | StrategyTable | RevenueScenarioBar | ExecutiveSummary
- Section order must follow the flow of key questions — each question should be answered naturally in sequence
- Do NOT repeat similar content across sections
- InterpretationBlock should only follow a chart, max 1-2 times
- promptTemplate: a detailed instruction for Claude to generate ReportSchema JSON. Include {input} placeholder.
- All labels must be in Korean
- Return ONLY the JSON object, no explanation`;

export interface AgentGeneratorInput {
  name: string;
  desc: string;
  audience?: string;
  keyQuestions?: string[];
  dataTypes?: string[];
  volume?: string;
}

export async function generateAgentDefinition(
  input: AgentGeneratorInput
): Promise<AgentDefinition> {
  const { name, desc, audience, keyQuestions, dataTypes, volume } = input;

  const audienceHint = audience ? AUDIENCE_GUIDE[audience] ?? "" : "";
  const volumeHint = volume ? VOLUME_GUIDE[volume] ?? VOLUME_GUIDE.standard : VOLUME_GUIDE.standard;
  const questionsStr = keyQuestions?.filter((q) => q.trim()).join("\n  - ") ?? "";
  const dataStr = dataTypes?.join(", ") ?? "";

  const prompt = `에이전트명: ${name}
설명: ${desc}
${audience ? `\n읽는 사람: ${audience}\n톤 가이드: ${audienceHint}` : ""}
${questionsStr ? `\n핵심 질문:\n  - ${questionsStr}\n이 질문들에 답하는 흐름으로 섹션을 구성하세요.` : ""}
${dataStr ? `\n입력 데이터 유형: ${dataStr}` : ""}

분량 가이드: ${volumeHint}

위 정보를 기반으로 AgentDefinition JSON을 생성해줘.`;

  const raw = await callClaude(prompt, AGENT_DEFINITION_SYSTEM);
  const def: AgentDefinition = JSON.parse(raw);
  return def;
}

/* ── Review: validate & improve agent structure ── */

const REVIEW_SYSTEM = `너는 리포트 구성안을 검토하는 전문가야.
아래 구성안이 [에이전트 목적]을 달성하기에 충분한지 검토하고,
다음 기준으로 보완해줘:
1. 핵심 질문에 대응되는 섹션이 모두 있는가
2. 독자 수준에 맞는 깊이인가
3. 빠진 핵심 지표나 위젯이 있는가
보완이 필요하면 구성안을 직접 수정해서 반환해.

componentType은 반드시 다음 중 하나여야 해:
MetricCard | BulletCard | ScoreCard | DoDontCard | SampleCard | HorizontalBarChart | InterpretationBlock | SyntheticPersonaCard | SignalCard | StrategyTable | RevenueScenarioBar | ExecutiveSummary

응답 형식 (JSON만):
{
  "agent": { ... 수정된 AgentDefinition ... },
  "changes": ["변경사항 1", "변경사항 2", ...]
}
변경이 없으면 changes: ["검토 완료 — 보완 사항 없음"]`;

export async function reviewAgentDefinition(
  agent: AgentDefinition,
  context: {
    audience?: string;
    keyQuestions?: string[];
    dataTypes?: string[];
    volume?: string;
  }
): Promise<{ agent: AgentDefinition; changes: string[] }> {
  const prompt = `에이전트 목적: ${agent.name} — ${agent.description}
읽는 사람: ${context.audience ?? "미지정"}
핵심 질문: ${(context.keyQuestions ?? []).map((q, i) => `Q${i + 1}. ${q}`).join(" / ")}
입력 데이터: ${(context.dataTypes ?? []).join(", ") || "미지정"}
분량: ${context.volume ?? "standard"}

현재 구성안:
${JSON.stringify(agent, null, 2)}

위 기준으로 검토하고 수정된 JSON을 반환해줘.`;

  const raw = await callClaude(prompt, REVIEW_SYSTEM);
  return JSON.parse(raw);
}

const SAMPLE_REPORT_SYSTEM = `You are a B2B SaaS data analyst generating realistic mock report data.
Always respond with valid JSON only. No markdown fences. No explanation.
The JSON must match the ReportSchema structure exactly.`;

export async function generateSampleReport(
  agent: AgentDefinition
): Promise<object> {
  const prompt = agent.promptTemplate.replace(
    "{input}",
    "샘플 데이터 생성을 위한 가상의 입력값"
  );

  const systemContext = `${SAMPLE_REPORT_SYSTEM}

Expected ReportSchema structure:
{
  "meta": { "agentId": string, "agentName": string, "createdAt": ISO string },
  "executiveSummary": { "keyFindings": string[], "distributions"?: [...] },
  "tabs"?: [ { "id", "label", "sections": [ { "id", "label", "componentType", "data": {...} } ] } ],
  "sections"?: [ { "id", "label", "componentType", "data": {...} } ]
}

Agent ID: ${agent.id}
Agent Name: ${agent.name}
Layout: ${agent.layout}
Sections/Tabs: ${JSON.stringify(agent.reportTabs ?? agent.reportSections ?? [], null, 2)}`;

  const raw = await callClaude(prompt, systemContext);
  return JSON.parse(raw);
}
