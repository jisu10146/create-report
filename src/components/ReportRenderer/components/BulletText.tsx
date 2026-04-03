/**
 * BulletText — 동그라미 불릿 텍스트 컴포넌트
 *
 * - list-style-position: inside로 불릿을 텍스트 흐름 안에 배치
 * - pl-0으로 ul 기본 들여쓰기 제거
 * - 불릿 텍스트 시작점이 상위 컨텐츠와 수평 정렬됨
 * - 여러 줄일 때 두 번째 줄은 불릿 뒤 텍스트 시작점에 맞춤 (hanging indent)
 */

interface BulletTextProps {
  items: string[];
}

export default function BulletText({ items }: BulletTextProps) {
  return (
    <ul className="flex flex-col gap-[10px] pl-0 m-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-base font-medium text-report-text-primary leading-[24px] list-none pl-[18px] indent-[-18px]"
        >
          <span className="inline-block w-[18px] text-center shrink-0 indent-0" aria-hidden="true">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-report-text-primary relative top-[-1px]" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
