/**
 * 레이아웃 패턴 정의
 *
 * 고정: 패턴별 섹션 수 제한, required/forbidden/mustIncludeOne 규칙
 * Claude가 결정: 컴포넌트 선택, 섹션 순서, 연결 맥락
 */

export interface LayoutPattern {
  /** 최대 섹션 수 */
  maxSections: number;
  /** 무조건 포함해야 하는 컴포넌트 */
  required: string[];
  /** 그룹 내 최소 1개는 포함해야 하는 컴포넌트 (OR 조건) */
  mustIncludeOne: string[][];
  /** 사용 불가한 컴포넌트 */
  forbidden: string[];
}

export const LAYOUT_PATTERNS: Record<string, LayoutPattern> = {
  compact: {
    maxSections: 4,
    required: ["ExecutiveSummary"],
    mustIncludeOne: [
      ["MetricHighlight", "BulletCard"],
    ],
    forbidden: ["StrategyTable", "ClusterCard", "UserCard"],
  },
  standard: {
    maxSections: 8,
    required: ["ExecutiveSummary"],
    mustIncludeOne: [
      ["HorizontalBarChart", "DonutChart", "DataTable"],
      ["InsightCard", "InterpretationBlock"],
    ],
    forbidden: [],
  },
  detailed: {
    maxSections: 12,
    required: ["ExecutiveSummary"],
    mustIncludeOne: [
      ["ClusterCard", "UserCard"],
      ["StrategyTable", "ChecklistCard"],
    ],
    forbidden: [],
  },
};

/** 패턴 조건을 프롬프트 텍스트로 변환 */
export function buildPatternPrompt(volume: string): string {
  const pattern = LAYOUT_PATTERNS[volume];
  if (!pattern) return "";

  const lines: string[] = [
    `현재 패턴: ${volume}`,
    `최대 섹션 수: ${pattern.maxSections}`,
    `반드시 포함: ${pattern.required.join(", ")}`,
  ];

  if (pattern.mustIncludeOne.length > 0) {
    pattern.mustIncludeOne.forEach((group, i) => {
      lines.push(`다음 중 최소 1개 포함 (그룹 ${i + 1}): ${group.join(" / ")}`);
    });
  }

  if (pattern.forbidden.length > 0) {
    lines.push(`사용 불가: ${pattern.forbidden.join(", ")}`);
  }

  lines.push("", "이 조건 안에서 에이전트 설명에 맞게 컴포넌트 선택과 순서는 네가 직접 결정해.");

  return lines.join("\n");
}

/** 패턴 규칙으로 에이전트 구조 검증 — 위반 사항 배열 반환 */
export function validatePattern(
  sections: Array<{ componentType: string }>,
  volume: string
): string[] {
  const pattern = LAYOUT_PATTERNS[volume];
  if (!pattern) return [];

  const types = sections.map((s) => s.componentType);
  const typeSet = new Set(types);
  const violations: string[] = [];

  // 1. maxSections
  if (sections.length > pattern.maxSections) {
    violations.push(`섹션 수 초과: ${sections.length}개 (${volume} 제한: ${pattern.maxSections}개)`);
  }

  // 2. required
  for (const req of pattern.required) {
    if (!typeSet.has(req)) {
      violations.push(`필수 컴포넌트 누락: ${req}`);
    }
  }

  // 3. mustIncludeOne
  pattern.mustIncludeOne.forEach((group, i) => {
    const hasAny = group.some((c) => typeSet.has(c));
    if (!hasAny) {
      violations.push(`그룹 ${i + 1} 조건 미충족: ${group.join(" / ")} 중 최소 1개 필요`);
    }
  });

  // 4. forbidden
  for (const fb of pattern.forbidden) {
    if (typeSet.has(fb)) {
      violations.push(`사용 불가 컴포넌트 포함: ${fb}`);
    }
  }

  return violations;
}
