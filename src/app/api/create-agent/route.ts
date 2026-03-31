import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { normalizeReport } from "@/lib/reportNormalizer";
import type { AgentDefinition } from "@/types";

const AGENTS_DIR = path.join(process.cwd(), "src", "agents");

const MOCK_AGENT: AgentDefinition = {
  id: "audience-strategy",
  name: "오디언스 전략",
  description: "현재 고객 데이터를 분석해 핵심 세그먼트를 파악하고 신규 타겟 오디언스 확장 전략을 제시합니다.",
  category: "strategy",
  inputType: "none",
  layout: "tab-grid",
  modalType: "tab-detail",
  reportTabs: [
    {
      id: "analysis-report",
      label: "분석 리포트",
      sections: [
        { id: "kpi-overview", label: "KPI 개요", componentType: "MetricCard", hasViewDetail: false },
        { id: "segment-score", label: "세그먼트 점수", componentType: "ScoreCard", hasViewDetail: false },
        { id: "do-dont", label: "DO / DON'T", componentType: "DoDontCard", hasViewDetail: false },
        { id: "sample-customers", label: "샘플 고객", componentType: "SampleCard", hasViewDetail: false },
      ],
    },
    {
      id: "population-expansion",
      label: "오디언스 확장",
      sections: [
        { id: "expansion-segments", label: "확장 세그먼트", componentType: "BulletCard", hasViewDetail: true },
        { id: "segment-metrics", label: "세그먼트 KPI", componentType: "MetricCard", hasViewDetail: true },
        { id: "strategy-table", label: "실행 계획", componentType: "StrategyTable", hasViewDetail: false },
        { id: "revenue-scenario", label: "수익 시나리오", componentType: "RevenueScenarioBar", hasViewDetail: false },
      ],
    },
  ],
  promptTemplate: "",
};

function ensureAgentsDir() {
  if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    phase: "definition" | "sample";
    name?: string;
    desc?: string;
    agent?: AgentDefinition;
  };

  try {
    if (body.phase === "definition") {
      const { name, desc } = body;
      if (!name || !desc) {
        return NextResponse.json({ error: "name과 desc가 필요합니다." }, { status: 400 });
      }

      // 입력한 이름/설명을 반영한 목 에이전트 반환
      const agent: AgentDefinition = {
        ...MOCK_AGENT,
        id: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "mock-agent",
        name: name.trim(),
        description: desc.trim(),
      };

      ensureAgentsDir();
      fs.writeFileSync(
        path.join(AGENTS_DIR, `${agent.id}.json`),
        JSON.stringify(agent, null, 2),
        "utf-8"
      );

      return NextResponse.json({ agent });
    }

    if (body.phase === "sample") {
      const { agent } = body;
      if (!agent) {
        return NextResponse.json({ error: "agent가 필요합니다." }, { status: 400 });
      }

      // 기존 샘플 데이터를 그대로 사용
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
