"use client";

import { useState } from "react";
import type { PersonaDetailData } from "@/types";
import { Modal, ChipTabs, Chip } from "@cubig/design-system";

interface Props {
  data: PersonaDetailData;
  onClose: () => void;
}

export default function DetailModalB({ data, onClose }: Props) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  return (
    <Modal
      open
      onClose={onClose}
      title={data.name}
      size="small"
      position="center"
      showCloseButton
    >
      <p className="text-sm text-gray-500 -mt-2 mb-4">
        {data.gender} · {data.age}세 · {data.job}
      </p>

      <ChipTabs value={activeTabIdx} onChange={setActiveTabIdx}>
        {data.tabs.map((tab) => (
          <Chip key={tab.label} text={tab.label} size="small" radius="rounded-full" />
        ))}
      </ChipTabs>

      <div className="mt-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {data.tabs[activeTabIdx]?.content}
        </p>
      </div>
    </Modal>
  );
}
