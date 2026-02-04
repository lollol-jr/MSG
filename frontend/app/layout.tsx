import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSG - AI Messenger",
  description: "AI-powered messenger application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
