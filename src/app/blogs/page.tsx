import Link from "next/link"
import type { Metadata } from "next"
import { blogPosts } from "@/data/blog-metadata"
import { personalInfo } from "@/data/portfolio-data"

export const metadata: Metadata = {
    title: `Blog | ${personalInfo.name}`,
    description: `Read articles about machine learning, MLOps, AI, and software engineering by ${personalInfo.name}.`,
    openGraph: {
        title: `Blog | ${personalInfo.name}`,
        description: `Read articles about machine learning, MLOps, AI, and software engineering by ${personalInfo.name}.`,
        type: "website",
    },
    twitter: {
        card: "summary",
        title: `Blog | ${personalInfo.name}`,
        description: `Read articles about machine learning, MLOps, AI, and software engineering.`,
    },
}

export default function BlogsPage() {
    const posts = blogPosts()

    return (
        <main className="min-h-screen pb-24">
            {/* Header */}
            <header className="max-w-[672px] mx-auto px-6 pt-8 sm:pt-20 pb-12">
                <h1 className="text-[32px] sm:text-[38px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
                    Blog
                </h1>
                <p className="mt-3 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-[520px]">
                    Thoughts on machine learning, cloud architecture, and building production AI systems.
                </p>
            </header>

            {/* Blog Posts */}
            <section className="max-w-[672px] mx-auto px-6">
                <div className="space-y-0">
                    {posts.map((blog, index) => (
                        <article key={blog.slug}>
                            <Link
                                href={`/blogs/${blog.slug}`}
                                className="block group py-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                                    <h2 className="text-[15px] sm:text-base font-semibold text-foreground group-hover:text-muted-foreground transition-colors leading-snug">
                                        {blog.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground flex-shrink-0">
                                        <span className="tabular-nums">{blog.date}</span>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                </div>
                                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 max-w-[540px]">
                                    {blog.excerpt}
                                </p>
                            </Link>
                            {index < posts.length - 1 && (
                                <div className="border-b border-border/50" />
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
