import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { notFound } from "next/navigation"
import { getBlogPost, getAllBlogSlugs, getRelatedPosts } from "@/lib/blog-utils"
import { personalInfo } from "@/data/portfolio-data"
import { ReadingProgress } from "@/components/reading-progress"
import { CopyButton } from "@/components/copy-button"
import { FAQSchema } from "@/components/faq-schema"
import { HowToSchema } from "@/components/howto-schema"
import { LikeButton } from "@/components/like-button"
import { Comments } from "@/components/comments"
import { getLikes, getComments } from "@/app/actions/blog-actions"

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-[20px] sm:text-[22px] font-sans font-bold text-foreground mt-10 mb-4 leading-tight tracking-[-0.02em]">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-[18px] sm:text-[19px] font-sans font-bold text-foreground mt-8 mb-3 leading-snug tracking-[-0.01em]">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-[16px] sm:text-[17px] font-sans font-semibold text-foreground mt-6 mb-2.5 leading-snug">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-[15px] sm:text-[16px] font-sans font-semibold text-foreground mt-5 mb-2 leading-snug">
            {children}
        </h4>
    ),
    p: ({ children, node }) => {
        const hasImage = node?.children?.some(
            (child: any) =>
                child.tagName === "img" || (child.type === "element" && child.tagName === "img")
        )
        if (hasImage) {
            return <>{children}</>
        }
        return (
            <p className="text-[15px] sm:text-[16px] text-foreground/85 leading-[1.8] mb-5">
                {children}
            </p>
        )
    },
    img: ({ src, alt }) => {
        if (!src || typeof src !== "string") return null
        return (
            <figure className="my-6 -mx-4 sm:mx-0">
                <div className="overflow-hidden rounded-lg border border-border/30">
                    <Image
                        src={src}
                        alt={alt || "Blog image"}
                        width={800}
                        height={450}
                        className="w-full h-auto"
                        style={{ maxWidth: "100%", height: "auto" }}
                    />
                </div>
                {alt && alt !== "Blog image" && (
                    <figcaption className="text-center text-[13px] text-muted-foreground mt-3 font-sans">
                        {alt}
                    </figcaption>
                )}
            </figure>
        )
    },
    blockquote: ({ children }) => (
        <blockquote className="my-6 py-1 border-l-[2px] border-foreground/30 pl-5">
            <div className="text-[15px] sm:text-[16px] text-foreground/75 leading-[1.7] italic [&>p]:mb-0">
                {children}
            </div>
        </blockquote>
    ),
    pre: ({ children }) => {
        const extractCodeString = (node: any): string => {
            if (typeof node === "string") {
                return node
            }
            if (typeof node === "number") {
                return String(node)
            }
            if (React.isValidElement(node)) {
                const props = node.props as { children?: any }
                if (node.type === "code") {
                    return extractCodeString(props.children)
                }
                if (props?.children) {
                    return extractCodeString(props.children)
                }
            }
            if (Array.isArray(node)) {
                return node.map(extractCodeString).join("")
            }
            return ""
        }

        const codeString = extractCodeString(children)

        return (
            <div className="relative my-5 -mx-4 sm:mx-0 group">
                <pre className="bg-[#0d1117] text-[13px] sm:text-[13.5px] rounded-none sm:rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
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
            <code className="bg-muted/70 dark:bg-muted/50 text-foreground px-1.5 py-0.5 rounded text-[0.88em] font-mono">
                {children}
            </code>
        )
    },
    ul: ({ children }) => (
        <ul className="text-[15px] sm:text-[16px] text-foreground/85 leading-[1.8] mb-5 pl-5 space-y-2 list-disc marker:text-muted-foreground/60">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="text-[15px] sm:text-[16px] text-foreground/85 leading-[1.8] mb-5 pl-5 space-y-2 list-decimal marker:text-muted-foreground/60">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    table: ({ children }) => (
        <div className="my-5 -mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full text-[14px] sm:text-[14.5px] font-sans border-collapse">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="border-b border-border text-left bg-muted/30 dark:bg-muted/20">
            {children}
        </thead>
    ),
    th: ({ children }) => (
        <th className="py-2.5 px-3 font-semibold text-foreground text-[13px] uppercase tracking-wide">
            {children}
        </th>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
    td: ({ children }) => <td className="py-2.5 px-3 text-foreground/80">{children}</td>,
    a: ({ href, children }) => (
        <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-foreground underline decoration-foreground/25 decoration-1 underline-offset-[3px] hover:decoration-foreground/50 transition-colors duration-150"
        >
            {children}
        </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
    hr: () => (
        <div className="my-8 flex justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        </div>
    ),
}

export async function generateStaticParams() {
    const slugs = getAllBlogSlugs()
    return slugs.map(slug => ({ slug }))
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rahuldevbanjara.com.np"
    const url = `${siteUrl}/blogs/${post.slug}`
    const publishedTime = new Date(post.date).toISOString()
    const keywords = post.keywords?.join(", ") || ""
    const tags = post.tags || []
    const category = post.category || ""

    // Enhanced description with keywords
    const enhancedDescription =
        post.excerpt.length > 155 ? post.excerpt.substring(0, 152) + "..." : post.excerpt

    return {
        title: `${post.title} | ${personalInfo.name}`,
        description: enhancedDescription,
        keywords: keywords || undefined,
        authors: [{ name: personalInfo.name }],
        openGraph: {
            title: post.title,
            description: enhancedDescription,
            url,
            siteName: personalInfo.name,
            type: "article",
            publishedTime,
            authors: [personalInfo.name],
            locale: "en_US",
            ...(tags.length > 0 && { tags }),
            ...(category && { section: category }),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: enhancedDescription,
            creator: `@${personalInfo.name.replace(/\s+/g, "")}`,
        },
        alternates: { canonical: url },
        other: {
            "article:published_time": publishedTime,
            "article:author": personalInfo.name,
            ...(category && { "article:section": category }),
            ...(tags.length > 0 && { "article:tag": tags.join(", ") }),
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rahuldevbanjara.com.np"
    const publishedTime = new Date(post.date).getTime()
    const relatedPosts = getRelatedPosts(post.slug, 3)

    // Fetch likes and comments
    const [initialLikes, initialComments] = await Promise.all([
        getLikes(post.slug),
        getComments(post.slug),
    ])

    // Add FAQ schema for tutorial posts
    const shouldShowFAQ = post.tags?.includes("Tutorial") || post.category?.includes("Tutorial")
    const faqData = shouldShowFAQ
        ? [
              {
                  question:
                      "How long does it take to build a YouTube assistant with Amazon Bedrock?",
                  answer: "Following this tutorial, you can build a basic YouTube assistant in about 30 minutes. This includes setting up AWS credentials, installing dependencies, and implementing the core functionality.",
              },
              {
                  question: "What AWS services do I need for this YouTube assistant?",
                  answer: "You need Amazon Bedrock for the AI model (Claude Sonnet), and optionally AWS Lambda and API Gateway for serverless deployment. Basic AWS account with Bedrock access is required.",
              },
              {
                  question: "Can I use other AI models besides Claude Sonnet?",
                  answer: "Yes, you can experiment with other models available in Amazon Bedrock such as Claude Haiku for faster responses or Amazon Titan for text embeddings, depending on your specific use case.",
              },
          ]
        : []

    // Add HowTo schema for step-by-step tutorials
    const shouldShowHowTo =
        post.title.toLowerCase().includes("tutorial") || post.title.toLowerCase().includes("guide")
    const howToSteps = shouldShowHowTo
        ? [
              {
                  name: "Environment Configuration",
                  text: "Set up AWS credentials using either .env file for local development or aws configure for production standard.",
              },
              {
                  name: "Install Dependencies",
                  text: "Install required Python packages including Strands Agents SDK, YouTube Transcript API, and python-dotenv.",
              },
              {
                  name: "Implement Tools",
                  text: "Create three tools: fetch_transcript_tool for getting YouTube transcripts, summarize_tool for generating summaries, and qa_tool for answering questions.",
              },
              {
                  name: "Initialize Agent",
                  text: "Create a Strands Agent with the implemented tools and configure it to use Amazon Bedrock's Claude Sonnet model.",
              },
              {
                  name: "Run and Test",
                  text: "Execute the script, input a YouTube URL, get a summary, and engage in Q&A about the video content.",
              },
          ]
        : []

    // Enhanced BlogPosting schema
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
        ...(post.keywords &&
            post.keywords.length > 0 && {
                keywords: post.keywords.join(", "),
            }),
        ...(post.tags &&
            post.tags.length > 0 && {
                articleSection: post.category || "Technology",
                keywords: [...(post.keywords || []), ...post.tags].join(", "),
            }),
        ...(post.category && {
            articleSection: post.category,
        }),
        timeRequired: post.readTime,
        inLanguage: "en-US",
    }

    // Breadcrumb schema
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: `${siteUrl}/blogs`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${siteUrl}/blogs/${post.slug}`,
            },
        ],
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {shouldShowFAQ && faqData.length > 0 && <FAQSchema faqs={faqData} title={post.title} />}
            {shouldShowHowTo && howToSteps.length > 0 && (
                <HowToSchema
                    title={post.title}
                    description={post.excerpt}
                    steps={howToSteps}
                    totalTime="PT30M"
                />
            )}

            <ReadingProgress />

            <article className="min-h-screen" itemScope itemType="https://schema.org/BlogPosting">
                <header className="max-w-[672px] mx-auto px-6 pt-8 sm:pt-16 pb-8">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8 group"
                    >
                        <svg
                            className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                        All posts
                    </Link>

                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-4">
                        <time
                            dateTime={new Date(post.date).toISOString()}
                            itemProp="datePublished"
                            className="tabular-nums"
                        >
                            {post.date}
                        </time>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{post.readTime}</span>
                    </div>

                    <h1
                        className="text-[24px] sm:text-[28px] lg:text-[32px] font-sans font-bold text-foreground leading-[1.2] tracking-[-0.02em]"
                        itemProp="headline"
                    >
                        {post.title}
                    </h1>

                    <p className="mt-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-[580px]">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
                        <Image
                            src={personalInfo.profileImage}
                            alt={personalInfo.name}
                            width={36}
                            height={36}
                            className="rounded-full ring-1 ring-border"
                        />
                        <div>
                            <p className="text-[14px] font-medium text-foreground">
                                {personalInfo.name}
                            </p>
                            <p className="text-[12px] text-muted-foreground">{personalInfo.role}</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-[672px] mx-auto px-6 pb-12" itemProp="articleBody">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={markdownComponents}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Engagement Section - Likes & Comments */}
                <section className="max-w-[672px] mx-auto px-6 pb-12">
                    {/* Like Button */}
                    <div className="flex items-center gap-4 pb-8 border-b border-border/50">
                        <LikeButton slug={post.slug} initialLikes={initialLikes} />
                        <span className="text-[13px] text-muted-foreground">
                            Found this helpful? Give it a like!
                        </span>
                    </div>

                    {/* Comments Section */}
                    <div className="pt-8">
                        <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-6">
                            Comments
                        </h2>
                        <Comments slug={post.slug} initialComments={initialComments} />
                    </div>
                </section>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <section className="bg-muted/40 dark:bg-muted/25 py-12">
                        <div className="max-w-[672px] mx-auto px-6">
                            <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-6">
                                Related Posts
                            </h2>
                            <div className="space-y-4">
                                {relatedPosts.map(relatedPost => (
                                    <Link
                                        key={relatedPost.slug}
                                        href={`/blogs/${relatedPost.slug}`}
                                        className="group block"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                                            <h3 className="text-[15px] font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                                                {relatedPost.title}
                                            </h3>
                                            <span className="text-[13px] text-muted-foreground tabular-nums flex-shrink-0">
                                                {relatedPost.date}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-muted-foreground line-clamp-1">
                                            {relatedPost.excerpt}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <footer className="max-w-[672px] mx-auto px-6 pb-16">
                    <div className="flex justify-center gap-2 mb-8">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    </div>

                    <div className="bg-muted/40 dark:bg-muted/30 rounded-lg p-5 sm:p-6">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                            Written by
                        </p>
                        <p className="text-base font-semibold text-foreground">
                            {personalInfo.name}
                        </p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            {personalInfo.role}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <a
                                href="https://linkedin.com/in/devrahulbanjara"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href={`mailto:${personalInfo.email}`}
                                className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                                Email
                            </a>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/50">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <svg
                                className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                />
                            </svg>
                            Back to all posts
                        </Link>
                    </div>
                </footer>
            </article>
        </>
    )
}
