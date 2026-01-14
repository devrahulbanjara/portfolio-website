import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { notFound } from "next/navigation"
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog-utils"
import { personalInfo } from "@/data/portfolio-data"
import { ReadingProgress } from "@/components/reading-progress"
import { CopyButton } from "@/components/copy-button"

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-[22px] sm:text-[24px] font-sans font-bold text-foreground mt-11 mb-[18px] leading-tight tracking-[-0.02em]">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-[19px] sm:text-[20px] font-sans font-bold text-foreground mt-9 mb-[14px] leading-snug tracking-[-0.02em]">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-[17px] sm:text-[18px] font-sans font-semibold text-foreground mt-7 mb-[10px] leading-snug">
            {children}
        </h3>
    ),
    p: ({ children, node }) => {
        const hasImage = node?.children?.some(
            (child: any) => child.tagName === 'img' || child.type === 'element' && child.tagName === 'img'
        )
        if (hasImage) {
            return <>{children}</>
        }
        return (
            <p className="text-[15px] sm:text-[17px] text-foreground/90 leading-[1.75] mb-[22px]">
                {children}
            </p>
        )
    },
    img: ({ src, alt }) => {
        if (!src || typeof src !== 'string') return null
        return (
            <figure className="my-7 -mx-4 sm:mx-0">
                <div className="overflow-hidden rounded-lg sm:rounded-xl">
                    <Image
                        src={src}
                        alt={alt || "Blog image"}
                        width={800}
                        height={450}
                        className="w-full h-auto transition-transform duration-500 hover:scale-[1.02]"
                        style={{ maxWidth: "100%", height: "auto" }}
                    />
                </div>
                {alt && (
                    <figcaption className="text-center text-[13px] text-muted-foreground mt-3.5 font-sans">
                        {alt}
                    </figcaption>
                )}
            </figure>
        )
    },
    blockquote: ({ children }) => (
        <blockquote className="my-7 py-[6px] border-l-[2px] border-foreground pl-[18px] sm:pl-7">
            <div className="text-[15px] sm:text-[18px] text-foreground/80 leading-[1.6] italic">
                {children}
            </div>
        </blockquote>
    ),
    pre: ({ children }) => {
        const extractCodeString = (node: any): string => {
            if (typeof node === 'string') {
                return node
            }
            if (typeof node === 'number') {
                return String(node)
            }
            if (React.isValidElement(node)) {
                if (node.type === 'code') {
                    return extractCodeString(node.props.children)
                }
                if (node.props?.children) {
                    return extractCodeString(node.props.children)
                }
            }
            if (Array.isArray(node)) {
                return node.map(extractCodeString).join('')
            }
            return ''
        }

        const codeString = extractCodeString(children)

        return (
            <div className="relative my-[22px] -mx-4 sm:mx-0 group">
                <pre className="bg-[#0d1117] text-[13px] sm:text-[14px] rounded-none sm:rounded-lg p-[18px] overflow-x-auto font-mono border border-border/10">
                    {children}
                </pre>
                <CopyButton code={codeString} />
            </div>
        )
    },
    code: ({ children, className }) => {
        if (className) {
            return <code className={className}>{children}</code>
        }
        return (
            <code className="bg-muted/80 text-foreground px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-border/50">
                {children}
            </code>
        )
    },
    ul: ({ children }) => (
        <ul className="text-[15px] sm:text-[17px] text-foreground/90 leading-[1.75] mb-[22px] pl-[22px] space-y-[10px] list-disc marker:text-muted-foreground">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="text-[15px] sm:text-[17px] text-foreground/90 leading-[1.75] mb-[22px] pl-[22px] space-y-[10px] list-decimal marker:text-muted-foreground">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="pl-[6px]">{children}</li>
    ),
    table: ({ children }) => (
        <div className="my-[22px] -mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full text-[14px] sm:text-[15px] font-sans">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="border-b-2 border-foreground/20 text-left">{children}</thead>
    ),
    th: ({ children }) => (
        <th className="py-[10px] px-[14px] font-semibold text-foreground tracking-tight">
            {children}
        </th>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-border/50">{children}</tbody>
    ),
    td: ({ children }) => (
        <td className="py-[10px] px-[14px] text-foreground/80">{children}</td>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-foreground underline decoration-foreground/30 decoration-1 underline-offset-[3px] hover:decoration-foreground/60 transition-all duration-200"
        >
            {children}
        </a>
    ),
    strong: ({ children }) => (
        <strong className="font-bold text-foreground">{children}</strong>
    ),
    hr: () => (
        <div className="my-9 flex justify-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        </div>
    ),
}

