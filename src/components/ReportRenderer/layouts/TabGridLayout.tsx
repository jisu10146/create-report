"use client";

import { useState } from "react";
import type { ReportSchema, AgentDefinition, TabDetailData } from "@/types";
import { Tab, TabItem, Chip } from "@cubig/design-system";
import { renderComponent } from "../components";
import DetailModalA from "../modals/DetailModalA";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

export default function TabGridLayout({ report, agent }: Props) {
  const tabs = agent.reportTabs ?? [];
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [modalData, setModalData] = useState<TabDetailData | null>(null);

  const activeTabId = tabs[activeTabIdx]?.id ?? "";
  const currentTabDef = tabs[activeTabIdx];
  const currentTabData = report.tabs?.find((t) => t.id === activeTabId);

  const openDetail = (sectionId: string) => {
    const section = currentTabData?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const modalPayload: TabDetailData = {
      title: section.label,
      tabs: [
        { id: "detail", label: "상세 데이터", sections: [section] },
      ],
    };
    setModalData(modalPayload);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-report-text-primary">{agent.name}</h2>
          <p className="text-sm text-report-text-secondary mt-1">{agent.description}</p>
        </div>
        <Chip type="outline" size="medium" text="내보내기" radius="rounded-2" />
      </div>

      {/* Executive Summary */}
      {report.executiveSummary?.keyFindings?.length > 0 && (
        <div className="bg-report-card border border-report-border rounded-card p-5 mb-6 shadow-card">
          <h3 className="font-semibold text-report-text-primary mb-3">Executive Summary</h3>
          <ul className="space-y-2">
            {report.executiveSummary.keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-report-text-primary">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs — design system Tab */}
      <Tab value={activeTabIdx} onChange={setActiveTabIdx} showDivider>
        {tabs.map((tab) => (
          <TabItem key={tab.id}>{tab.label}</TabItem>
        ))}
      </Tab>

      <div className="mt-6" />

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
                sectionDef.componentType === "StrategyTable"
                  ? "col-span-2"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="report-section-title">
                  {sectionDef.label}
                </h4>
                {sectionDef.hasViewDetail && (
                  <button
                    onClick={() => openDetail(sectionDef.id)}
                    className="text-xs text-report-text-muted underline hover:text-report-text-secondary"
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
