#!/usr/bin/env ts-node
/**
 * create-agent.ts
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/create-agent.ts \
 *     --name "신제품 가격 전략" --desc "경쟁사 대비 최적 가격대를 분석하고 시나리오별 수익을 예측합니다."
 */

import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import type { AgentDefinition, ReportSchema } from "../src/types";

// ─── CLI arg parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

const name = getArg("--name");
const desc = getArg("--desc");

if (!name || !desc) {
  console.error(
    '\nUsage: npx ts-node --project tsconfig.scripts.json scripts/create-agent.ts --name "에이전트명" --desc "한 줄 설명"\n'
  );
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const AGENTS_DIR = path.join(__dirname, "..", "src", "agents");

function ensureAgentsDir() {
  if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function callClaude(prompt: string, system: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected content type");
  return stripJsonFences(block.text);
}

function printSectionList(agent: AgentDefinition) {
  const sections =
    agent.layout === "tab-grid"
      ? agent.reportTabs?.flatMap((tab) =>
          tab.sections.map((s) => ({ label: `[${tab.label}] ${s.label}`, componentType: s.componentType }))
        ) ?? []
      : agent.reportSections?.map((s) => ({ label: s.label, componentType: s.componentType })) ?? [];

  console.log("\n─── 리포트 구조 (목차) ──────────────────────────────────");
  console.log(`layout    : ${agent.layout}`);
  console.log(`inputType : ${agent.inputType}`);
  console.log(`modalType : ${agent.modalType}`);
  console.log("\n섹션 구성:");
  sections.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.label.padEnd(30)} [${s.componentType}]`);
  });
}

// ─── STEP 1: Generate AgentDefinition ────────────────────────────────────

async function step1_generateDefinition(): Promise<AgentDefinition> {
  console.log("\n✦ STEP 1 — AgentDefinition 생성 중...\n");

  const system = `You are an expert B2B SaaS report designer.
Given an agent name and description, generate a complete AgentDefinition JSON.
Rules:
- id: kebab-case English derived from the Korean name
- category: one of research | prediction | strategy | analysis
- inputType: none | survey-form | text | file (choose the most appropriate)
- layout: tab-grid | single-repeat | single-section (choose the most appropriate)
- modalType: none | tab-detail | persona-detail
- For "tab-grid" layout, populate reportTabs (2-3 tabs, each with 2-4 sections)
- For other layouts, populate reportSections (4-8 sections)
- componentType must be one of: MetricCard | BulletCard | ScoreCard | DoDontCard | SampleCard | HorizontalBarChart | InterpretationBlock | SyntheticPersonaCard | SignalCard | StrategyTable | RevenueScenarioBar | ExecutiveSummary
- promptTemplate: detailed Claude prompt to generate ReportSchema JSON. Include {input} placeholder. Instruct to return ONLY valid JSON.
- All labels must be in Korean
- Return ONLY the JSON object, no explanation, no markdown fences`;

  const prompt = `에이전트명: ${name}
설명: ${desc}

위 에이전트에 맞는 AgentDefinition JSON을 생성해줘.`;

  const raw = await callClaude(prompt, system);
  const agent: AgentDefinition = JSON.parse(raw);

  ensureAgentsDir();
  const filePath = path.join(AGENTS_DIR, `${agent.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(agent, null, 2), "utf-8");

  console.log(`✔ AgentDefinition 생성 완료 → src/agents/${agent.id}.json`);
  printSectionList(agent);

  return agent;
}

// ─── STEP 2: Generate Sample Report ──────────────────────────────────────

async function step2_generateSample(agent: AgentDefinition): Promise<ReportSchema> {
  console.log("\n\n─── 샘플 리포트 미리보기 ────────────────────────────────");
  console.log("Claude API로 목업 데이터 생성 중...\n");

  const system = `You are a B2B SaaS data analyst generating realistic Korean mock report data.
Always respond with valid JSON only. No markdown fences. No explanation.
The JSON must match the ReportSchema structure exactly.

ReportSchema structure:
{
  "meta": { "agentId": string, "agentName": string, "createdAt": ISO string },
  "executiveSummary": { "keyFindings": string[], "distributions"?: [...] },
  "tabs"?: [ { "id", "label", "sections": [ { "id", "label", "componentType", "data": any } ] } ],
  "sections"?: [ { "id", "label", "componentType", "data": any } ]
}

Agent: ${agent.name} (${agent.id})
Layout: ${agent.layout}
Definition:
${JSON.stringify(agent.reportTabs ?? agent.reportSections ?? [], null, 2)}`;

  const prompt = agent.promptTemplate.replace(
    "{input}",
    "샘플 리포트 생성을 위한 가상 입력 데이터"
  );

  const raw = await callClaude(prompt, system);
  const report: ReportSchema = JSON.parse(raw);

  console.log(JSON.stringify(report, null, 2));

  const samplePath = path.join(AGENTS_DIR, `${agent.id}.sample.json`);
  fs.writeFileSync(samplePath, JSON.stringify(report, null, 2), "utf-8");

  console.log(`\n✔ 샘플 리포트 저장 → src/agents/${agent.id}.sample.json`);

  return report;
}

// ─── STEP 3: Preview URL ─────────────────────────────────────────────────

function step3_printPreview(agentId: string) {
  console.log("\n─── 로컬 미리보기 ───────────────────────────────────────");
  console.log("앱을 실행한 뒤 아래 URL에서 샘플 데이터로 리포트를 확인할 수 있어요.\n");
  console.log(`  http://localhost:3000/preview/${agentId}\n`);
  console.log(
    `/preview/${agentId} 라우트는 src/agents/${agentId}.sample.json을 읽어서`
  );
  console.log("ReportRenderer에 바로 렌더링하는 페이지예요.");
  console.log("실제 API 호출 없이 UI 확인 가능.\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────

(async () => {
  try {
    const agent = await step1_generateDefinition();
    await step2_generateSample(agent);
    step3_printPreview(agent.id);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ 오류 발생:", err);
    process.exit(1);
  }
})();
