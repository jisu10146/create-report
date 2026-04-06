import { notFound } from "next/navigation";
import { loadSampleReport, loadAgentDefinition } from "@/lib/reportNormalizer";
import ReportRenderer from "@/components/ReportRenderer";

interface Props {
  params: Promise<{ agentId: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { agentId } = await params;

  let report, agent;
  try {
    [report, agent] = await Promise.all([
      loadSampleReport(agentId),
      loadAgentDefinition(agentId),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-report-basement">
      {/* Preview banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-center">
        <span className="text-xs font-semibold text-yellow-700">
          PREVIEW MODE — sample.json 기반 렌더링, API 호출 없음
        </span>
      </div>

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Agent Report System</h1>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-md px-2 py-1">
          /preview/{agentId}
        </span>
      </nav>

      <main className="max-w-[1720px] mx-auto px-6 py-8">
        <ReportRenderer report={report!} agent={agent!} />
      </main>
    </div>
  );
}

// Generate static pages for all agents at build time
export async function generateStaticParams() {
  try {
    const { readdirSync, statSync } = await import("fs");
    const { join } = await import("path");
    const dir = join(process.cwd(), "src", "agents", "definitions");
    const entries = readdirSync(dir).filter((f: string) => {
      return statSync(join(dir, f)).isDirectory();
    });
    return entries.map((f: string) => ({ agentId: f }));
  } catch {
    return [];
  }
}
