export interface PublishedReport {
  agentId: string;
  sample?: string;
  title: string;
  category: string;
  description: string;
}

export const PUBLISHED_REPORTS: PublishedReport[] = [
  {
    agentId: "review-analysis",
    sample: "coupang",
    title: "쿠팡 캐리어 리뷰 분석",
    category: "Customer Success",
    description: "쿠팡 캐리어 리뷰 1,000건의 별점·감성·영역별 분포 분석",
  },
  {
    agentId: "review-analysis",
    sample: "chatgpt",
    title: "ChatGPT 리뷰 분석",
    category: "Customer Success",
    description: "ChatGPT 한국어 리뷰의 만족도와 부정 토픽 분석",
  },
  {
    agentId: "customer-support-analysis",
    sample: "basic",
    title: "고객센터 티켓 분석",
    category: "Operations",
    description: "CS 티켓 처리시간·SLA·채널별 성과 분석",
  },
  {
    agentId: "ad-performance-analysis",
    title: "광고 성과 분석 (CPA 중심)",
    category: "Marketing",
    description: "매체·캠페인별 CPA·CTR·CVR 효율 진단과 예산 재배분",
  },
  {
    agentId: "ad-performance-roas-analysis",
    title: "광고 ROAS 성과 분석",
    category: "Marketing",
    description: "매출 데이터 기반 ROAS·CPA 두 축 진단과 수익성 기준 재배분",
  },
];
