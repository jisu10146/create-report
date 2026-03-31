"use client";

import type { AgentDefinition } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  research: "리서치",
  prediction: "예측",
  strategy: "전략",
  analysis: "분석",
};

const CATEGORY_COLORS: Record<string, string> = {
  research: "bg-blue-100 text-blue-700",
  prediction: "bg-purple-100 text-purple-700",
  strategy: "bg-green-100 text-green-700",
  analysis: "bg-orange-100 text-orange-700",
};

interface Props {
  agents: AgentDefinition[];
  onSelect: (agent: AgentDefinition) => void;
  selectedId?: string;
}

export default function AgentDesigner({ agents, onSelect, selectedId }: Props) {
  const grouped = agents.reduce<Record<string, AgentDefinition[]>>((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = [];
    acc[agent.category].push(agent);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">에이전트 선택</h2>
        <p className="text-sm text-gray-500 mt-1">
          실행할 에이전트를 선택하면 리포트가 자동으로 생성됩니다.
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onSelect(agent)}
                className={`text-left bg-white border rounded-xl p-4 transition-colors hover:border-gray-400 ${
                  selectedId === agent.id
                    ? "border-black ring-1 ring-black"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900">{agent.name}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      CATEGORY_COLORS[agent.category] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {CATEGORY_LABELS[agent.category] ?? agent.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{agent.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-md px-2 py-0.5">
                    {agent.layout}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-md px-2 py-0.5">
                    {agent.inputType === "none" ? "즉시 실행" : `입력: ${agent.inputType}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
