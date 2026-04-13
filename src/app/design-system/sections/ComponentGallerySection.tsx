"use client";

import { COMPONENT_REGISTRY } from "@/components/ReportRenderer/components";
import { PersonaModalInline } from "@/components/ReportRenderer/components/PersonaModal";
import type { PersonaModalData } from "@/types";
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
  SectionTitle: {
    label: "Section Title",
    data: {
      title: "타이틀",
      subtitle: "이탈률이 고정적으로 높아 조기 개입 없이는 개선 어려움 지속적인 이탈이 늘어날것 으로 예상된다.",
    },
  },
  BulletCard: {
    label: "Bullet Card",
    data: {
      title: "고유 고객 수",
      value: "24명",
      bullets: [
        "전체 고객 대비 약 30%를 차지하는 대규모 이탈 위험 고객군으로, 서비스 안정성에 중대한 영향을 미침",
        "24명으로 전체 80명 중 상당 비중 차지",
        "대규모 군집인 만큼 개별 맞춤형보다는 군집 특성 기반의 전략 수립이 효과적",
      ],
    },
  },
  InterpretationBlock: {
    label: "Interpretation Block",
    data: {
      text: "A total of 3,400 users (72%) expressed interest in subscribing. This suggests low resistance to the membership itself and indicates strong potential for actual conversion depending on the benefits offered.",
    },
  },
  "InsightCard:badge+interpretation": {
    label: "Insight Card — Badge + Interpretation",
    data: {
      badge: "Signal 1",
      title: "days_inactive 증가",
      description: "days_inactive 평균 약 190.47일\n7일 기준 CHURN에 앞서 30일·60일 구간에서 단계별 개입 전략이 필요합니다.",
      interpretation: "원인: 장기간 재접속 유인이 부족, 가치 체험 실패 누적",
    },
  },
  "InsightCard:badge": {
    label: "Insight Card — Badge Only",
    data: {
      badge: "Signal 2",
      title: "page_views_last_30d 감소",
      description: "최근 30일 페이지뷰가 평균 대비 62% 하락했습니다. 콘텐츠 소비 습관이 형성되지 않은 것으로 판단됩니다.",
    },
  },
  "InsightCard:interpretation": {
    label: "Insight Card — Interpretation Only",
    data: {
      title: "login_frequency 저하",
      description: "주간 로그인 빈도가 0.3회 이하로 떨어진 사용자가 전체의 34%를 차지합니다.",
      interpretation: "원인: 초기 온보딩 미완료로 핵심 기능 미경험",
    },
  },
  ClusterCard: {
    label: "Cluster Card",
    data: {
      items: [
        {
          badge: "High-Risk Cluster",
          badgeColor: "#2b7fff",
          title: "이탈 위험 집중 군집 (30대)",
          description: "이탈 위험 집중 군집(30대)은 서비스 탐색 의지가 가장 높으나 습관 형성에 어려움을 겪는 집단으로, 자산 연결 이전 단계에서 다수가 이탈하고 있습니다.",
        },
      ],
    },
  },
  UserCard: {
    label: "User Card",
    data: {
      items: [
        {
          name: "Jung Minju",
          subtitle: "Female, Age 32, Developer",
          description: "Selected $10–$14.99. Uses the service daily and values ad-free viewing the most. Open to annual billing if discount is 20%+.",
        },
        {
          name: "Park Jihoon",
          subtitle: "Male, Age 28, Designer",
          description: "Selected $5–$9.99. Primarily uses mobile app. Most interested in exclusive content and early access features.",
        },
      ],
      hasViewDetail: true,
    },
  },
  PieBarChart: {
    label: "Pie Chart + Bar Chart",
    data: {
      pieTitle: "Subscription Intent",
      pieItems: [
        { label: "High", value: 42 },
        { label: "Medium", value: 30 },
        { label: "Low", value: 28 },
      ],
      barTitle: "Desired Benefits",
      barItems: [
        { label: "Ad-free", value: 72 },
        { label: "Exclusive", value: 58 },
        { label: "Early access", value: 45 },
      ],
    },
  },
  RevenueScenarioBar: {
    label: "Revenue Scenario Bar (bar graph Revenue)",
    data: {
      scenarios: [
        {
          label: "Upside",
          badge: "30% Retention Case",
          details: ["ARPU: $50", "Retained Users: 90"],
          highlight: "Expected Revenue: $450",
          value: 450,
        },
        {
          label: "Base",
          badge: "15% Retention Case",
          details: ["ARPU: $50", "Retained Users: 90"],
          highlight: "Expected Revenue: $250",
          value: 250,
        },
        {
          label: "Downside",
          badge: "5% Retention Case",
          details: ["ARPU: $50", "Retained Users: 90"],
          highlight: "Expected Revenue: $100",
          value: 100,
        },
      ],
    },
  },
  MetricHighlight: {
    label: "Metric Highlight",
    data: {
      label: "허용 가격대 폭 (PMC ~ PME 간격)",
      value: "$226.18",
      sub: "OPP 대비 18.8%",
      description: "이 범위는 비교적 넓은 편으로, 소비자들이 다양한 가격대에서 제품을 수용할 수 있음을 시사합니다. 이는 제품의 가격에 대한 유연성이 존재하며, 소비자들이 가격에 대해 상대적으로 관대할 수 있음을 의미합니다.",
    },
  },
  ChecklistCard: {
    label: "Checklist Card",
    data: {
      title: "현재 가격 위치",
      description: "신제품의 목표 가격이 허용 범위인 $1,181.82 ~ $1,408.00 내에 위치하는지 확인해야 합니다. 만약 목표 가격이 이 범위를 벗어난다면, 소비자들의 가격 저항이 증가할 수 있으며, 이는 판매에 부정적인 영향을 미칠 수 있습니다.",
    },
  },
  PersonaModal: {
    label: "Persona Modal (Synthetic Respondent Samples)",
    data: {
      title: "Synthetic Respondent Samples",
      personas: [
        {
          name: "Kim Seoyeon",
          subtitle: "Female, Age 28, Marketing Manager",
          description: "Early adopter highly sensitive to trends.",
          details: [
            { label: "Personality Traits", content: "Early adopter highly sensitive to trends, actively exploring new features and services." },
            { label: "Lifestyle", content: "Frequent overtime on weekdays leads to concentrated content consumption on weekends." },
            { label: "Consumption Patterns", content: "Average monthly entertainment spending: $85. High willingness to pay for premium content." },
          ],
        },
        {
          name: "Park Jihoon",
          subtitle: "Male, Age 35, Engineer",
          description: "Practical user focused on core features.",
          details: [
            { label: "Personality Traits", content: "Values efficiency and reliability over novelty. Methodical approach to tool adoption." },
            { label: "Lifestyle", content: "Work-life balance focused. Uses service primarily during commute and lunch breaks." },
            { label: "Consumption Patterns", content: "Average monthly entertainment spending: $45. Price-sensitive but loyal once committed." },
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

        // PersonaModal: 모달을 열린 상태로 인라인 렌더링
        if (componentKey === "PersonaModal") {
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-report-text-primary">{label}</h3>
                <span className="text-xs font-mono bg-report-bg text-report-text-secondary px-2 py-0.5 rounded-chip border border-report-border">
                  {componentKey}
                </span>
              </div>
              <PersonaModalInline data={data as PersonaModalData} />
            </div>
          );
        }

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
