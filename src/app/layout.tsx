import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { DotBackground } from "@/components/dot-background"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

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
            <body className={inter.className}>
                <Providers>
                    <DotBackground />
                    <div className="container mx-auto min-h-screen">
                        <Navigation />
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}
