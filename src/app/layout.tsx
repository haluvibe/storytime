import type { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = {
  title: "Storytime",
  description: "A Next.js application with Material UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
