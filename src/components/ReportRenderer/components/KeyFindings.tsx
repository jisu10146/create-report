/**
 * KeyFindings — 줄글 스토리 컴포넌트
 * ES 결론의 근거를 연결된 문단으로 렌더링.
 */

interface KeyFindingsData {
  text: string;
}

export default function KeyFindings({ data }: { data: KeyFindingsData }) {
  const paragraphs = data.text.split("\n\n").filter(Boolean);

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] font-normal leading-[24px] text-report-text-primary"
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
