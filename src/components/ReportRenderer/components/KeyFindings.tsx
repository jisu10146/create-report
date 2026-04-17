/**
 * KeyFindings — 줄글 스토리 컴포넌트
 *
 * 카드 배경 없이 문단 텍스트로 렌더링.
 * \n\n으로 분리된 각 문단을 독립 <p>로 표시.
 */

interface KeyFindingsData {
  text: string;
}

export default function KeyFindings({ data }: { data: KeyFindingsData }) {
  const paragraphs = data.text.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-5">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[15px] font-normal leading-[24px] text-report-text-primary"
        >
          {p}
        </p>
      ))}
    </div>
  );
}
