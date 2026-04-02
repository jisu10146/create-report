"use client";

import { COMPONENT_REGISTRY } from "@/components/ReportRenderer/components";
import React from "react";

/* ─── 각 컴포넌트별 더미 데이터 (피그마 검수용) ─── */

const SAMPLE_DATA: Record<string, { label: string; data: unknown }> = {
  "ExecutiveSummary:TypeA": {
    label: "Executive Summary — Type A (Description + Findings)",
    data: {
      description: "본 보고서는 2023년 6월부터 2024년 6월까지 약 1년간의 고객 행동 데이터를 기반으로, 총 80명의 고객을 대상으로 한 이탈 예측 및 군집 분석 결과를 종합하여 제시합니다.",
      keyFindings: [
        "자산 연결 기능은 고객이 서비스에 남을지 결정하는 가장 중요한 단계이며, 이 단계를 넘지 못한 고객의 86%가 결국 서비스를 떠나고 있습니다.",
        "30대 고객은 서비스 탐색 의지가 가장 높으나 습관 형성에 어려움을 겪는 층으로, 리텐션 개선을 위해 가장 먼저 집중해야 할 타겟입니다.",
        "단순 방문이 '자산 연결'로 이어지지 않은 채 5일이 경과하는 시점은 고객이 서비스를 잊어가는 위험 신호이며, 이 기간이 이탈을 막을 수 있는 마지막 '골든타임'입니다.",
        "가입 첫날 자산 연결을 유도하는 온보딩 최적화를 진행하고, 접속이 4일 이상 지난 고객에게는 맞춤형 알림을 보내 재방문을 유도해야 합니다.",
      ],
    },
  },
  "ExecutiveSummary:TypeB": {
    label: "Executive Summary — Type B (Metrics + Findings)",
    data: {
      topMetrics: [
        { label: "Survey Topic", value: "New premium membership launch response survey" },
        { label: "Number of respondents", value: "5,000" },
      ],
      keyFindings: [
        "Subscription intent : High or higher (68%)",
        "Most desired benefit : Ad-free viewing (72%)",
        "Main concern : Price burden (45%)",
        "Reasonable price : $10-15 (52%)",
      ],
    },
  },
  MetricCard: {
    label: "Metric Card",
    data: {
      items: [
        { label: "전체 분석 고객", value: "24,831", unit: "명" },
        { label: "고위험군 (Tier 1)", value: "2,284", unit: "명" },
        { label: "고위험군 평균 LTV", value: "94,200", unit: "원" },
        { label: "모델 정확도", value: 87.3, unit: "%" },
      ],
    },
  },
  BulletCard: {
    label: "Bullet Card",
    data: {
      title: "고유 고객 수 24명",
      bullets: [
        "전체 고객 대비 약 30%를 차지하는 대규모 이탈 위험 고객군으로, 서비스 안정성에 중대한 영향을 미침",
        "24명으로 전체 80명 중 상당 비중 차지",
        "대규모 군집인 만큼 개별 맞춤형보다는 군집 특성 기반의 전략 수립이 효과적",
      ],
    },
  },
  ScoreCard: {
    label: "Score Card",
    data: {
      score: 72,
      maxScore: 100,
      badge: "개선 필요",
      badgeColor: "orange",
      bullets: [
        "핵심 메시지가 3문단 이후에 등장 — 1문단으로 이동 필요",
        "기술 용어 비중이 높아 일반 매체 게재 시 가독성 저하 우려",
        "데이터 인용은 양호하나 헤드라인에 뉴스 앵글이 부족",
      ],
    },
  },
  HorizontalBarChart: {
    label: "Horizontal Bar Chart",
    data: {
      question: "콘텐츠 유형별 평균 참여율 (%)",
      items: [
        { label: "숏폼 영상", value: 87 },
        { label: "라이브 스트리밍", value: 62 },
        { label: "카드뉴스", value: 48 },
        { label: "블로그 포스트", value: 35 },
        { label: "단일 이미지", value: 28 },
      ],
    },
  },
  InterpretationBlock: {
    label: "Interpretation Block",
    data: {
      text: "숏폼 영상이 압도적인 참여율 1위를 차지했습니다. 특히 15~30초 길이의 교육형 콘텐츠가 평균 대비 1.8배 높은 성과를 보이고 있습니다. 반면 텍스트 포스트는 참여율이 지속 하락 중이며 비중 축소를 권장합니다.",
    },
  },
  DoDontCard: {
    label: "DO / DON'T Card",
    data: {
      dos: [
        "숏폼 영상 비중을 전체의 40%로 확대",
        "화·목 오전 9-11시 '골든타임' 발행 집중",
        "사용자 참여 유도형 CTA 삽입 (투표, 질문 등)",
      ],
      donts: [
        "텍스트 전용 포스트에 리소스 투입",
        "주말 오후 발행 — 도달률 평균 대비 -43%",
        "동일 포맷 반복 발행 — 알고리즘 페널티 위험",
      ],
    },
  },
  SignalCard: {
    label: "Signal Card",
    data: {
      items: [
        {
          signalName: "접속 빈도 급감",
          bullets: ["전월 대비 접속 50% 이상 감소", "주간 활성 세션 1회 미만", "알림 비활성화 동반 시 위험도 +40%"],
          badge: "HIGH RISK",
          badgeColor: "red",
        },
        {
          signalName: "구매 공백 45일+",
          bullets: ["마지막 구매로부터 45일 초과", "위시리스트 업데이트 없음", "장바구니 방치 14일 이상"],
          badge: "HIGH RISK",
          badgeColor: "red",
        },
        {
          signalName: "CS 불만 신호",
          bullets: ["최근 90일 내 CS 문의 2건 이상", "배송/환불 관련 이슈", "낮은 만족도 점수 (3점 이하)"],
          badge: "MEDIUM",
          badgeColor: "orange",
        },
      ],
    },
  },
  StrategyTable: {
    label: "Strategy Table",
    data: {
      immediate: [
        { action: "Tier 1 고위험군 긴급 Win-Back 이메일 발송", owner: "CRM팀", metric: "이메일 오픈율 15%+", priority: "P0" },
        { action: "CS 불만 고객 1:1 전담 상담 연결", owner: "CS팀", metric: "만족도 4점 이상 회복", priority: "P0" },
      ],
      short: [
        { action: "접속 빈도 기반 자동 푸시 알림 트리거 구축", owner: "마케팅엔지니어링팀", metric: "재접속 전환율 12%+", priority: "P1" },
      ],
      mid: [
        { action: "로열티 프로그램 리뉴얼", owner: "프로덕트팀", metric: "재구매율 +8%p", priority: "P2" },
      ],
    },
  },
  RevenueScenarioBar: {
    label: "Revenue Scenario Bar",
    data: {
      unit: "억원 (연간)",
      scenarios: [
        { label: "Upside", value: 78, description: "이탈 방어율 60% 달성, 로열티 프로그램 조기 성과" },
        { label: "Base", value: 54, description: "이탈 방어율 40%, 계획 실행 기준" },
        { label: "Downside", value: 28, description: "이탈 방어율 20%, 실행 지연 또는 경쟁 심화" },
      ],
    },
  },
  SampleCard: {
    label: "Sample Card",
    data: {
      items: [
        { id: "CUS-001", bullets: ["35세 여성, IT 직군", "월 평균 구매 3.2회", "최근 30일 접속 12회"] },
        { id: "CUS-002", bullets: ["42세 남성, 금융 직군", "월 평균 구매 1.1회", "최근 30일 접속 2회"] },
      ],
    },
  },
  SyntheticPersonaCard: {
    label: "Synthetic Persona Card",
    data: {
      items: [
        {
          id: "P-Alpha",
          name: "김서연",
          gender: "여성",
          age: 32,
          job: "UX 디자이너",
          summary: "트렌드에 민감하며 신규 기능을 적극 활용하는 얼리어답터 성향의 충성 고객.",
          tabs: [
            { label: "행동 패턴", content: "주 4회 이상 접속, 신기능 출시 당일 체험률 92%. 커뮤니티 활동 활발." },
            { label: "구매 성향", content: "프리미엄 요금제 유지 18개월째. 부가 서비스 평균 2.3개 이용." },
          ],
        },
        {
          id: "P-Beta",
          name: "박준형",
          gender: "남성",
          age: 45,
          job: "재무 담당자",
          summary: "비용 효율을 중시하며, 기본 기능만 사용하는 실용주의형 고객.",
          tabs: [
            { label: "행동 패턴", content: "주 1-2회 접속, 주로 리포트 조회 목적. 모바일 사용 비율 80%." },
            { label: "구매 성향", content: "기본 요금제 12개월째. 할인 쿠폰 사용률 높음." },
          ],
        },
      ],
    },
  },
};

export default function ComponentGallerySection() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Component Gallery</h2>
        <p className="text-sm text-report-text-secondary">
          실제 리포트 컴포넌트를 더미 데이터로 렌더링합니다. 피그마와 비교해서 검수하세요.
        </p>
      </div>

      {Object.entries(SAMPLE_DATA).map(([type, { label, data }]) => {
        const componentKey = type.split(":")[0];
        const Component = COMPONENT_REGISTRY[componentKey];
        if (!Component) return null;

        return (
          <div key={type} className="space-y-3">
            {/* Component label */}
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-report-text-primary">{label}</h3>
              <span className="text-xs font-mono bg-report-bg text-report-text-secondary px-2 py-0.5 rounded-chip border border-report-border">
                {componentKey}
              </span>
            </div>

            {/* Actual rendered component */}
            {React.createElement(Component, { data })}
          </div>
        );
      })}
    </div>
  );
}
