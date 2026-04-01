"use client";

import { useState } from "react";
import type { TabDetailData } from "@/types";
import { Modal, Tab, TabItem, ChipTabs, Chip } from "@cubig/design-system";
import { renderComponent } from "../components";

interface Props {
  data: TabDetailData;
  onClose: () => void;
}

export default function DetailModalA({ data, onClose }: Props) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [activeSubTabIdx, setActiveSubTabIdx] = useState(0);

  const currentTab = data.tabs[activeTabIdx];

  const handleTabChange = (idx: number) => {
    setActiveTabIdx(idx);
    setActiveSubTabIdx(0);
  };

  const visibleSections =
    currentTab?.subTabs && currentTab.subTabs.length > 0
      ? currentTab.subTabs[activeSubTabIdx]?.sections ?? []
      : currentTab?.sections ?? [];

  return (
    <Modal
      open
      onClose={onClose}
      title={data.title}
      size="large"
      position="center"
      showCloseButton
    >
      {/* Top Tabs */}
      {data.tabs.length > 1 && (
        <Tab value={activeTabIdx} onChange={handleTabChange} showDivider>
          {data.tabs.map((tab) => (
            <TabItem key={tab.id}>{tab.label}</TabItem>
          ))}
        </Tab>
      )}

      {/* Sub-tabs (chip style) */}
      {currentTab?.subTabs && currentTab.subTabs.length > 0 && (
        <div className="py-3">
          <ChipTabs value={activeSubTabIdx} onChange={setActiveSubTabIdx}>
            {currentTab.subTabs.map((sub) => (
              <Chip key={sub.id} text={sub.label} size="small" radius="rounded-full" />
            ))}
          </ChipTabs>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4 mt-4">
        {visibleSections.map((section) => (
          <div key={section.id}>
            {section.label && (
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h4>
            )}
            {renderComponent(section.componentType, section.data)}
          </div>
        ))}
      </div>
    </Modal>
  );
}
