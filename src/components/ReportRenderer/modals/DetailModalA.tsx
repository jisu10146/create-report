"use client";

import { useState } from "react";
import type { TabDetailData } from "@/types";
import { renderComponent } from "../components";

interface Props {
  data: TabDetailData;
  onClose: () => void;
}

export default function DetailModalA({ data, onClose }: Props) {
  const [activeTab, setActiveTab] = useState(data.tabs[0]?.id ?? "");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(
    data.tabs[0]?.subTabs?.[0]?.id ?? null
  );

  const currentTab = data.tabs.find((t) => t.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = data.tabs.find((t) => t.id === tabId);
    setActiveSubTab(tab?.subTabs?.[0]?.id ?? null);
  };

  const visibleSections =
    currentTab?.subTabs && activeSubTab
      ? currentTab.subTabs.find((s) => s.id === activeSubTab)?.sections ?? []
      : currentTab?.sections ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 shrink-0">
          <h3 className="font-semibold text-gray-900 text-lg">{data.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
          >
            ✕
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex border-b border-gray-200 px-6 shrink-0">
          {data.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-tabs (chip style) */}
        {currentTab?.subTabs && currentTab.subTabs.length > 0 && (
          <div className="flex gap-2 px-6 py-3 border-b border-gray-100 shrink-0 flex-wrap">
            {currentTab.subTabs.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  activeSubTab === sub.id
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {visibleSections.map((section) => (
            <div key={section.id}>
              {section.label && (
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h4>
              )}
              {renderComponent(section.componentType, section.data)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
