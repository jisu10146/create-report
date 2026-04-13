"use client";

import { Badge } from "@cubig/design-system";
import { COLOR_TOKENS } from "../tokens";
import { CHART_COLOR_SEQUENCE } from "@/lib/design-system/chart-spec";

interface Props {
  onCopy: (value: string) => void;
}

export default function ColorsSection({ onCopy }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Colors</h2>
        <p className="text-sm text-report-text-secondary">피그마에서 추출한 색상 토큰. 클릭하면 HEX 값이 복사됩니다.</p>
      </div>

      {COLOR_TOKENS.map((group) => (
        <div key={group.group}>
          <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider mb-3">
            {group.group}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {group.tokens.map((token) => (
              <button
                key={token.name}
                onClick={() => onCopy(token.value)}
                className="bg-report-card border border-report-border rounded-card p-4 shadow-card text-left hover:shadow-card-hover transition-shadow flex items-center gap-4 group"
              >
                <div
                  className="w-14 h-14 rounded-sm shrink-0 border border-report-border"
                  style={{ backgroundColor: token.value }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-report-text-primary">{token.name}</span>
                    {token.confident === false && (
                      <Badge variant="cautionary" type="solid" size="small" text="추정" />
                    )}
                  </div>
                  <div className="font-mono text-sm font-semibold text-report-text-primary mt-0.5">
                    {token.value}
                  </div>
                  <div className="text-xs text-report-text-secondary mt-0.5">{token.usage}</div>
                  <div className="text-xs text-report-text-muted mt-0.5 font-mono">{token.tailwind}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Chart Palette Sequence */}
      <div>
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider mb-3">
          Chart Color Sequence (도넛/파이 순서)
        </h3>
        <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card">
          <div className="flex gap-2">
            {CHART_COLOR_SEQUENCE.map((color, i) => (
              <button
                key={i}
                onClick={() => onCopy(color)}
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-16 h-16 rounded-sm border border-report-border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono text-report-text-secondary">{i + 1}순위</span>
                <span className="text-xs font-mono text-report-text-primary">{color}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
