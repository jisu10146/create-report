"use client";

import { TYPO_TOKENS } from "../tokens";

interface Props {
  onCopy: (value: string) => void;
}

export default function TypographySection({ onCopy }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Typography</h2>
        <p className="text-sm text-report-text-secondary">Pretendard Variable 기반 텍스트 스타일. 클릭하면 CSS 변수명이 복사됩니다.</p>
      </div>

      <div className="space-y-4">
        {TYPO_TOKENS.map((token) => (
          <button
            key={token.name}
            onClick={() => onCopy(token.sizeVar)}
            className="w-full bg-report-card border border-report-border rounded-card p-5 shadow-card text-left hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-report-text-primary">{token.name}</span>
              <div className="flex gap-3 text-xs font-mono text-report-text-secondary">
                <span>{token.size}</span>
                <span>w{token.weight}</span>
                <span>lh {token.lineHeight}</span>
              </div>
            </div>

            {/* Actual rendered sample */}
            <div
              className="text-report-text-primary mb-2"
              style={{
                fontSize: token.size,
                fontWeight: token.weight,
                lineHeight: token.lineHeight,
              }}
            >
              {token.sample}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-report-border">
              <span className="text-xs text-report-text-secondary">{token.usage}</span>
              <span className="text-xs font-mono text-report-text-muted">{token.sizeVar}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