export async function generateStaticParams() {
    const slugs = getAllBlogSlugs()
    return slugs.map((slug) => ({ slug }))
}

async function getBlogPostData(slug: string) {
    return getBlogPost(slug)
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const resolvedParams = await params
    const post = await getBlogPostData(resolvedParams.slug)

    if (!post) {
        return { title: "Post Not Found" }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"
    const url = `${siteUrl}/blogs/${post.slug}`
    const publishedTime = new Date(post.date).toISOString()

    return {
        title: `${post.title} | ${personalInfo.name}`,
        description: post.excerpt,
        authors: [{ name: personalInfo.name }],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url,
            siteName: personalInfo.name,
            type: "article",
            publishedTime,
            authors: [personalInfo.name],
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            creator: `@${personalInfo.name.replace(/\s+/g, "")}`,
        },
        alternates: { canonical: url },
        other: {
            "article:published_time": publishedTime,
            "article:author": personalInfo.name,
        },
    }
}

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const resolvedParams = await params
    const post = await getBlogPostData(resolvedParams.slug)

    if (!post || !post.content) {
        notFound()
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"
    const publishedTime = new Date(post.date).getTime()

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: `${siteUrl}/banner.png`,
        datePublished: new Date(post.date).toISOString(),
        dateModified: new Date(publishedTime).toISOString(),
        author: {
            "@type": "Person",
            name: personalInfo.name,
            url: siteUrl,
        },
        publisher: {
            "@type": "Person",
            name: personalInfo.name,
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${siteUrl}/blogs/${post.slug}`,
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ReadingProgress />

            <article className="min-h-screen" itemScope itemType="https://schema.org/BlogPosting">
                <header className="max-w-[748px] mx-auto px-[26px] pt-9 sm:pt-[72px] pb-9">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 mb-9 group"
                    >
                        <svg 
                            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        All posts
                    </Link>

                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground mb-4.5">
                        <time dateTime={new Date(post.date).toISOString()} itemProp="datePublished">
                            {post.date}
                        </time>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.readTime}
                        </span>
                    </div>

                    <h1
                        className="text-[26px] sm:text-[31px] lg:text-[35px] font-sans font-bold text-foreground leading-[1.2] tracking-[-0.02em]"
                        itemProp="headline"
                    >
                        {post.title}
                    </h1>

                    <p className="mt-[18px] text-[15px] sm:text-[18px] text-muted-foreground leading-relaxed">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3.5 mt-7 pt-7 border-t border-border/50">
                        <Image
                            src={personalInfo.profileImage}
                            alt={personalInfo.name}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-background shadow-md"
                        />
                        <div>
                            <p className="text-[14px] font-semibold text-foreground">
                                {personalInfo.name}
                            </p>
                            <p className="text-[13px] text-muted-foreground">
                                {personalInfo.role}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="max-w-[748px] mx-auto px-[26px] pb-[52px]" itemProp="articleBody">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={markdownComponents}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <footer className="max-w-[748px] mx-auto px-[26px] pb-[72px]">
                    <div className="flex justify-center gap-2 mb-9">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    </div>

                    <div className="bg-muted/30 rounded-xl p-[22px] sm:p-7">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                            Written by
                        </p>
                        <p className="text-[17px] sm:text-[18px] font-bold text-foreground">
                            {personalInfo.name}
                        </p>
                        <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                            {personalInfo.role}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <a
                                href="https://linkedin.com/in/devrahulbanjara"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[13px] text-foreground hover:text-muted-foreground transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href={`mailto:${personalInfo.email}`}
                                className="inline-flex items-center gap-2 text-[13px] text-foreground hover:text-muted-foreground transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Email
                            </a>
                        </div>
                    </div>

                    <div className="mt-7 pt-7 border-t border-border/50">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-[14px] text-foreground hover:text-muted-foreground transition-colors group"
                        >
                            <svg 
                                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={1.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to all posts
                        </Link>
                    </div>
                </footer>
            </article>
        </>
    )
}
