import Link from "next/link";
import { PUBLISHED_REPORTS } from "@/agents/published";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/jisu10146/create-report/main/src/agents/definitions";

function jsonRawUrl(agentId: string, sample?: string) {
  const fileName = sample ? `sample-${sample}.json` : "sample.json";
  return `${GITHUB_RAW_BASE}/${agentId}/${fileName}`;
}

function previewHref(agentId: string, sample?: string) {
  return sample ? `/preview/${agentId}?sample=${sample}` : `/preview/${agentId}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Customer Success": "bg-purple-100 text-purple-700",
  Operations: "bg-blue-100 text-blue-700",
  Marketing: "bg-emerald-100 text-emerald-700",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="font-semibold text-gray-900">Agent Report Gallery</h1>
      </nav>

      <main className="max-w-[1280px] mx-auto px-8 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">완료된 리포트</h2>
          <p className="text-sm text-gray-500">
            카드의 Preview를 눌러 렌더된 리포트를 보거나, JSON 링크로 원본 데이터를 받을 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PUBLISHED_REPORTS.map((report) => {
            const key = `${report.agentId}-${report.sample ?? "default"}`;
            const badgeClass = CATEGORY_COLORS[report.category] ?? "bg-gray-100 text-gray-700";
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badgeClass}`}
                  >
                    {report.category}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Link
                    href={previewHref(report.agentId, report.sample)}
                    className="flex-1 text-center text-sm font-semibold text-white bg-gray-900 rounded-md py-2 hover:bg-gray-700 transition-colors"
                  >
                    Preview
                  </Link>
                  <a
                    href={jsonRawUrl(report.agentId, report.sample)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-4 py-2 hover:bg-gray-200 transition-colors"
                  >
                    JSON
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
