"use client";

import { useState } from "react";
import type { AgentDefinition } from "@/types";
import SurveyForm from "./SurveyForm";

// Default survey questions for survey-form agents
// In production, these could be stored in the agent JSON
const DEFAULT_SURVEY_QUESTIONS = [
  {
    id: "product",
    label: "조사 대상 제품/서비스명",
    type: "text" as const,
    placeholder: "예: 스마트워치 프로 3세대",
    required: true,
  },
  {
    id: "target",
    label: "타겟 고객층",
    type: "text" as const,
    placeholder: "예: 20-35세 직장인",
    required: true,
  },
  {
    id: "responseCount",
    label: "서베이 응답자 수",
    type: "number" as const,
    placeholder: "예: 342",
    required: true,
  },
  {
    id: "goal",
    label: "분석 목표",
    type: "textarea" as const,
    placeholder: "이번 서베이 분석을 통해 알고 싶은 것을 자유롭게 작성해주세요.",
    required: false,
  },
  {
    id: "channel",
    label: "주요 마케팅 채널",
    type: "multiselect" as const,
    options: ["인스타그램", "유튜브", "네이버", "카카오", "오프라인", "이메일", "기타"],
    required: false,
  },
];

interface Props {
  agent: AgentDefinition;
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

export default function InputGate({ agent, onSubmit, isLoading }: Props) {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (id: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let input = "";
    if (agent.inputType === "survey-form") {
      input = Object.entries(values)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\n");
    } else if (agent.inputType === "text") {
      input = textInput;
    } else if (agent.inputType === "file" && file) {
      input = `파일명: ${file.name}`;
    }
    onSubmit(input);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-1">{agent.name}</h2>
        <p className="text-sm text-gray-500 mb-6">{agent.description}</p>

        {agent.inputType === "survey-form" && (
          <SurveyForm
            questions={DEFAULT_SURVEY_QUESTIONS}
            values={values}
            onChange={handleChange}
          />
        )}

        {agent.inputType === "text" && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="분석할 내용을 입력해주세요..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
          />
        )}

        {agent.inputType === "file" && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <span className="text-sm font-semibold text-gray-700">{file.name}</span>
              ) : (
                <>
                  <span className="text-sm text-gray-500 block">
                    파일을 드래그하거나 클릭하여 업로드
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    CSV, XLSX, JSON 지원
                  </span>
                </>
              )}
            </label>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 w-full bg-black text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "리포트 생성 중..." : "리포트 생성하기"}
        </button>
      </div>
    </div>
  );
}
