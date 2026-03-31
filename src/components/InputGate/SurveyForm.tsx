"use client";

import type { SurveyQuestion } from "@/types";

interface Props {
  questions: SurveyQuestion[];
  values: Record<string, string | string[]>;
  onChange: (id: string, value: string | string[]) => void;
}

export default function SurveyForm({ questions, values, onChange }: Props) {
  return (
    <div className="space-y-5">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            {q.label}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.type === "text" && (
            <input
              type="text"
              placeholder={q.placeholder}
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          )}

          {q.type === "textarea" && (
            <textarea
              placeholder={q.placeholder}
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          )}

          {q.type === "number" && (
            <input
              type="number"
              placeholder={q.placeholder}
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          )}

          {q.type === "select" && q.options && (
            <select
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 bg-white"
            >
              <option value="">{q.placeholder ?? "선택하세요"}</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {q.type === "multiselect" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = ((values[q.id] as string[]) ?? []).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = (values[q.id] as string[]) ?? [];
                      onChange(
                        q.id,
                        selected ? current.filter((v) => v !== opt) : [...current, opt]
                      );
                    }}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      selected
                        ? "bg-black text-white border-black"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
