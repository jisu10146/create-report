import type { SampleCardData } from "@/types";

export default function SampleCard({ data }: { data: SampleCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <span className="inline-block text-xs font-semibold bg-gray-100 text-gray-600 rounded-md px-2 py-0.5 mb-3">
            {item.id}
          </span>
          <ul className="space-y-1.5">
            {item.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
