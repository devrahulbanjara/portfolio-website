import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { DotBackground } from "@/components/dot-background"
import { Navigation } from "@/components/navigation"
import { Analytics } from "@/components/analytics"
import { WebVitals } from "@/components/web-vitals"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
    title: "Rahul | AWS & NVIDIA Certified ML & Gen AI Engineer",
    description:
        "AWS and NVIDIA Certified ML & Gen AI Engineer shipping end-to-end AI systems across healthcare and enterprise — RAG, multi-agent orchestration, backend engineering, and full MLOps lifecycles — and a certified trainer teaching the next wave of ML engineers.",
    keywords:
        "AI Engineer, Machine Learning, AWS, Amazon Bedrock, Agentic AI, RAG, MLOps, Technical Blog, AI Education, Cloud Computing",
    authors: [{ name: "Rahul Dev Banjara" }],
    robots: "index, follow",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.rahuldevbanjara.com.np",
        title: "Rahul | AWS & NVIDIA Certified ML & Gen AI Engineer",
        description:
            "AWS and NVIDIA Certified ML & Gen AI Engineer shipping end-to-end AI systems across healthcare and enterprise — RAG, multi-agent orchestration, backend engineering, and full MLOps lifecycles — and a certified trainer teaching the next wave of ML engineers.",
        siteName: "Rahul's Technical Blog",
    },
    twitter: {
        card: "summary_large_image",
        title: "Rahul | AWS & NVIDIA Certified ML & Gen AI Engineer",
        description:
            "AWS and NVIDIA Certified ML & Gen AI Engineer shipping end-to-end AI systems across healthcare and enterprise — RAG, multi-agent orchestration, backend engineering, and full MLOps lifecycles.",
        creator: "@rahul",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${lora.variable} font-sans`}>
                <Analytics />
                <WebVitals />
                <Providers>
                    <DotBackground />
                    <div className="min-h-screen">
                        <Navigation />
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}
