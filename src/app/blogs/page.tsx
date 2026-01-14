import Link from "next/link"
import Image from "next/image"
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
            <header className="py-16 sm:py-24">
                <div className="max-w-[720px] mx-auto px-6">
                    <h1 className="text-[40px] sm:text-[48px] font-bold text-foreground tracking-tight leading-[1.1]">
                        Blogs
                    </h1>
                    <p className="mt-4 text-[18px] sm:text-[20px] text-muted-foreground leading-relaxed max-w-[560px]">
                        Thoughts on machine learning, cloud architecture, and building production AI systems.
                    </p>
                </div>
            </header>

            <section className="max-w-[720px] mx-auto px-6">
                <div className="space-y-1">
                    {posts.map((blog, index) => (
                        <article 
                            key={blog.slug} 
                            className="group"
                        >
                            <Link 
                                href={`/blogs/${blog.slug}`} 
                                className="block py-8 -mx-4 px-4 rounded-xl transition-all duration-300 hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-2.5 mb-4">
                                    <Image
                                        src={personalInfo.profileImage}
                                        alt={personalInfo.name}
                                        width={20}
                                        height={20}
                                        className="rounded-full ring-1 ring-border"
                                    />
                                    <span className="text-[13px] text-muted-foreground font-medium">
                                        {personalInfo.name}
                                    </span>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="text-[13px] text-muted-foreground">
                                        {blog.date}
                                    </span>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-[20px] sm:text-[22px] font-bold text-foreground leading-snug tracking-[-0.02em] group-hover:text-foreground/80 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h2>

                                        <p className="mt-2 text-[15px] sm:text-[16px] text-muted-foreground leading-relaxed line-clamp-2">
                                            {blog.excerpt}
                                        </p>

                                        <div className="mt-4 flex items-center gap-4">
                                            <span className="text-[13px] text-muted-foreground/70 flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {blog.readTime}
                                            </span>
                                            
                                            <span className="text-[13px] text-muted-foreground/70 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                Read more
                                                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
