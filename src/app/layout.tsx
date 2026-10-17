import type { Metadata, Viewport } from "next";
import { Inter_Tight, Geist_Mono } from "next/font/google";
import { site, person } from "@/content/profile";
import "./globals.css";

const inter = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: person.name, url: site.url }],
  creator: person.name,
  keywords: ["AI Engineer", "LLM agents", "RAG", "Machine Learning", "AWS SageMaker", "Python", "FastAPI", "Data Science trainer", "Nepal", "Kathmandu", person.name],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} — Blog` }] },
  },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, url: site.url, title: site.title, description: site.description },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

/** Marks JS as available before first paint, so reveal animations never hide content without JS. */
const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
