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
    title: "Rahul | AI Engineer & Teacher",
    description:
        "Machine Learning Engineer & AI Educator. Building intelligent systems and teaching the next generation of AI practitioners.",
    keywords: "AI Engineer, Machine Learning, AWS, Amazon Bedrock, Technical Blog, AI Education, Cloud Computing, MLOps",
    authors: [{ name: "Rahul" }],
    robots: "index, follow",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.rahuldevbanjara.com.np",
        title: "Rahul | AI Engineer & Teacher",
        description: "Machine Learning Engineer & AI Educator. Building intelligent systems and teaching the next generation of AI practitioners.",
        siteName: "Rahul's Technical Blog",
    },
    twitter: {
        card: "summary_large_image",
        title: "Rahul | AI Engineer & Teacher",
        description: "Machine Learning Engineer & AI Educator. Building intelligent systems and teaching the next generation of AI practitioners.",
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
                        <div className="container mx-auto">
                            <Navigation />
                        </div>
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}
