"use client";

import dynamic from "next/dynamic";

const DesignSystemClient = dynamic(() => import("./DesignSystemClient"), { ssr: false });

export default function DesignSystemWrapper() {
  return <DesignSystemClient />;
}
