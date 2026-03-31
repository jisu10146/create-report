"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { AgentDefinition, ReportSchema } from "@/types";

const ReportRenderer = dynamic(() => import("@/components/ReportRenderer"), { ssr: false });

type Phase = "idle" | "generating-definition" | "generating-sample" | "done" | "error";

const CATEGORY_LABELS: Record<string, string> = {
  research: "리서치",
  prediction: "예측",
  strategy: "전략",
  analysis: "분석",
};

const INPUT_TYPE_LABELS: Record<string, string> = {
  none: "입력 없음",
  "survey-form": "설문 폼",
  text: "텍스트",
  file: "파일",
};

const LAYOUT_LABELS: Record<string, string> = {
  "tab-grid": "탭 그리드",
  "single-repeat": "단일 반복",
  "single-section": "단일 섹션",
};

const MODAL_TYPE_LABELS: Record<string, string> = {
  none: "없음",
  "tab-detail": "탭 상세",
  "persona-detail": "페르소나 상세",
};

const COMPONENT_COLORS: Record<string, string> = {
  MetricCard: "bg-blue-50 text-blue-700 border-blue-200",
  BulletCard: "bg-green-50 text-green-700 border-green-200",
  ScoreCard: "bg-purple-50 text-purple-700 border-purple-200",
  DoDontCard: "bg-rose-50 text-rose-700 border-rose-200",
  SampleCard: "bg-amber-50 text-amber-700 border-amber-200",
  HorizontalBarChart: "bg-cyan-50 text-cyan-700 border-cyan-200",
  InterpretationBlock: "bg-teal-50 text-teal-700 border-teal-200",
  SyntheticPersonaCard: "bg-violet-50 text-violet-700 border-violet-200",
  SignalCard: "bg-orange-50 text-orange-700 border-orange-200",
  StrategyTable: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RevenueScenarioBar: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ExecutiveSummary: "bg-gray-50 text-gray-700 border-gray-200",
};

function ComponentBadge({ type }: { type: string }) {
  const cls = COMPONENT_COLORS[type] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono ${cls}`}>
      {type}
    </span>
  );
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function StepIndicator({ phase }: { phase: Phase }) {
  const steps = [
    { id: "definition", label: "구조 생성", phases: ["generating-definition"] },
    { id: "sample", label: "리포트 생성", phases: ["generating-sample"] },
    { id: "done", label: "완료", phases: ["done"] },
  ];

  const getStepState = (stepPhases: string[]) => {
    if (phase === "done") return "done";
    if (stepPhases.includes(phase)) return "active";
    const allPhases: Phase[] = ["idle", "generating-definition", "generating-sample", "done"];
    const currentIdx = allPhases.indexOf(phase);
    const stepIdx = allPhases.indexOf(stepPhases[0] as Phase);
    return currentIdx > stepIdx ? "done" : "pending";
  };

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, i) => {
        const state = getStepState(step.phases);
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  state === "done"
                    ? "bg-gray-900 text-white"
                    : state === "active"
                    ? "bg-gray-900 text-white animate-pulse"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  state === "active" ? "font-semibold text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${state === "done" ? "bg-gray-900" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgentStructureCard({ agent }: { agent: AgentDefinition }) {
  const sections =
    agent.layout === "tab-grid"
      ? agent.reportTabs?.flatMap((tab) =>
          tab.sections.map((s) => ({ label: `[${tab.label}] ${s.label}`, componentType: s.componentType }))
        ) ?? []
      : agent.reportSections?.map((s) => ({ label: s.label, componentType: s.componentType })) ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{agent.id}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{agent.description}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
          {CATEGORY_LABELS[agent.category] ?? agent.category}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <MetaBadge label="입력 방식" value={INPUT_TYPE_LABELS[agent.inputType] ?? agent.inputType} />
        <MetaBadge label="레이아웃" value={LAYOUT_LABELS[agent.layout] ?? agent.layout} />
        <MetaBadge label="모달" value={MODAL_TYPE_LABELS[agent.modalType] ?? agent.modalType} />
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">섹션 구성</p>
        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-700">
                <span className="text-gray-400 font-mono text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </span>
              <ComponentBadge type={s.componentType} />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">저장 위치</p>
        <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          src/agents/{agent.id}.json
        </code>
      </div>
    </div>
  );
}

export default function StudioClient() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [report, setReport] = useState<ReportSchema | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;

    setPhase("generating-definition");
    setAgent(null);
    setReport(null);
    setErrorMsg(null);

    try {
      const defRes = await fetch("/api/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "definition", name: name.trim(), desc: desc.trim() }),
      });

      if (!defRes.ok) {
        const err = await defRes.json();
        throw new Error(err.detail ?? err.error ?? "구조 생성 실패");
      }

      const { agent: generatedAgent } = await defRes.json() as { agent: AgentDefinition };
      setAgent(generatedAgent);
      setPhase("generating-sample");

      const sampleRes = await fetch("/api/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "sample", agent: generatedAgent }),
      });

      if (!sampleRes.ok) {
        const err = await sampleRes.json();
        throw new Error(err.detail ?? err.error ?? "샘플 리포트 생성 실패");
      }

      const { report: generatedReport } = await sampleRes.json() as { report: ReportSchema };
      setReport(generatedReport);
      setPhase("done");
    } catch (err) {
      setErrorMsg(String(err));
      setPhase("error");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setAgent(null);
    setReport(null);
    setErrorMsg(null);
    setName("");
    setDesc("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-semibold text-gray-900 hover:text-gray-600">
            Agent Report System
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-500">에이전트 스튜디오</span>
        </div>
        {phase !== "idle" && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-gray-700 underline"
          >
            새로 만들기
          </button>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">에이전트 스튜디오</h1>
          <p className="text-gray-500 text-sm">
            이름과 설명만 입력하면 에이전트 구조와 샘플 리포트를 자동 생성합니다.
          </p>
        </div>

        {(phase === "idle" || phase === "error") && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                에이전트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 신제품 가격 전략"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                한 줄 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="예: 경쟁사 대비 최적 가격대를 분석하고 시나리오별 수익을 예측합니다."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                required
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || !desc.trim()}
              className="w-full bg-gray-900 text-white text-sm font-semibold rounded-lg px-6 py-3 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              에이전트 생성
            </button>
          </form>
        )}

        {phase !== "idle" && phase !== "error" && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
            <StepIndicator phase={phase} />
            {phase === "generating-definition" && (
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Claude가 에이전트 구조를 설계하고 있습니다...
              </div>
            )}
            {phase === "generating-sample" && (
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Claude가 샘플 리포트 데이터를 생성하고 있습니다...
              </div>
            )}
            {phase === "done" && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <span>생성 완료.</span>
                <a
                  href={`/preview/${agent?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 font-medium underline hover:no-underline"
                >
                  /preview/{agent?.id} 에서도 확인 가능 →
                </a>
              </div>
            )}
          </div>
        )}

        {agent && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              1. 에이전트 구조
            </h2>
            <AgentStructureCard agent={agent} />
          </div>
        )}

        {phase === "generating-sample" && !report && (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">샘플 리포트 생성 중...</p>
            </div>
          </div>
        )}

        {report && agent && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              2. 리포트 디자인 미리보기
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-500 font-mono">
                  src/agents/{agent.id}.sample.json 기반 렌더링
                </span>
              </div>
              <div className="p-6">
                <ReportRenderer report={report} agent={agent} />
              </div>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="pb-8 flex justify-center">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-6 py-2.5 transition-colors"
            >
              새 에이전트 만들기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
