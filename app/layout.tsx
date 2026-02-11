import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Close Diagnostic — How Efficient Is Your Month-End Close?",
  description:
    "Answer 8 quick questions and get your Close Efficiency Score — benchmarked against dozens of leading finance teams. Free, takes under 2 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
