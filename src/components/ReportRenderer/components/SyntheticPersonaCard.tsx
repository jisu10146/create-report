"use client";

import { useState } from "react";
import type { SyntheticPersonaCardData } from "@/types";

interface PersonaDetailModalProps {
  persona: SyntheticPersonaCardData["items"][number];
  onClose: () => void;
}

function PersonaDetailModal({ persona, onClose }: PersonaDetailModalProps) {
  const [activeTab, setActiveTab] = useState(persona.tabs[0]?.label ?? "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-md px-2 py-0.5">
                  {persona.id}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{persona.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {persona.gender} · {persona.age}세 · {persona.job}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ✕
            </button>
          </div>
          {persona.summary && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{persona.summary}</p>
          )}
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-2">
          {persona.tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                activeTab === tab.label
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="px-6 pb-6 pt-3">
          {persona.tabs
            .filter((t) => t.label === activeTab)
            .map((tab) => (
              <p key={tab.label} className="text-sm text-gray-700 leading-relaxed">
                {tab.content}
              </p>
            ))}
        </div>
      </div>
    </div>
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
            <span className="inline-block text-xs font-semibold bg-gray-100 text-gray-600 rounded-md px-2 py-0.5 mb-2">
              {persona.id}
            </span>
            {persona.name && (
              <p className="font-semibold text-gray-900 text-sm">{persona.name}</p>
            )}
            {(persona.gender || persona.age || persona.job) && (
              <p className="text-xs text-gray-500 mt-0.5">
                {[persona.gender, persona.age && `${persona.age}세`, persona.job]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {persona.summary && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{persona.summary}</p>
            )}
            <span className="mt-3 inline-block text-xs text-gray-400 underline">
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
