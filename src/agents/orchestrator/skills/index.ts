/**
 * Domain Expert Skills — 도메인별 벤치마크/용어/프레임 제공
 *
 * 새 도메인 추가 시 이 파일에 스킬을 등록하면 됨.
 * Domain Expert가 에이전트 설명을 보고 가장 적합한 스킬을 자동 선택.
 */

export interface SkillOutput {
  name: string;
  data: {
    benchmarks: Array<{ metric: string; value: string; source: string }>;
    terminology: Record<string, string>;
    commonDecisions: string[];
  };
}

interface SkillDefinition {
  name: string;
  /** 에이전트 설명에 이 키워드가 포함되면 매칭 */
  keywords: string[];
  data: SkillOutput["data"];
}

const SKILLS: SkillDefinition[] = [
  {
    name: "saas-metrics",
    keywords: ["saas", "구독", "subscription", "churn", "이탈", "retention", "리텐션", "arpu", "mrr"],
    data: {
      benchmarks: [
        { metric: "월간 이탈률 (Good)", value: "3-5%", source: "ProfitWell 2024" },
        { metric: "NDR (Net Dollar Retention)", value: "110-130%", source: "Bessemer Cloud Index" },
        { metric: "CAC Payback Period", value: "12-18개월", source: "OpenView SaaS Benchmarks" },
        { metric: "LTV/CAC Ratio", value: "3:1 이상", source: "SaaS Capital" },
      ],
      terminology: {
        NDR: "순 달러 유지율 — 기존 고객 매출이 확장(업셀) 포함해서 얼마나 유지되는지",
        MRR: "월간 반복 매출",
        ARPU: "사용자당 평균 매출",
        "Cohort Retention": "동일 가입 시기 고객군의 시간별 잔존율",
      },
      commonDecisions: [
        "이탈 방지에 리소스를 얼마나 투입할지",
        "가격 정책을 변경할지",
        "어떤 고객 세그먼트에 집중할지",
      ],
    },
  },
  {
    name: "financial-analysis",
    keywords: ["금융", "financial", "거래", "transaction", "fraud", "사기", "결제", "payment", "매출", "revenue"],
    data: {
      benchmarks: [
        { metric: "사기 거래 비율 (업계 평균)", value: "0.1-0.3%", source: "Nilson Report 2024" },
        { metric: "오탐지율 (False Positive)", value: "2-5%", source: "Javelin Strategy" },
        { metric: "결제 승인률", value: "95-98%", source: "Visa Network Data" },
      ],
      terminology: {
        "False Positive": "정상 거래를 사기로 잘못 판별한 건",
        "Chargeback Rate": "구매자가 결제 취소를 요청한 비율",
        AML: "자금 세탁 방지 (Anti-Money Laundering)",
      },
      commonDecisions: [
        "거래 모니터링 임계값을 조정할지",
        "수동 조사 대상 범위를 결정할지",
        "사기 탐지 모델을 재학습할지",
      ],
    },
  },
  {
    name: "marketing-funnel",
    keywords: ["마케팅", "marketing", "퍼널", "funnel", "전환", "conversion", "캠페인", "campaign", "리드", "lead", "ctr"],
    data: {
      benchmarks: [
        { metric: "이메일 오픈율 (B2B)", value: "15-25%", source: "Mailchimp Benchmarks 2024" },
        { metric: "랜딩 페이지 전환율", value: "2-5%", source: "Unbounce Conversion Report" },
        { metric: "MQL → SQL 전환율", value: "13-25%", source: "Implisit/Salesforce" },
        { metric: "SQL → Closed Won", value: "15-30%", source: "HubSpot Sales Benchmarks" },
      ],
      terminology: {
        MQL: "마케팅 적격 리드 — 마케팅 활동에 반응한 리드",
        SQL: "영업 적격 리드 — 영업팀이 접촉할 가치가 있다고 판단한 리드",
        CAC: "고객 획득 비용",
        "Pipeline Velocity": "파이프라인 속도 = (딜 수 × 평균 딜 금액 × Win Rate) / 평균 딜 사이클",
      },
      commonDecisions: [
        "어떤 채널에 마케팅 예산을 집중할지",
        "리드 스코어링 기준을 조정할지",
        "퍼널 병목 구간을 어떻게 개선할지",
      ],
    },
  },
  {
    name: "ecommerce-analytics",
    keywords: ["이커머스", "ecommerce", "쇼핑", "구매", "장바구니", "cart", "상품", "product", "주문", "order"],
    data: {
      benchmarks: [
        { metric: "장바구니 이탈률", value: "69-70%", source: "Baymard Institute 2024" },
        { metric: "재구매율 (Good)", value: "25-40%", source: "RJMetrics" },
        { metric: "평균 주문 가치 (AOV) 증가율", value: "10-15% YoY", source: "Shopify Commerce Report" },
      ],
      terminology: {
        AOV: "평균 주문 가치 (Average Order Value)",
        GMV: "총 거래액 (Gross Merchandise Value)",
        "Basket Size": "1회 주문 시 평균 상품 수",
        RFM: "최근성(Recency), 빈도(Frequency), 금액(Monetary) 기반 고객 세분화",
      },
      commonDecisions: [
        "어떤 상품 카테고리를 프로모션할지",
        "장바구니 이탈 방지 전략을 어떻게 할지",
        "고객 세그먼트별 마케팅을 차별화할지",
      ],
    },
  },
];

/** 에이전트 설명에서 가장 적합한 스킬을 선택 (없으면 null) */
export function selectSkill(description: string): SkillOutput | null {
  const lower = description.toLowerCase();

  let bestMatch: SkillDefinition | null = null;
  let bestScore = 0;

  for (const skill of SKILLS) {
    const score = skill.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = skill;
    }
  }

  if (!bestMatch || bestScore === 0) return null;

  return {
    name: bestMatch.name,
    data: bestMatch.data,
  };
}
