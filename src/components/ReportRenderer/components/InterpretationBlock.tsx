import type { InterpretationBlockData } from "@/types";

export default function InterpretationBlock({ data }: { data: InterpretationBlockData }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        AI
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{data.text}</p>
    </div>
  );
}
