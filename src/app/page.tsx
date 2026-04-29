import Link from "next/link";
import { PUBLISHED_TOPICS } from "@/agents/published";

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
            토픽별 리포트 안에서 데이터 사례나 분석 변형을 골라 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PUBLISHED_TOPICS.map((topic) => {
            const badgeClass =
              CATEGORY_COLORS[topic.category] ?? "bg-gray-100 text-gray-700";
            return (
              <div
                key={topic.topic}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded self-start ${badgeClass}`}
                  >
                    {topic.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{topic.topic}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                  {topic.variants.map((v) => {
                    const key = `${v.agentId}-${v.sample ?? "default"}`;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {v.label}
                          </span>
                          {v.note && (
                            <span className="text-xs text-gray-500 truncate">
                              {v.note}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={previewHref(v.agentId, v.sample)}
                            className="text-xs font-semibold text-white bg-gray-900 rounded-md px-3 py-1.5 hover:bg-gray-700 transition-colors"
                          >
                            Preview
                          </Link>
                          <a
                            href={jsonRawUrl(v.agentId, v.sample)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-1.5 hover:bg-gray-200 transition-colors"
                          >
                            JSON
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
