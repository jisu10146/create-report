"use client";

import { useState } from "react";
import type { PersonaDetailData } from "@/types";

interface Props {
  data: PersonaDetailData;
  onClose: () => void;
}

export default function DetailModalB({ data, onClose }: Props) {
  const [activeTab, setActiveTab] = useState(data.tabs[0]?.label ?? "");

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
              <h3 className="font-semibold text-gray-900 text-lg">{data.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.gender} · {data.age}세 · {data.job}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-2">
          {data.tabs.map((tab) => (
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
          {data.tabs
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
