import { callClaude } from "./claude";
import type { AgentDefinition } from "@/types";

const AGENT_DEFINITION_SYSTEM = `You are an expert B2B SaaS report designer.
Given an agent name and description, generate a complete AgentDefinition JSON.

Rules:
- id: kebab-case English, derived from the name
- category: one of research | prediction | strategy | analysis
- inputType: choose the most appropriate one (none / survey-form / text / file)
- layout: choose the most appropriate one (tab-grid / single-repeat / single-section)
- modalType: none | tab-detail | persona-detail
- For "tab-grid" layout, populate reportTabs (2-3 tabs, each with 2-4 sections)
- For "single-repeat" or "single-section" layout, populate reportSections (4-8 sections)
- componentType must be one of: MetricCard | BulletCard | ScoreCard | DoDontCard | SampleCard | HorizontalBarChart | InterpretationBlock | SyntheticPersonaCard | SignalCard | StrategyTable | RevenueScenarioBar | ExecutiveSummary
- promptTemplate: a detailed instruction for Claude to generate a ReportSchema JSON for this agent. Include {input} placeholder. The template must instruct Claude to return ONLY valid JSON matching the ReportSchema structure.
- All labels must be in Korean
- Return ONLY the JSON object, no explanation`;

export async function generateAgentDefinition(
  name: string,
  description: string
): Promise<AgentDefinition> {
  const prompt = `에이전트명: ${name}
설명: ${description}

위 에이전트에 맞는 AgentDefinition JSON을 생성해줘.
아래 스키마를 정확히 따라야 해:

{
  "id": "kebab-case",
  "name": "한국어 에이전트명",
  "description": "한 줄 설명",
  "category": "research" | "prediction" | "strategy" | "analysis",
  "inputType": "none" | "survey-form" | "text" | "file",
  "layout": "tab-grid" | "single-repeat" | "single-section",
  "modalType": "none" | "tab-detail" | "persona-detail",
  "reportTabs": [...],      // layout이 tab-grid일 때만
  "reportSections": [...],  // layout이 single-repeat 또는 single-section일 때만
  "promptTemplate": "..."   // {input} 플레이스홀더 포함
}`;

  const raw = await callClaude(prompt, AGENT_DEFINITION_SYSTEM);
  const def: AgentDefinition = JSON.parse(raw);
  return def;
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
