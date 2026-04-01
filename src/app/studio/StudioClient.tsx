"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { AgentDefinition, ReportSchema } from "@/types";
import { Chip, Badge, Divider, Callout } from "@cubig/design-system";

const ReportRenderer = dynamic(() => import("@/components/ReportRenderer"), { ssr: false });

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Phase = "idle" | "suggesting" | "review" | "generating-definition" | "reviewing" | "generating-sample" | "done" | "error";

interface StudioInput {
  name: string;
  desc: string;
  audience: string;
  keyQuestions: string[];
  dataTypes: string[];
  volume: "compact" | "standard" | "detailed";
}

const INITIAL_INPUT: StudioInput = {
  name: "",
  desc: "",
  audience: "",
  keyQuestions: [""],
  dataTypes: [],
  volume: "standard",
};

/* ─── Constants ──────────────────────────────────────────────────────────── */

const AUDIENCE_OPTIONS = [
  "경영진 (C-level)",
  "팀 리더 / 매니저",
  "실무 담당자",
  "외부 클라이언트",
];

const DATA_TYPE_OPTIONS = [
  "서베이 응답",
  "고객 DB",
  "매출/거래 데이터",
  "텍스트 피드백",
  "웹/앱 로그",
  "외부 시장 데이터",
];

const VOLUME_OPTIONS: Array<{ value: StudioInput["volume"]; label: string; desc: string }> = [
  { value: "compact", label: "한 페이지 요약", desc: "핵심 지표 + 결론 중심, 3~4개 섹션" },
  { value: "standard", label: "표준", desc: "분석 + 인사이트 + 실행안, 6~8개 섹션" },
  { value: "detailed", label: "상세 분석", desc: "데이터 심층 분석 + 페르소나 + 전략, 8~12개 섹션" },
];

