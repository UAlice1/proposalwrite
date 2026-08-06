import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Proposal AI - Professional Business Proposals for African SMEs",
  description: "AI-powered proposal writer integrated with Pryro SOP ecosystem. Generate professional, client-ready business proposals, bids, and RFP responses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50">{children}</body>
    </html>
  );
}
