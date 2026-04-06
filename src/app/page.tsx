"use client";

import { useState } from "react";
import type { AgentDefinition, ReportSchema } from "@/types";
import AgentDesigner from "@/components/AgentDesigner";
import InputGate from "@/components/InputGate";
import ReportRenderer from "@/components/ReportRenderer";

// Static agent list — loaded at build time or via client fetch
// In production this would come from the server via a layout or API route
import audienceStrategy from "@/agents/definitions/audience-strategy/agent.json";
import personaSurvey from "@/agents/definitions/persona-survey/agent.json";
import churnPrediction from "@/agents/definitions/churn-prediction/agent.json";
import newPricingProduct from "@/agents/definitions/new-pricing-product/agent.json";

const ALL_AGENTS = [
  audienceStrategy,
  personaSurvey,
  churnPrediction,
  newPricingProduct,
] as AgentDefinition[];

type Step = "select" | "input" | "report";

export default function Home() {
  const [step, setStep] = useState<Step>("select");
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [report, setReport] = useState<ReportSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAgent = (agent: AgentDefinition) => {
    setSelectedAgent(agent);
    if (agent.inputType === "none") {
      // Type A: 즉시 실행
      runAgent(agent, "");
    } else {
      // Type B: 폼 입력 후 실행
      setStep("input");
    }
  };

  const runAgent = async (agent: AgentDefinition, input: string) => {
    setIsLoading(true);
    setStep("report");
    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, input }),
      });
      if (!res.ok) throw new Error("API error");
      const data: ReportSchema = await res.json();
      setReport(data);
    } catch {
      alert("리포트 생성 중 오류가 발생했습니다.");
      setStep("select");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = (input: string) => {
    if (!selectedAgent) return;
    runAgent(selectedAgent, input);
  };

  const handleBack = () => {
    setStep("select");
    setSelectedAgent(null);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Agent Report System</h1>
        <div className="flex items-center gap-4">
          {step !== "select" && (
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← 에이전트 목록
            </button>
          )}
          <a
            href="/studio"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            + 에이전트 만들기
          </a>
        </div>
      </nav>

      <main className="max-w-[1720px] mx-auto px-6 py-8">
        {step === "select" && (
          <AgentDesigner
            agents={ALL_AGENTS}
            onSelect={handleSelectAgent}
            selectedId={selectedAgent?.id}
          />
        )}

        {step === "input" && selectedAgent && (
          <InputGate
            agent={selectedAgent}
            onSubmit={handleInputSubmit}
            isLoading={isLoading}
          />
        )}

        {step === "report" && selectedAgent && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">리포트를 생성하고 있습니다...</p>
                </div>
              </div>
            ) : report ? (
              <ReportRenderer report={report} agent={selectedAgent} />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