const CATEGORY_LABELS: Record<string, string> = {
  research: "리서치", prediction: "예측", strategy: "전략", analysis: "분석",
};
const LAYOUT_LABELS: Record<string, string> = {
  "tab-grid": "탭 그리드", "single-repeat": "단일 반복", "single-section": "단일 섹션",
};
const MODAL_TYPE_LABELS: Record<string, string> = {
  none: "없음", "tab-detail": "탭 상세", "persona-detail": "페르소나 상세",
};
const INPUT_TYPE_LABELS: Record<string, string> = {
  none: "입력 없음", "survey-form": "설문 폼", text: "텍스트", file: "파일",
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

/* ─── Auto-suggest logic ─────────────────────────────────────────────────── */
// TODO: Replace with AI call when API is connected

function suggestConfig(name: string, desc: string): Omit<StudioInput, "name" | "desc"> {
  const text = `${name} ${desc}`.toLowerCase();

  // Audience
  let audience = "실무 담당자";
  if (text.match(/경영|c-level|ceo|cfo|임원|의사결정/)) audience = "경영진 (C-level)";
  else if (text.match(/팀|매니저|리더|관리자|운영/)) audience = "팀 리더 / 매니저";
  else if (text.match(/클라이언트|고객사|외부|제안|발표/)) audience = "외부 클라이언트";

  // Data types
  const dataTypes: string[] = [];
  if (text.match(/서베이|설문|응답|survey|psm|조사/)) dataTypes.push("서베이 응답");
  if (text.match(/고객|페르소나|유저|사용자|프로필|db|세그먼트/)) dataTypes.push("고객 DB");
  if (text.match(/매출|거래|결제|revenue|가격|pricing|구매|sales/)) dataTypes.push("매출/거래 데이터");
  if (text.match(/피드백|리뷰|후기|텍스트|의견|voc/)) dataTypes.push("텍스트 피드백");
  if (text.match(/로그|행동|클릭|세션|방문|이벤트|웹|앱/)) dataTypes.push("웹/앱 로그");
  if (text.match(/시장|경쟁|트렌드|산업|외부|벤치마크/)) dataTypes.push("외부 시장 데이터");
  if (dataTypes.length === 0) dataTypes.push("매출/거래 데이터");

  // Key questions
  const keyQuestions: string[] = [];

  if (text.match(/가격|pricing|psm|적정|price/)) {
    keyQuestions.push("적정 가격대는 얼마인가?");
    keyQuestions.push("소비자가 수용할 수 있는 가격 상한선은?");
  }
  if (text.match(/고객|세그먼트|타겟|오디언스|페르소나/)) {
    keyQuestions.push("핵심 타겟 고객은 누구인가?");
  }
  if (text.match(/이탈|churn|리텐션|retention|위험/)) {
    keyQuestions.push("이탈 위험이 높은 고객군의 특징은?");
    keyQuestions.push("이탈을 방지하기 위한 핵심 액션은?");
  }
  if (text.match(/전략|strategy|실행|계획|로드맵/)) {
    keyQuestions.push("구체적인 실행 계획은 무엇인가?");
  }
  if (text.match(/매출|수익|revenue|roi|성과/)) {
    keyQuestions.push("예상 수익/성과는 어느 정도인가?");
  }
  if (text.match(/서베이|설문|응답|조사/)) {
    keyQuestions.push("응답 데이터에서 발견된 핵심 인사이트는?");
  }

  if (keyQuestions.length === 0) {
    keyQuestions.push("핵심 인사이트는 무엇인가?");
    keyQuestions.push("어떤 액션을 취해야 하는가?");
  }
  if (keyQuestions.length < 2) {
    keyQuestions.push("어떤 액션을 취해야 하는가?");
  }

  // Volume
  let volume: StudioInput["volume"] = "standard";
  if (text.match(/요약|간단|핵심만|한 페이지|compact/)) volume = "compact";
  else if (text.match(/상세|심층|detailed|종합|전체/)) volume = "detailed";

  return { audience, keyQuestions, dataTypes, volume };
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function ComponentBadge({ type }: { type: string }) {
  const cls = COMPONENT_COLORS[type] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono ${cls}`}>
      {type}
    </span>
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
          <span className="text-xs font-mono text-gray-400">{agent.id}</span>
          <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{agent.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{agent.description}</p>
        </div>
        <Badge variant="secondary" type="outline" size="small" text={CATEGORY_LABELS[agent.category] ?? agent.category} />
      </div>
      <Divider orientation="horizontal" thickness={1} />
      <div className="grid grid-cols-3 gap-4">
        <div><span className="text-xs text-gray-400 uppercase">입력 방식</span><p className="text-sm font-medium text-gray-800 mt-0.5">{INPUT_TYPE_LABELS[agent.inputType] ?? agent.inputType}</p></div>
        <div><span className="text-xs text-gray-400 uppercase">레이아웃</span><p className="text-sm font-medium text-gray-800 mt-0.5">{LAYOUT_LABELS[agent.layout] ?? agent.layout}</p></div>
        <div><span className="text-xs text-gray-400 uppercase">모달</span><p className="text-sm font-medium text-gray-800 mt-0.5">{MODAL_TYPE_LABELS[agent.modalType] ?? agent.modalType}</p></div>
      </div>
      <Divider orientation="horizontal" thickness={1} />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">섹션 구성</p>
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
  );
}

function ProgressIndicator({ phase }: { phase: Phase }) {
  const steps = [
    { id: "def", label: "구조 생성", phases: ["generating-definition"] },
    { id: "review", label: "구성안 검토", phases: ["reviewing"] },
    { id: "sample", label: "리포트 생성", phases: ["generating-sample"] },
    { id: "done", label: "완료", phases: ["done"] },
  ];
  const allPhases = ["generating-definition", "reviewing", "generating-sample", "done"];
  const currentIdx = allPhases.indexOf(phase);

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, i) => {
        const stepIdx = allPhases.indexOf(step.phases[0]);
        const isActive = step.phases.includes(phase);
        const isDone = phase === "done" || (!isActive && currentIdx > stepIdx);
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone ? "bg-gray-900 text-white" : isActive ? "bg-gray-900 text-white animate-pulse" : "bg-gray-200 text-gray-400"
              }`}>{isDone ? "✓" : i + 1}</div>
              <span className={`text-sm ${isActive ? "font-semibold text-gray-900" : isDone ? "text-gray-700" : "text-gray-400"}`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-px ${isDone ? "bg-gray-900" : "bg-gray-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function StudioClient() {
  const [input, setInput] = useState<StudioInput>(INITIAL_INPUT);
  const [phase, setPhase] = useState<Phase>("idle");
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [report, setReport] = useState<ReportSchema | null>(null);
  const [reviewChanges, setReviewChanges] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ── Handlers ── */

  const handleAutoSuggest = () => {
    setPhase("suggesting");
    // Simulate a brief delay for the "thinking" feel
    setTimeout(() => {
      const suggested = suggestConfig(input.name, input.desc);
      setInput((prev) => ({ ...prev, ...suggested }));
      setPhase("review");
    }, 400);
  };

  const updateQuestion = (idx: number, val: string) => {
    const next = [...input.keyQuestions];
    next[idx] = val;
    setInput({ ...input, keyQuestions: next });
  };
  const addQuestion = () => {
    if (input.keyQuestions.length < 5) setInput({ ...input, keyQuestions: [...input.keyQuestions, ""] });
  };
  const removeQuestion = (idx: number) => {
    if (input.keyQuestions.length > 1) setInput({ ...input, keyQuestions: input.keyQuestions.filter((_, i) => i !== idx) });
  };
  const toggleDataType = (dt: string) => {
    setInput({
      ...input,
      dataTypes: input.dataTypes.includes(dt) ? input.dataTypes.filter((d) => d !== dt) : [...input.dataTypes, dt],
    });
  };

  const handleSubmit = async () => {
    setPhase("generating-definition");
    setAgent(null);
    setReport(null);
    setReviewChanges([]);
    setErrorMsg(null);

    const context = {
      audience: input.audience,
      keyQuestions: input.keyQuestions.filter((q) => q.trim()),
      dataTypes: input.dataTypes,
      volume: input.volume,
    };

    try {
      // Phase 1: Generate definition
      const defRes = await fetch("/api/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "definition",
          name: input.name.trim(),
          desc: input.desc.trim(),
          ...context,
        }),
      });
      if (!defRes.ok) { const err = await defRes.json(); throw new Error(err.detail ?? err.error ?? "구조 생성 실패"); }

      const { agent: generatedAgent } = (await defRes.json()) as { agent: AgentDefinition };
      setAgent(generatedAgent);

      // Phase 2: Review & improve
      setPhase("reviewing");
      const reviewRes = await fetch("/api/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "review",
          agent: generatedAgent,
          ...context,
        }),
      });
      if (!reviewRes.ok) { const err = await reviewRes.json(); throw new Error(err.detail ?? err.error ?? "검토 실패"); }

      const { agent: reviewedAgent, reviewChanges: changes } = (await reviewRes.json()) as {
        agent: AgentDefinition;
        reviewChanges: string[];
      };
      setAgent(reviewedAgent);
      setReviewChanges(changes);

      // Phase 3: Generate sample report
      setPhase("generating-sample");
      const sampleRes = await fetch("/api/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "sample", agent: reviewedAgent }),
      });
      if (!sampleRes.ok) { const err = await sampleRes.json(); throw new Error(err.detail ?? err.error ?? "샘플 리포트 생성 실패"); }

      const { report: generatedReport } = (await sampleRes.json()) as { report: ReportSchema };
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
    setReviewChanges([]);
    setErrorMsg(null);
    setInput(INITIAL_INPUT);
  };

  const isGenerating = phase === "generating-definition" || phase === "reviewing" || phase === "generating-sample";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-semibold text-gray-900 hover:text-gray-600">Agent Report System</a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-500">에이전트 스튜디오</span>
        </div>
        {phase !== "idle" && (
          <button onClick={handleReset} className="text-sm text-gray-400 hover:text-gray-700 underline">새로 만들기</button>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">에이전트 스튜디오</h1>
          <p className="text-gray-500 text-sm">에이전트 이름과 설명을 입력하면 리포트 구성을 자동으로 설계합니다.</p>
        </div>

        {/* ─── Step 1: 이름 + 설명 입력 ─── */}
        {(phase === "idle" || phase === "suggesting") && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                에이전트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={input.name}
                onChange={(e) => setInput({ ...input, name: e.target.value })}
                placeholder="예: New Product Pricing"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={input.desc}
                onChange={(e) => setInput({ ...input, desc: e.target.value })}
                placeholder="예: 서베이 기반 PSM 시뮬레이션으로 신제품 적정 가격대를 분석합니다."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAutoSuggest}
                disabled={!input.name.trim() || !input.desc.trim() || phase === "suggesting"}
                className="bg-gray-900 text-white text-sm font-semibold rounded-lg px-6 py-2.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {phase === "suggesting" && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {phase === "suggesting" ? "구성 분석 중..." : "자동 구성"}
              </button>
            </div>
          </div>
        )}

        {/* ─── Review: 자동 구성 결과 확인/수정 ─── */}
        {(phase === "review" || phase === "error") && (
          <div className="space-y-6">
            {/* 기본 정보 요약 */}
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{input.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{input.desc}</p>
              </div>
              <button
                onClick={() => setPhase("idle")}
                className="text-xs text-gray-400 hover:text-gray-700 underline shrink-0"
              >
                수정
              </button>
            </div>

            {/* 자동 구성 결과 — 한 화면에서 수정 가능 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info" type="solid" size="small" text="자동 구성" />
                <span className="text-xs text-gray-400">설명을 기반으로 추천된 설정입니다. 수정할 수 있습니다.</span>
              </div>

              {/* 읽는 사람 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">읽는 사람</label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt}
                      text={opt}
                      type="outline"
                      size="medium"
                      radius="rounded-full"
                      active={input.audience === opt}
                      onClick={() => setInput({ ...input, audience: opt })}
                    />
                  ))}
                </div>
              </div>

              <Divider orientation="horizontal" thickness={1} />

              {/* 핵심 질문 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">핵심 질문</label>
                <div className="space-y-2">
                  {input.keyQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 shrink-0">Q{i + 1}</span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateQuestion(i, e.target.value)}
                        placeholder="예: 적정 가격대는?"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      {input.keyQuestions.length > 1 && (
                        <button onClick={() => removeQuestion(i)} className="text-gray-300 hover:text-gray-500 text-lg">×</button>
                      )}
                    </div>
                  ))}
                </div>
                {input.keyQuestions.length < 5 && (
                  <button onClick={addQuestion} className="text-xs text-gray-500 hover:text-gray-700 underline">+ 질문 추가</button>
                )}
              </div>

              <Divider orientation="horizontal" thickness={1} />

              {/* 입력 데이터 유형 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">입력 데이터 유형</label>
                <div className="flex flex-wrap gap-2">
                  {DATA_TYPE_OPTIONS.map((dt) => (
                    <Chip
                      key={dt}
                      text={dt}
                      type="outline"
                      size="medium"
                      radius="rounded-full"
                      active={input.dataTypes.includes(dt)}
                      onClick={() => toggleDataType(dt)}
                    />
                  ))}
                </div>
              </div>

              <Divider orientation="horizontal" thickness={1} />

              {/* 분량 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">리포트 분량</label>
                <div className="grid grid-cols-3 gap-3">
                  {VOLUME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setInput({ ...input, volume: opt.value })}
                      className={`text-left border rounded-xl p-3 transition-colors ${
                        input.volume === opt.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${input.volume === opt.value ? "text-gray-900" : "text-gray-700"}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <Callout variant="negative" size="small" title="오류 발생" description={errorMsg} leadingIcon />
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-gray-900 text-white text-sm font-semibold rounded-lg px-8 py-3 hover:bg-gray-700 transition-colors"
              >
                에이전트 생성
              </button>
            </div>
          </div>
        )}

        {/* ─── Generating ─── */}
        {isGenerating && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 space-y-4">
            <ProgressIndicator phase={phase} />
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              {phase === "generating-definition"
                ? "입력 정보를 기반으로 최적 리포트 구조를 설계하고 있습니다..."
                : phase === "reviewing"
                ? "구성안을 검토하고 보완하고 있습니다..."
                : "샘플 리포트 데이터를 생성하고 있습니다..."}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 space-y-4">
            <ProgressIndicator phase={phase} />
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
          </div>
        )}

        {/* ─── Result: Review Changes ─── */}
        {reviewChanges.length > 0 && agent && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">1. 구성안 검토 결과</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="info" type="solid" size="small" text="자동 검토" />
                <span className="text-xs text-gray-500">
                  핵심 질문 대응, 독자 수준, 필수 위젯 기준으로 검토했습니다.
                </span>
              </div>
              <ul className="space-y-1.5">
                {reviewChanges.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 text-gray-400">
                      {change.includes("보완 사항 없음") ? "✓" : "→"}
                    </span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─── Result: Agent Structure ─── */}
        {agent && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {reviewChanges.length > 0 ? "2" : "1"}. 에이전트 구조
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
              {reviewChanges.length > 0 ? "3" : "2"}. 리포트 미리보기
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-500 font-mono">샘플 데이터 기반 렌더링</span>
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
