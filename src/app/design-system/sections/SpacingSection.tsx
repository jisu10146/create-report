"use client";

import { Badge } from "@cubig/design-system";
import { SPACING_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from "../tokens";

interface Props {
  onCopy: (value: string) => void;
}

export default function SpacingSection({ onCopy }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Spacing & Layout</h2>
        <p className="text-sm text-report-text-secondary">간격, 라운드, 그림자 토큰. 클릭하면 값이 복사됩니다.</p>
      </div>

      {/* Spacing Scale */}
      <div>
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider mb-3">
          Spacing Scale
        </h3>
        <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card space-y-2">
          {SPACING_TOKENS.map((token) => (
            <button
              key={token.name}
              onClick={() => onCopy(token.value)}
              className="w-full flex items-center gap-4 py-1 hover:bg-report-bg rounded-sm px-2 transition-colors text-left"
            >
              <span className="text-xs font-mono text-report-text-secondary w-24 shrink-0">
                {token.name}
              </span>
              <div
                className="h-4 rounded-sm bg-chart-blue shrink-0"
                style={{ width: `${token.px}px` }}
              />
              <span className="text-xs font-mono text-report-text-primary w-12">{token.value}</span>
              <span className="text-xs text-report-text-muted">{token.usage}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider mb-3">
          Border Radius
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {RADIUS_TOKENS.map((token) => (
            <button
              key={token.name}
              onClick={() => onCopy(token.tailwind)}
              className="bg-report-card border border-report-border rounded-card p-4 shadow-card text-center hover:shadow-card-hover transition-shadow"
            >
              <div
                className="w-20 h-20 bg-chart-blue-light border-2 border-chart-blue mx-auto mb-3"
                style={{ borderRadius: `${token.px}px` }}
              />
              <div className="font-mono text-sm font-semibold text-report-text-primary">{token.value}</div>
              <div className="text-xs text-report-text-secondary mt-0.5">{token.name}</div>
              <div className="text-xs font-mono text-report-text-muted mt-0.5">{token.tailwind}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider mb-3">
          Shadows
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {SHADOW_TOKENS.map((token) => (
            <button
              key={token.name}
              onClick={() => onCopy(token.tailwind)}
              className="bg-report-card border border-report-border rounded-card p-5 text-center hover:opacity-90 transition-opacity"
              style={{ boxShadow: token.value }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-semibold text-sm text-report-text-primary">{token.name}</span>
                {token.confident === false && (
                  <Badge variant="cautionary" type="solid" size="small" text="추정" />
                )}
              </div>
              <div className="text-xs font-mono text-report-text-secondary">{token.value}</div>
              <div className="text-xs font-mono text-report-text-muted mt-1">{token.tailwind}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
