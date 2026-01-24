import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { DotBackground } from "@/components/dot-background"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
    title: "Rahul | AI Engineer & Teacher",
    description:
        "Machine Learning Engineer & AI Educator. Building intelligent systems and teaching the next generation of AI practitioners.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${lora.variable} font-sans`}>
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
