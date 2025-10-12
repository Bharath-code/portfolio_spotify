import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import resumeData from "@/lib/resume";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const { personal, profile } = resumeData;

export const metadata: Metadata = {
  title: `${personal.name} • ${personal.role}`,
  description: profile,
  metadataBase: new URL(personal.portfolio || "https://bharathkumar.dev"),
  openGraph: {
    title: `${personal.name} • ${personal.role}`,
    description: profile,
    url: "/",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${personal.name} • ${personal.role}`,
    description: profile,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
