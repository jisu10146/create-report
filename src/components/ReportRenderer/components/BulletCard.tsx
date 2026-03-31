import type { BulletCardData } from "@/types";

export default function BulletCard({ data }: { data: BulletCardData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-3">{data.title}</h4>
      <ul className="space-y-2">
        {data.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
