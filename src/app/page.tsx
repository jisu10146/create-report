"use client";

import type { AgentDefinition } from "@/types";
import AgentDesigner from "@/components/AgentDesigner";

import audienceStrategy from "@/agents/definitions/audience-strategy/agent.json";
import personaSurvey from "@/agents/definitions/persona-survey/agent.json";
import churnPrediction from "@/agents/definitions/churn-prediction/agent.json";
import newPricingProduct from "@/agents/definitions/new-pricing-product/agent.json";
import customerSupport from "@/agents/definitions/customer-support-analysis/agent.json";
import reviewAnalysis from "@/agents/definitions/review-analysis/agent.json";
import marketingAttribution from "@/agents/definitions/marketing-attribution/agent.json";

const ALL_AGENTS = [
  audienceStrategy,
  personaSurvey,
  churnPrediction,
  newPricingProduct,
  customerSupport,
  reviewAnalysis,
  marketingAttribution,
] as AgentDefinition[];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
        <h1 className="font-semibold text-gray-900">Agent Report System</h1>
      </nav>

      <main className="max-w-[1720px] mx-auto px-6 py-8">
        <AgentDesigner
          agents={ALL_AGENTS}
          onSelect={(agent) => {
            // 에이전트 선택 시 preview 페이지로 이동
            window.location.href = `/preview/${agent.id}`;
          }}
        />
      </main>
    </div>
  );
}
