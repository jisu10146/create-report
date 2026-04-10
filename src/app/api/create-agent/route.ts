/**
 * POST /api/create-agent
 *
 * 멀티 에이전트 오케스트레이션으로 에이전트 설계.
 * Studio UI에서 호출됨.
 *
 * phase:
 *   - "design"  → 전체 파이프라인 실행 (구성안 + 검증)
 *   - "sample"  → 확정된 구성안으로 샘플 데이터 생성
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { orchestrate } from "@/agents/orchestrator/pm";
import { runSampleGenerator } from "@/agents/orchestrator/sample-generator";
import { normalizeReport } from "@/lib/reportNormalizer";
import { validatePattern } from "@/lib/layout-patterns";
import { VALID_COMPONENTS } from "@/lib/constants";
import type { AgentDefinition } from "@/types";

const DEFINITIONS_DIR = path.join(process.cwd(), "src", "agents", "definitions");

function ensureAgentDir(agentId: string) {
  const dir = path.join(DEFINITIONS_DIR, agentId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    phase: "design" | "definition" | "review" | "sample";
    name?: string;
    desc?: string;
    audience?: string;
    volume?: string;
    agent?: AgentDefinition;
  };

  try {
    // ── design: 멀티 에이전트 파이프라인 실행 ──
    if (body.phase === "design" || body.phase === "definition") {
      const { name, desc } = body;
      if (!name || !desc) {
        return NextResponse.json({ error: "name과 desc가 필요합니다." }, { status: 400 });
      }

      const result = await orchestrate({
        agentName: name,
        description: desc,
        volume: (body.volume as "compact" | "standard" | "detailed") ?? "standard",
        audience: body.audience,
      });

      // agent.json 저장
      const agent: AgentDefinition = {
        id: result.blueprint.id,
        name: result.blueprint.name,
        description: result.blueprint.description,
        category: result.blueprint.category,
        inputType: result.blueprint.inputType,
        layout: result.blueprint.layout,
        modalType: result.blueprint.modalType,
        reportSections: result.blueprint.reportSections,
        promptTemplate: "",
      };

      const agentDir = ensureAgentDir(agent.id);
      fs.writeFileSync(
        path.join(agentDir, "agent.json"),
        JSON.stringify(agent, null, 2),
        "utf-8"
      );

      return NextResponse.json({
        agent,
        storyLine: result.blueprint.storyLine,
        keyDecision: result.blueprint.keyDecision,
        validation: result.blueprint.validation,
        trace: result.trace,
      });
    }

    // ── review: 유효성 검증 (하위 호환) ──
    if (body.phase === "review") {
      const { agent } = body;
      if (!agent) {
        return NextResponse.json({ error: "agent가 필요합니다." }, { status: 400 });
      }

      const sections = (agent.reportSections ?? []).filter((s) =>
        VALID_COMPONENTS.has(s.componentType)
      );
      const volume = body.volume ?? "standard";
      const violations = validatePattern(sections, volume);

      const agentDir = ensureAgentDir(agent.id);
      fs.writeFileSync(
        path.join(agentDir, "agent.json"),
        JSON.stringify({ ...agent, reportSections: sections }, null, 2),
        "utf-8"
      );

      return NextResponse.json({
        agent: { ...agent, reportSections: sections },
        reviewChanges: violations.length > 0 ? violations : ["검토 완료 — 보완 사항 없음"],
      });
    }

    // ── sample: 샘플 데이터 생성 ──
    if (body.phase === "sample") {
      const { agent } = body;
      if (!agent) {
        return NextResponse.json({ error: "agent가 필요합니다." }, { status: 400 });
      }

      const sampleReport = await runSampleGenerator(
        {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          inputType: agent.inputType,
          layout: agent.layout,
          modalType: agent.modalType as "none" | "persona-detail",
          reportSections: (agent.reportSections ?? []).map((s) => ({
            id: s.id,
            label: s.label,
            componentType: s.componentType,
            reason: s.reason ?? "",
          })),
          storyLine: "",
          keyDecision: "",
          validation: { passed: true, violations: [], qualityScore: 100 },
        },
        { methodology: "", keyMetricNames: [], segmentNames: [], dataFlags: [] },
        { benchmarks: [], keyDecision: "" }
      );

      const report = normalizeReport(sampleReport, agent);

      const agentDir = ensureAgentDir(agent.id);
      fs.writeFileSync(
        path.join(agentDir, "sample.json"),
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
