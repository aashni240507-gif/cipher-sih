import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CIPHER – AI-Powered Criminal Network Analysis System",
  description:
    "CIPHER – Decode the Hidden Network. Forensic intelligence and cyber network analysis platform turning fragmented data into connected intelligence.",
};

import { AuthProvider } from "@/components/AuthProvider";
import { InvestigationProvider } from "@/components/InvestigationContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05080e] text-slate-200">
        <AuthProvider>
          <InvestigationProvider>{children}</InvestigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
