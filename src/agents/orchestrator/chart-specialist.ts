/**
 * Chart Specialist Agent — 시각화 전문가
 *
 * Strategy Writer의 섹션 구성을 받아서
 * 각 섹션에 최적의 컴포넌트를 매칭한다.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import { COMPONENT_DEFINITIONS, COMPONENT_DATA_SCHEMA } from "@/lib/constants";
import type { StrategyWriterOutput, ChartSpecialistOutput } from "./types";

/** 컴포넌트 스펙을 동적으로 빌드 (constants.ts 데이터 기반) */
const COMPONENT_SPEC = COMPONENT_DEFINITIONS.map((c) => {
  const schema = COMPONENT_DATA_SCHEMA[c.name] ?? "";
  const rule = c.rule ? ` | 규칙: ${c.rule}` : "";
  return `- ${c.name}: ${c.description}${rule}\n  데이터: ${schema}`;
}).join("\n\n");

/** 프롬프트 원본: src/agents/chart-specialist.md ({{COMPONENT_SPEC}} 치환) */
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/chart-specialist.md"),
  "utf-8"
).replace("{{COMPONENT_SPEC}}", COMPONENT_SPEC);

export async function runChartSpecialist(
  strategy: StrategyWriterOutput
): Promise<ChartSpecialistOutput> {
  const prompt = `
Strategy Writer가 설계한 섹션 구성:

storyLine: ${strategy.storyLine}
category: ${strategy.category}

섹션:
${strategy.sections.map((s) => `- ${s.id} | ${s.label} | dataHint: "${s.dataHint}"`).join("\n")}

각 섹션의 dataHint를 보고, 가장 적합한 컴포넌트를 매칭해줘.
섹션 id는 그대로 유지해.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw) as ChartSpecialistOutput;
}
