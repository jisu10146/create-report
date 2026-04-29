export interface PublishedVariant {
  agentId: string;
  sample?: string;
  label: string;
  note?: string;
}

export interface PublishedTopic {
  topic: string;
  description: string;
  category: string;
  variants: PublishedVariant[];
}

export const PUBLISHED_TOPICS: PublishedTopic[] = [
  {
    topic: "리뷰 분석",
    description: "VOC 데이터의 별점·감성·영역별 분포로 만족 동력과 부정 토픽을 진단",
    category: "Customer Success",
    variants: [
      {
        agentId: "review-analysis",
        sample: "coupang",
        label: "쿠팡 캐리어 리뷰",
        note: "이커머스 제품 리뷰 1,000건",
      },
      {
        agentId: "review-analysis",
        sample: "chatgpt",
        label: "ChatGPT 리뷰",
        note: "AI 서비스 한국어 리뷰",
      },
    ],
  },
  {
    topic: "고객센터 티켓 분석",
    description: "CS 티켓 처리시간·SLA·채널별 성과 진단",
    category: "Operations",
    variants: [
      {
        agentId: "customer-support-analysis",
        sample: "basic",
        label: "기본 사례",
        note: "처리시간·우선순위·채널 분포",
      },
    ],
  },
  {
    topic: "광고 성과 분석",
    description: "매체·캠페인별 효율을 진단하고 예산 재배분 방향 제시",
    category: "Marketing",
    variants: [
      {
        agentId: "ad-performance-analysis",
        label: "CPA 중심",
        note: "전환수만 있을 때 — 비용 효율(CPA·CTR·CVR) 기반",
      },
      {
        agentId: "ad-performance-roas-analysis",
        label: "ROAS 포함",
        note: "매출 데이터까지 있을 때 — 수익성(ROAS) 추가 진단",
      },
    ],
  },
];
