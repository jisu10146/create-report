import { Callout } from "@cubig/design-system";
import type { InterpretationBlockData } from "@/types";

export default function InterpretationBlock({ data }: { data: InterpretationBlockData }) {
  return (
    <Callout
      variant="info"
      size="medium"
      title="AI 해석"
      description={data.text}
      leadingIcon
    />
  );
}
