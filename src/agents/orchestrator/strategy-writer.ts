/**
 * Strategy Writer Agent — 맥킨지 전략가
 *
 * Data Analyst + Domain Expert 출력을 받아서
 * 피라미드 원칙 기반 스토리라인 + 섹션 구성 + 헤드라인을 작성한다.
 *
 * 프롬프트 원본: src/agents/strategy-writer.md
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import type {
  OrchestratorInput,
  DataAnalystOutput,
  DomainExpertOutput,
  StrategyWriterOutput,
} from "./types";

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/strategy-writer.md"),
  "utf-8"
);

export async function runStrategyWriter(
  input: OrchestratorInput,
  dataAnalyst: DataAnalystOutput,
  domainExpert: DomainExpertOutput
): Promise<StrategyWriterOutput> {
  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
분량: ${input.volume ?? "standard"}
독자: ${input.audience ?? "팀 리더 / 매니저"}

Data Analyst 분석 결과:
${JSON.stringify(dataAnalyst, null, 2)}

Domain Expert 도메인 지식:
${JSON.stringify(domainExpert, null, 2)}

위 분석 결과와 도메인 지식을 기반으로,
피라미드 원칙에 따른 리포트 스토리 구조를 설계해줘.
섹션의 componentType은 결정하지 마 — 다음 단계에서 Chart Specialist가 결정함.
대신 dataHint에 해당 섹션의 데이터 특성을 명시해.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw) as StrategyWriterOutput;
}
