import type { DoDontCardData } from "@/types";

export default function DoDontCard({ data }: { data: DoDontCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* DO */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
            ✓
          </span>
          <span className="font-semibold text-green-700 text-sm">DO</span>
        </div>
        <ul className="space-y-2">
          {data.dos.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* DON'T */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
            ✕
          </span>
          <span className="font-semibold text-red-700 text-sm">DON&apos;T</span>
        </div>
        <ul className="space-y-2">
          {data.donts.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
