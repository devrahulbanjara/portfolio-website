import fs from "fs"
import path from "path"
import Link from "next/link"
import matter from "gray-matter"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
    const blogsDirectory = path.join(process.cwd(), "content/blogs")

    if (!fs.existsSync(blogsDirectory)) {
        return []
    }

    const filenames = fs.readdirSync(blogsDirectory)

    return filenames
        .filter((filename) => filename.endsWith(".md"))
        .map((filename) => ({
            slug: filename.replace(".md", ""),
        }))
}

async function getBlogPost(slug: string) {
    const blogsDirectory = path.join(process.cwd(), "content/blogs")
    const fullPath = path.join(blogsDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
        return null
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return { data, content }
}

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const resolvedParams = await params
    const post = await getBlogPost(resolvedParams.slug)

    if (!post) {
        notFound()
    }

    const { data, content } = post

    return (
        <main className="max-w-2xl mx-auto flex flex-col px-6 pt-0 sm:pt-20 pb-20">
            <Link
                href="/blogs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-flex items-center gap-1"
            >
                ← Back to posts
            </Link>

            <article>
                <h1 className="text-2xl font-medium text-foreground mb-2">
                    {data.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <time>{data.date}</time>
                    <span>•</span>
                    <span>{data.readTime}</span>
                </div>

                <div className="prose">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </article>
        </main>
    )
}
