/**
 * VOC Preprocessor — 코드 기반 전처리
 *
 * LLM에 원문을 보내지 않고, 통계·토픽분류·verbatim 추출을 코드로 처리.
 * 에이전트에는 요약 JSON만 전달하여 토큰을 절약한다.
 *
 * 규칙 소스: src/agents/skills/voc-analysis.md "전처리 키워드 사전" 섹션
 * 토픽·긍정테마·경쟁사·임계치를 md에서 로드한다. 키워드 수정 시 md만 편집하면 자동 반영.
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { VocPreprocessOutput } from "./types";

// ─── 입력 타입 ──────────────────────────────────────────────────

export interface VocRow {
  content: string;
  score?: number;        // 1-5
  nps_score?: number;    // 0-10
  sentiment?: string;    // positive/neutral/negative
  thumbsUpCount?: number;
  at?: string;
  channel?: string;
  account_id?: string;
  ticket_id?: string;
  [key: string]: unknown;
}

// ─── md에서 키워드 사전 로드 ─────────────────────────────────────

interface TopicDef {
  name: string;
  keywords: string[];
}

/** voc-analysis.md 마커 사이의 JSON을 추출 */
function extractJsonFromMd<T>(md: string, startMarker: string, endMarker: string, fallback: T): T {
  const startIdx = md.indexOf(startMarker);
  const endIdx = md.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return fallback;

  const block = md.slice(startIdx + startMarker.length, endIdx).trim();
  // md 안에 ```json ... ``` 으로 감싸져 있을 수 있으므로 코드펜스 제거
  const cleaned = block.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/** voc-analysis.md를 한 번만 로드해서 캐싱 */
const VOC_SKILL_MD = (() => {
  try {
    return readFileSync(join(process.cwd(), "src/agents/skills/voc-analysis.md"), "utf-8");
  } catch {
    return "";
  }
})();

const DEFAULT_TOPICS: TopicDef[] = extractJsonFromMd(
  VOC_SKILL_MD,
  "<!-- VOC-TOPICS START -->",
  "<!-- VOC-TOPICS END -->",
  [
    { name: "제품 기능/UX", keywords: ["기능", "UI", "UX", "인터페이스", "디자인"] },
    { name: "가격/비용", keywords: ["가격", "비용", "결제", "구독", "환불", "돈"] },
  ]
);

const DEFAULT_POSITIVE_THEMES: TopicDef[] = extractJsonFromMd(
  VOC_SKILL_MD,
  "<!-- VOC-POSITIVE-THEMES START -->",
  "<!-- VOC-POSITIVE-THEMES END -->",
  [
    { name: "편리성/만족", keywords: ["편리", "만족", "좋아", "추천"] },
  ]
);

const COMPETITOR_KEYWORDS: Array<{ name: string; keywords: string[] }> = extractJsonFromMd(
  VOC_SKILL_MD,
  "<!-- VOC-COMPETITORS START -->",
  "<!-- VOC-COMPETITORS END -->",
  [
    { name: "Gemini", keywords: ["제미나이", "gemini"] },
  ]
);

// ─── 소스 자동 감지 ─────────────────────────────────────────────

function detectSource(rows: VocRow[]): VocPreprocessOutput["source"] {
  const first = rows[0] ?? {};
  if (first.ticket_id != null) return "cs-text";
  if (first.account_id != null) return "b2b-feedback";
  if (first.nps_score != null) return "nps";
  if (first.channel && ["twitter", "reddit", "community"].includes(String(first.channel).toLowerCase())) return "social";
  if (first.score != null) return "app-review";
  return "general";
}

/** 임계치 — md의 VOC-THRESHOLDS 블록에서 로드, 없으면 기본값 */
const THRESHOLDS = (() => {
  const parsed = extractJsonFromMd<{
    sentiment?: { score?: Record<string, string>; nps?: Record<string, string> };
    polarization?: { extremeRateThreshold?: number };
  }>(VOC_SKILL_MD, "<!-- VOC-THRESHOLDS START -->", "<!-- VOC-THRESHOLDS END -->", {});
  return {
    polarizationThreshold: parsed.polarization?.extremeRateThreshold ?? 70,
  };
})();

// ─── 감성 분류 ──────────────────────────────────────────────────

function getSentiment(row: VocRow): "positive" | "neutral" | "negative" {
  if (row.sentiment) {
    const s = row.sentiment.toLowerCase();
    if (s.includes("pos")) return "positive";
    if (s.includes("neg")) return "negative";
    return "neutral";
  }
  if (row.score != null) {
    if (row.score >= 4) return "positive";
    if (row.score <= 2) return "negative";
    return "neutral";
  }
  if (row.nps_score != null) {
    if (row.nps_score >= 9) return "positive";
    if (row.nps_score <= 6) return "negative";
    return "neutral";
  }
  return "neutral";
}

// ─── 메인 함수 ──────────────────────────────────────────────────

export function preprocessVoc(
  rows: VocRow[],
  options?: {
    topics?: TopicDef[];
    positiveThemes?: Array<{ name: string; keywords: string[] }>;
    competitors?: Array<{ name: string; keywords: string[] }>;
  }
): VocPreprocessOutput {
  const topics = options?.topics ?? DEFAULT_TOPICS;
  const posThemes = options?.positiveThemes ?? DEFAULT_POSITIVE_THEMES;
  const competitors = options?.competitors ?? COMPETITOR_KEYWORDS;

  const total = rows.length;
  const source = detectSource(rows);

  // ── 기본 통계 ──
  const hasScore = rows.some((r) => r.score != null);
  const scores = hasScore ? rows.map((r) => r.score!).filter((s) => s != null) : [];
  const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null;

  const scoreDist: Record<string, number> = {};
  for (const s of scores) {
    scoreDist[String(s)] = (scoreDist[String(s)] ?? 0) + 1;
  }

  const sentiments = rows.map((r) => getSentiment(r));
  const pos = sentiments.filter((s) => s === "positive").length;
  const neu = sentiments.filter((s) => s === "neutral").length;
  const neg = sentiments.filter((s) => s === "negative").length;

  const dates = rows.map((r) => r.at).filter(Boolean).sort();
  const dateRange = dates.length >= 2 ? { from: dates[0]!, to: dates[dates.length - 1]! } : null;

  // ── 양극화 ──
  let polarization: VocPreprocessOutput["polarization"] = null;
  if (hasScore) {
    const one = scoreDist["1"] ?? 0;
    const five = scoreDist["5"] ?? 0;
    const extremeRate = Math.round(((one + five) / total) * 1000) / 10;

    const byScore: Record<number, number[]> = {};
    for (const r of rows) {
      if (r.score == null) continue;
      if (!byScore[r.score]) byScore[r.score] = [];
      byScore[r.score].push(r.content.length);
    }

    const avgLength: Record<string, number> = {};
    const shortRate: Record<string, number> = {};
    for (const [s, lengths] of Object.entries(byScore)) {
      avgLength[s] = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      shortRate[s] = Math.round((lengths.filter((l) => l <= 5).length / lengths.length) * 1000) / 10;
    }

    polarization = {
      detected: extremeRate >= THRESHOLDS.polarizationThreshold,
      extremeRate,
      proxy: { avgLength, shortReviewRate: shortRate },
    };
  }

  // ── 토픽 분류 ──
  const topicResults = topics.map((topic) => {
    const matched = rows.filter((r) => {
      const lower = r.content.toLowerCase();
      return topic.keywords.some((kw) => lower.includes(kw.toLowerCase()));
    });
    const count = matched.length;
    if (count === 0) return null;

    const tSentiments = matched.map((r) => getSentiment(r));
    const tPos = tSentiments.filter((s) => s === "positive").length;
    const tNeu = tSentiments.filter((s) => s === "neutral").length;
    const tNeg = tSentiments.filter((s) => s === "negative").length;

    const weight = Math.round((count / total) * 1000) / 10;
    const negativeRate = Math.round((tNeg / count) * 1000) / 10;
    const impact = Math.round(weight * negativeRate) / 100;

    // 대표 verbatim (부정 중 thumbsUp 높은 순)
    const negReviews = matched.filter((r) => getSentiment(r) === "negative");
    const sorted = negReviews.sort((a, b) => (b.thumbsUpCount ?? 0) - (a.thumbsUpCount ?? 0));
    const topVerbatims = sorted.slice(0, 3).map((r) => ({
      content: r.content.slice(0, 200),
      score: r.score ?? 0,
      thumbsUp: r.thumbsUpCount ?? 0,
    }));

    return {
      name: topic.name,
      count,
      weight,
      sentimentBreakdown: {
        positive: Math.round((tPos / count) * 100),
        neutral: Math.round((tNeu / count) * 100),
        negative: Math.round((tNeg / count) * 100),
      },
      negativeRate,
      impact,
      topVerbatims,
    };
  }).filter(Boolean) as VocPreprocessOutput["topics"];

  topicResults.sort((a, b) => b.impact - a.impact);

  // ── 긍정 테마 ──
  const posRows = rows.filter((r) => getSentiment(r) === "positive" && r.content.length > 10);
  const positiveThemes = posThemes.map((theme) => {
    const matched = posRows.filter((r) => theme.keywords.some((kw) => r.content.includes(kw)));
    if (matched.length === 0) return null;
    return {
      name: theme.name,
      count: matched.length,
      topVerbatims: matched.slice(0, 3).map((r) => ({
        content: r.content.slice(0, 200),
        score: r.score ?? 0,
      })),
    };
  }).filter(Boolean) as VocPreprocessOutput["positiveThemes"];

  // ── 경쟁사 언급 ──
  const compResults = competitors.map((comp) => {
    const matched = rows.filter((r) => comp.keywords.some((kw) => r.content.toLowerCase().includes(kw.toLowerCase())));
    if (matched.length === 0) return null;

    const contexts = matched.map((r) => {
      const lower = r.content.toLowerCase();
      const sentiment = getSentiment(r);
      // 이탈 맥락 판별
      let ctx: "churn" | "comparison" | "positive" = "comparison";
      if (sentiment === "negative" || lower.includes("쓰세요") || lower.includes("가 더") || lower.includes("이 더")) {
        ctx = "churn";
      } else if (sentiment === "positive") {
        ctx = "positive";
      }
      return { content: r.content.slice(0, 200), score: r.score ?? 0, context: ctx };
    });

    return { name: comp.name, count: matched.length, contexts };
  }).filter(Boolean) as VocPreprocessOutput["competitorMentions"]["competitors"];

  // ── 공감수 분석 ──
  const hasThumbsUp = rows.some((r) => (r.thumbsUpCount ?? 0) > 0);
  let thumbsUpAnalysis: VocPreprocessOutput["thumbsUpAnalysis"] = null;
  if (hasThumbsUp) {
    const highThumbs = rows
      .filter((r) => (r.thumbsUpCount ?? 0) >= 3)
      .sort((a, b) => (b.thumbsUpCount ?? 0) - (a.thumbsUpCount ?? 0))
      .slice(0, 10);

    const negInHigh = highThumbs.filter((r) => getSentiment(r) === "negative").length;

    thumbsUpAnalysis = {
      highThumbsReviews: highThumbs.map((r) => ({
        content: r.content.slice(0, 200),
        score: r.score ?? 0,
        thumbsUp: r.thumbsUpCount ?? 0,
      })),
      negativeRateInHighThumbs: highThumbs.length > 0
        ? Math.round((negInHigh / highThumbs.length) * 100)
        : 0,
    };
  }

  return {
    source,
    stats: {
      total,
      avgScore,
      scoreDistribution: scoreDist,
      sentimentCounts: { positive: pos, neutral: neu, negative: neg },
      sentimentRates: {
        positive: Math.round((pos / total) * 1000) / 10,
        neutral: Math.round((neu / total) * 1000) / 10,
        negative: Math.round((neg / total) * 1000) / 10,
      },
      dateRange,
    },
    polarization,
    topics: topicResults,
    positiveThemes,
    competitorMentions: {
      total: compResults.reduce((a, c) => a + c.count, 0),
      competitors: compResults,
    },
    thumbsUpAnalysis,
  };
}
