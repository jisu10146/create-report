/**
 * VOC Preprocessor — 코드 기반 전처리
 *
 * LLM에 원문을 보내지 않고, 통계·토픽분류·verbatim 추출을 코드로 처리.
 * 에이전트에는 요약 JSON만 전달하여 토큰을 절약한다.
 */

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

// ─── 토픽 키워드 사전 (확장 가능) ──────────────────────────────

interface TopicDef {
  name: string;
  keywords: string[];
}

const DEFAULT_TOPICS: TopicDef[] = [
  { name: "제품 기능/UX", keywords: ["기능", "UI", "UX", "인터페이스", "디자인", "레이아웃", "업데이트", "업뎃", "설정", "바뀌", "메뉴"] },
  { name: "가격/비용", keywords: ["가격", "비용", "비싸", "요금", "결제", "구독", "환불", "돈", "유료", "무료", "한도", "제한", "프리", "플러스", "과금"] },
  { name: "성능/안정성", keywords: ["느려", "버그", "오류", "크래시", "렉", "멈추", "다운", "최적화", "튕", "로딩", "강제종료"] },
  { name: "로그인/계정", keywords: ["로그인", "로그아웃", "계정", "비밀번호", "인증", "구글", "애플", "SSO"] },
  { name: "고객 지원", keywords: ["고객센터", "상담", "문의", "응답", "답변", "지원", "CS", "서비스"] },
  { name: "온보딩/학습", keywords: ["처음", "시작", "가입", "온보딩", "튜토리얼", "학습", "공부", "배우"] },
  { name: "콘텐츠/품질", keywords: ["품질", "정확", "거짓", "오답", "틀린", "잘못", "멍청", "허언", "신뢰", "사기", "거짓말", "할루", "검열", "필터", "차단"] },
  { name: "이미지/파일", keywords: ["이미지", "사진", "파일", "업로드", "다운로드", "그림", "첨부"] },
];

const DEFAULT_POSITIVE_THEMES = [
  { name: "편리성/만족", keywords: ["편리", "만족", "좋아", "추천", "유용", "도움", "편해", "최고"] },
  { name: "학습/정보", keywords: ["공부", "학습", "정보", "분석", "궁금", "검색", "알려"] },
  { name: "소통/감정", keywords: ["위로", "대화", "친구", "수다", "상담", "심심", "외로"] },
  { name: "창작/생성", keywords: ["이미지", "그림", "캐릭터", "그려", "보정", "생성", "창작"] },
];

// ─── 경쟁사 키워드 ──────────────────────────────────────────────

const COMPETITOR_KEYWORDS: Array<{ name: string; keywords: string[] }> = [
  { name: "Gemini", keywords: ["제미나이", "gemini", "재미나이"] },
  { name: "Claude", keywords: ["클로드", "claude"] },
  { name: "Grok", keywords: ["그록", "grok"] },
  { name: "Copilot", keywords: ["코파일럿", "copilot"] },
  { name: "DeepSeek", keywords: ["딥시크", "deepseek"] },
  { name: "Perplexity", keywords: ["퍼플렉시티", "perplexity"] },
];

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
      detected: extremeRate >= 70,
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
