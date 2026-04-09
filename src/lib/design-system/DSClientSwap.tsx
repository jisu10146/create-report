"use client";

import { useState, useEffect, type ReactElement } from "react";

/**
 * DSClientSwap — 서버에서는 fallback을 렌더링하고,
 * 클라이언트 마운트 후 DS 컴포넌트로 교체.
 *
 * suppressHydrationWarning으로 교체 시 hydration 경고 억제.
 */
export default function DSClientSwap({
  fallback,
  ds,
}: {
  fallback: ReactElement;
  ds: ReactElement | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div suppressHydrationWarning>
      {mounted && ds ? ds : fallback}
    </div>
  );
}
