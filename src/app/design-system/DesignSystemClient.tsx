"use client";

import { useState, useCallback } from "react";
import { Badge, Callout } from "@cubig/design-system";
import { countUnconfirmedTokens } from "./tokens";
import { CHART_SPECS } from "@/lib/design-system/chart-spec";
import ColorsSection from "./sections/ColorsSection";
import TypographySection from "./sections/TypographySection";
import SpacingSection from "./sections/SpacingSection";
import ChartsSection from "./sections/ChartsSection";
import LayoutPatternsSection from "./sections/LayoutPatternsSection";
import ComponentGallerySection from "./sections/ComponentGallerySection";

const SECTIONS = [
  { id: "components", label: "Components" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing & Layout" },
  { id: "charts", label: "Charts" },
  { id: "layouts", label: "Layout Patterns" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function countChartUnconfirmed(): number {
  let count = 0;
  for (const spec of Object.values(CHART_SPECS)) {
    if (spec.confident === false) count++;
    for (const s of spec.series) {
      if (s.confident === false) count++;
    }
  }
  return count;
}

export default function DesignSystemClient() {
  const [active, setActive] = useState<SectionId>("components");
  const [copied, setCopied] = useState<string | null>(null);

  const totalUnconfirmed = countUnconfirmedTokens() + countChartUnconfirmed();

  const copyValue = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-report-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-report-card border-r border-report-border shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-report-border">
          <a href="/" className="text-sm text-report-text-secondary hover:text-report-text-primary">
            &larr; Back
          </a>
          <h1 className="font-semibold text-report-text-primary mt-2">Design System</h1>
          <p className="text-xs text-report-text-secondary mt-0.5">Report Tokens</p>
        </div>
        <nav className="p-3 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                active === s.id
                  ? "bg-report-bg font-semibold text-report-text-primary"
                  : "text-report-text-secondary hover:text-report-text-primary hover:bg-report-bg"
              }`}
            >
              {s.headline}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 max-w-[1720px]">
        {/* Review banner */}
        {totalUnconfirmed > 0 && (
          <div className="mb-6">
            <Callout
              variant="cautionary"
              size="small"
              title={`검수 필요 항목 ${totalUnconfirmed}개`}
              description="confident: false 로 표시된 항목은 피그마에서 명확히 확인되지 않은 추정 값입니다."
              leadingIcon
            />
          </div>
        )}

        {/* Copied toast */}
        {copied && (
          <div className="fixed top-4 right-4 z-50 bg-report-card border border-report-border rounded-sm shadow-elevated px-4 py-2 text-sm text-report-text-primary animate-pulse">
            Copied: <span className="font-mono font-semibold">{copied}</span>
          </div>
        )}

        {active === "components" && <ComponentGallerySection />}
        {active === "colors" && <ColorsSection onCopy={copyValue} />}
        {active === "typography" && <TypographySection onCopy={copyValue} />}
        {active === "spacing" && <SpacingSection onCopy={copyValue} />}
        {active === "charts" && <ChartsSection />}
        {active === "layouts" && <LayoutPatternsSection />}
      </main>
    </div>
  );
}
