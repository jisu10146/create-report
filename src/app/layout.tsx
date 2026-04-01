import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Report System",
  description: "B2B SaaS 에이전트 리포트 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
