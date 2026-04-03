"use client";

import DonutChart from "@/components/ReportRenderer/components/DonutChart";
import HorizontalBarChart from "@/components/ReportRenderer/components/HorizontalBarChart";
import DataTable from "@/components/ReportRenderer/components/DataTable";
import StrategyTable from "@/components/ReportRenderer/components/StrategyTable";

/* ─── Donut Chart 더미 데이터 ─── */

const DONUT_SAMPLES = [
  {
    name: "Donut Chart — 6개 항목 (최대)",
    data: {
      title: "Response Rate by Age Group",
      items: [
        { label: "Age 15-19", value: 25, count: 1200 },
        { label: "Age 20-24", value: 10, count: 360 },
        { label: "Age 25-29", value: 15, count: 450 },
        { label: "Age 30-39", value: 5, count: 240 },
        { label: "Age 40-49", value: 45, count: 750 },
        { label: "Age 50-59", value: 5, count: 240 },
      ],
    },
  },
  {
    name: "Donut Chart — 4개 + 기타 (회색)",
    data: {
      title: "Cluster Distribution",
      items: [
        { label: "Active Majority", value: 45, count: 3200 },
        { label: "At-risk Cluster", value: 25, count: 1800 },
        { label: "Low Activity", value: 18, count: 1300 },
        { label: "기타", value: 12, count: 860, isOther: true },
      ],
    },
  },
];

/* ─── Horizontal Bar Chart 더미 데이터 ─── */

const BAR_SAMPLES = [
  {
    name: "Horizontal Bar Chart — 3색 순위 + count",
    data: {
      question: "만족도 분포 (%)",
      items: [
        { label: "Very High", value: 38, count: 1900 },
        { label: "High", value: 32, count: 1600 },
        { label: "Medium", value: 14, count: 700 },
        { label: "Low", value: 10, count: 500 },
        { label: "Very Low", value: 6, count: 300 },
      ],
    },
  },
  {
    name: "Horizontal Bar Chart — count 없이",
    data: {
      question: "가격대별 수용도 분포 (%)",
      items: [
        { label: "₩8,000~10,000", value: 25 },
        { label: "₩11,000~13,000", value: 58 },
        { label: "₩14,000~16,000", value: 87 },
        { label: "₩17,000~19,000", value: 62 },
        { label: "₩20,000~22,000", value: 34 },
        { label: "₩23,000 이상", value: 12 },
      ],
    },
  },
];

/* ─── Data Table 더미 데이터 ─── */

const TABLE_SAMPLE = {
  name: "Data Table — 클러스터별 비교",
  data: {
    columns: [
      { label: "이탈 위험 집중 군집 (30대)" },
      { label: "이탈 고위험 소수 군집 (40대 남성)" },
      { label: "활동성 유지 대다수 군집 (40대 중심)" },
    ],
    rows: [
      { metric: "Cluster distribution", values: ["56.3% (45)", "56.3% (45)", "56.3% (45)"] },
      { metric: "Churn rate", values: ["90%", "90%", "90%"] },
      { metric: "Monthly average churn rate", values: ["86.8%", "86.8%", "85.15%"] },
      { metric: "Monthly average retention rate", values: ["86.8%", "86.8%", "85.15%"] },
      { metric: "Average session duration", values: ["86.8%", "86.8%", "85.15%"] },
      { metric: "Average transaction count", values: ["86.8%", "86.8%", "85.15%"] },
    ],
  },
};

/* ─── Strategy Table 더미 데이터 ─── */

const STRATEGY_TABLE_SAMPLE = {
  immediate: [
    { strategy: "긴급 Win-Back", objective: "고위험군 즉시 접촉", actionPlan: "CRM팀 Tier 1 대상 Win-Back 이메일 발송", expectedImpact: "이메일 오픈율 15%+" },
    { strategy: "CS 불만 대응", objective: "불만 고객 만족도 회복", actionPlan: "CS팀 1:1 전담 상담 연결", expectedImpact: "만족도 4점 이상 회복" },
  ],
  short: [
    { strategy: "푸시 알림 자동화", objective: "접속 빈도 하락 고객 재유입", actionPlan: "마케팅엔지니어링팀 자동 트리거 구축", expectedImpact: "재접속 전환율 12%+" },
    { strategy: "개인화 쿠폰", objective: "구매 공백 고객 재구매 유도", actionPlan: "CRM팀 구매 공백 30일 기준 자동 발급", expectedImpact: "재구매율 35%+" },
  ],
  mid: [
    { strategy: "로열티 리뉴얼", objective: "포인트→혜택 중심 전환", actionPlan: "프로덕트팀 로열티 프로그램 재설계", expectedImpact: "재구매율 +8%p" },
    { strategy: "모델 자동 재학습", objective: "예측 모델 정확도 유지", actionPlan: "ML팀 월간 재학습 파이프라인 자동화", expectedImpact: "모델 정확도 90%+ 유지" },
  ],
};

/* ─── Main ─── */

export default function ChartsSection() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Charts</h2>
        <p className="text-sm text-report-text-secondary">
          피그마 기준 차트 컴포넌트. 더미 데이터로 렌더링합니다.
        </p>
      </div>

      {/* Donut Charts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider">
          Donut Chart
        </h3>
        <div className="space-y-4">
          {DONUT_SAMPLES.map((sample) => (
            <div key={sample.name}>
              <p className="text-sm text-report-text-secondary mb-2">{sample.name}</p>
              <DonutChart data={sample.data} />
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Bar Charts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider">
          Horizontal Bar Chart
        </h3>
        <div className="space-y-6">
          {BAR_SAMPLES.map((sample) => (
            <div key={sample.name}>
              <p className="text-sm text-report-text-secondary mb-2">{sample.name}</p>
              <div className="bg-report-card border border-report-border rounded-card p-[24px]">
                <HorizontalBarChart data={sample.data} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Data Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-report-text-secondary uppercase tracking-wider">
          Data Table
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-report-text-secondary mb-2">Data Table — Type 1 (클러스터별 비교)</p>
            <div className="bg-report-card border border-report-border rounded-card p-[24px]">
              <DataTable data={TABLE_SAMPLE.data} />
            </div>
          </div>
          <div>
            <p className="text-sm text-report-text-secondary mb-2">Data Table — Type 2 (Strategy Table)</p>
            <StrategyTable data={STRATEGY_TABLE_SAMPLE} />
          </div>
        </div>
      </div>
    </div>
  );
}
