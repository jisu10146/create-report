"use client";

import { useState } from "react";
import type { ReportSchema, AgentDefinition, TabDetailData } from "@/types";
import { renderComponent } from "../components";
import DetailModalA from "../modals/DetailModalA";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

export default function TabGridLayout({ report, agent }: Props) {
  const tabs = agent.reportTabs ?? [];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [modalData, setModalData] = useState<TabDetailData | null>(null);

  const currentTabDef = tabs.find((t) => t.id === activeTab);
  const currentTabData = report.tabs?.find((t) => t.id === activeTab);

  const openDetail = (sectionId: string) => {
    const section = currentTabData?.sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Build a simple tab-detail modal with just this section's data
    const modalPayload: TabDetailData = {
      title: section.label,
      tabs: [
        {
          id: "detail",
          label: "상세 데이터",
          sections: [section],
        },
      ],
    };
    setModalData(modalPayload);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
        </div>
        <button className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors">
          내보내기
        </button>
      </div>

      {/* Executive Summary */}
      {report.executiveSummary?.keyFindings?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
          <ul className="space-y-2">
            {report.executiveSummary.keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid sections */}
      <div className="grid grid-cols-2 gap-4">
        {currentTabDef?.sections.map((sectionDef) => {
          const sectionData = currentTabData?.sections.find(
            (s) => s.id === sectionDef.id
          );
          if (!sectionData) return null;

          return (
            <div
              key={sectionDef.id}
              className={`${
                sectionDef.componentType === "StrategyTable" ||
                sectionDef.componentType === "RevenueScenarioBar" ||
                sectionDef.componentType === "DoDontCard"
                  ? "col-span-2"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  {sectionDef.label}
                </h4>
                {sectionDef.hasViewDetail && (
                  <button
                    onClick={() => openDetail(sectionDef.id)}
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                    View Detail →
                  </button>
                )}
              </div>
              {renderComponent(sectionDef.componentType, sectionData.data)}
            </div>
          );
        })}
      </div>

      {modalData && (
        <DetailModalA data={modalData} onClose={() => setModalData(null)} />
      )}
    </>
  );
}
