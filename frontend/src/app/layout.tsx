import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Product Search",
  description: "A polished multilingual voice shopping experience powered by AWS Transcribe and AI search.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
