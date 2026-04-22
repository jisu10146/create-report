"use client";

import type { ReportSchema, AgentDefinition } from "@/types";
import { renderComponent } from "../components";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

export default function SingleSectionLayout({ report, agent }: Props) {
  const sections = report.sections ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-report-text-primary">{agent.name}</h2>
          <p className="text-sm text-report-text-secondary mt-1">{agent.description}</p>
        </div>
      </div>
      {/* 구분선 */}
      <hr className="border-report-border mb-14" />

      {/* Sequential sections */}
      <div className="[&>*+*]:mt-16 [&>*+*]:pt-14 [&>*+*]:border-t [&>*+*]:border-report-border">
        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < sections.length) {
            const section = sections[i];

            // DonutChart → description 없으면 다음 섹션과 2열 그리드로 묶기
            // description 있으면 독립 섹션으로 렌더링 (기본 경로)
            const donutHasDesc = !!(section.data as Record<string, unknown>)?.description;
            if (section.componentType === "DonutChart" && i + 1 < sections.length && !donutHasDesc && sections[i + 1].componentType !== "DonutChart") {
              const next = sections[i + 1];
              elements.push(
                <div key={section.id}>
                  <div className="grid grid-cols-12 gap-[24px] mb-3">
                    <div className="col-span-5">
                      {section.headline && (
                        <h3 className="report-section-title">{section.headline}</h3>
                      )}
                    </div>
                    <div className="col-span-7">
                      {next.headline && next.componentType !== "ExecutiveSummary" && (
                        <h3 className="report-section-title">{next.headline}</h3>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-[24px] items-stretch">
                    <div className="col-span-5 flex flex-col">
                      <div className="bg-report-bg rounded-section p-[8px] flex-1">
                        {renderComponent(section.componentType, section.data)}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <div className="bg-report-bg rounded-section p-[8px] h-full">
                        {renderComponent(next.componentType, next.data)}
                      </div>
                    </div>
                  </div>
                </div>
              );
              i += 2;
              continue;
            }

            // InterpretationBlock / ChecklistCard — 타이틀 없이 앞 섹션에 붙임
            if (section.componentType === "InterpretationBlock" || section.componentType === "ChecklistCard") {
              elements.push(
                <div key={section.id} className="-mt-4">
                  <div className="bg-report-bg rounded-section p-[8px]">
                    {renderComponent(section.componentType, section.data)}
                  </div>
                </div>
              );
              i++;
              continue;
            }

            // InsightCard / UserCard / QuoteCard — headline 없으면 앞 섹션에 붙임 (독립 섹션일 땐 기본 경로)
            if (
              (section.componentType === "InsightCard" || section.componentType === "UserCard" || section.componentType === "QuoteCard") &&
              !section.headline
            ) {
              elements.push(
                <div key={section.id} className="-mt-4">
                  <div className="bg-report-bg rounded-section p-[8px]">
                    {renderComponent(section.componentType, section.data)}
                  </div>
                </div>
              );
              i++;
              continue;
            }

            // 같은 타입 차트 2개 연속 + 두 번째에 headline 없음 → 2열 그리드
            if (
              i + 1 < sections.length &&
              section.componentType === sections[i + 1].componentType &&
              !sections[i + 1].headline
            ) {
              const next = sections[i + 1];
              const sectionName = (section as unknown as Record<string, unknown>).sectionName as string | undefined;
              const sName = sectionName || (next as unknown as Record<string, unknown>).sectionName as string | undefined;
              const desc = (section.data as unknown as Record<string, unknown>)?.description as string | undefined;
              const chartTitle1 = (section.data as unknown as Record<string, unknown>)?.chartTitle as string | undefined;
              const chartTitle2 = (next.data as unknown as Record<string, unknown>)?.chartTitle as string | undefined;

              elements.push(
                <div key={section.id}>
                  {sName && (
                    <p className="text-xs font-medium text-report-text-secondary mb-4">{sName}</p>
                  )}
                  {section.headline && (
                    <h3 className="report-section-title mb-3">{section.headline}</h3>
                  )}
                  {desc && (
                    <p className="text-[15px] text-report-text-secondary mb-6 leading-[24px]">{desc}</p>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      {chartTitle1 && (
                        <p className="text-[13px] font-semibold text-report-text-primary mb-1">{chartTitle1}</p>
                      )}
                      {renderComponent(section.componentType, section.data)}
                    </div>
                    <div>
                      {chartTitle2 && (
                        <p className="text-[13px] font-semibold text-report-text-primary mb-1">{chartTitle2}</p>
                      )}
                      {renderComponent(next.componentType, next.data)}
                    </div>
                  </div>
                </div>
              );
              i += 2;
              continue;
            }

            // 기본
            {
              const attached: typeof sections = [];
              let j = i + 1;
              while (
                j < sections.length &&
                (
                  sections[j].componentType === "InterpretationBlock" ||
                  sections[j].componentType === "ChecklistCard" ||
                  ((sections[j].componentType === "InsightCard" || sections[j].componentType === "UserCard" || sections[j].componentType === "QuoteCard") && !sections[j].headline)
                )
              ) {
                attached.push(sections[j]);
                j++;
              }

              const sectionName = (section as unknown as Record<string, unknown>).sectionName as string | undefined;
              const desc = (section.data as unknown as Record<string, unknown>)?.description as string | undefined;
              const chartTitle = (section.data as unknown as Record<string, unknown>)?.chartTitle as string | undefined;

              elements.push(
                <div key={section.id}>
                  {/* 섹션명 */}
                  {sectionName && (
                    <p className="text-xs font-medium text-report-text-secondary mb-4">{sectionName}</p>
                  )}
                  {/* 헤드라인 */}
                  {section.headline && (
                    <h3 className="report-section-title mb-3">{section.headline}</h3>
                  )}
                  {/* 디스크립션 */}
                  {desc && (
                    <p className="text-[15px] text-report-text-secondary mb-6 leading-[24px]">{desc}</p>
                  )}
                  {/* 그래프/표 영역 */}
                  <div className="flex flex-col gap-[4px]">
                    {chartTitle && (
                      <p className="text-[13px] font-semibold text-report-text-primary mb-1">{chartTitle}</p>
                    )}
                    {renderComponent(section.componentType, section.data)}
                    {attached.map((att) => (
                      <div key={att.id}>{renderComponent(att.componentType, att.data)}</div>
                    ))}
                  </div>
                </div>
              );
              i = j;
            }
          }
          return elements;
        })()}
      </div>
    </div>
  );
}
