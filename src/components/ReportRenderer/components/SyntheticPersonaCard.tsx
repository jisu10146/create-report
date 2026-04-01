"use client";

import { useState } from "react";
import { Avatar, Badge, Modal, ChipTabs, Chip } from "@cubig/design-system";
import type { SyntheticPersonaCardData } from "@/types";

interface PersonaDetailModalProps {
  persona: SyntheticPersonaCardData["items"][number];
  onClose: () => void;
}

function PersonaDetailModal({ persona, onClose }: PersonaDetailModalProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  return (
    <Modal
      open
      onClose={onClose}
      title={persona.name ?? persona.id}
      size="small"
      position="center"
      showCloseButton
    >
      {/* Profile */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar type="initial" size="medium" value={persona.name ?? persona.id} />
        <div>
          <Badge variant="secondary" type="outline" size="small" text={persona.id} />
          <p className="text-sm text-gray-500 mt-1">
            {persona.gender} · {persona.age}세 · {persona.job}
          </p>
        </div>
      </div>

      {persona.summary && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{persona.summary}</p>
      )}

      {/* Tabs */}
      <ChipTabs value={activeTabIdx} onChange={setActiveTabIdx}>
        {persona.tabs.map((tab) => (
          <Chip key={tab.label} text={tab.label} size="small" radius="rounded-full" />
        ))}
      </ChipTabs>

      {/* Content */}
      <div className="mt-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {persona.tabs[activeTabIdx]?.content}
        </p>
      </div>
    </Modal>
  );
}

export default function SyntheticPersonaCard({ data }: { data: SyntheticPersonaCardData }) {
  const [selected, setSelected] = useState<SyntheticPersonaCardData["items"][number] | null>(
    null
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((persona) => (
          <div
            key={persona.id}
            className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setSelected(persona)}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar type="initial" size="small" value={persona.name ?? persona.id} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {persona.name && (
                    <p className="font-semibold text-gray-900 text-sm">{persona.name}</p>
                  )}
                  <Badge variant="secondary" type="outline" size="small" text={persona.id} />
                </div>
                {(persona.gender || persona.age || persona.job) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[persona.gender, persona.age && `${persona.age}세`, persona.job]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
            {persona.summary && (
              <p className="text-xs text-gray-600 line-clamp-2">{persona.summary}</p>
            )}
            <span className="mt-2 inline-block text-xs text-gray-400 underline">
              View Detail →
            </span>
          </div>
        ))}
      </div>
      {selected && (
        <PersonaDetailModal persona={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
