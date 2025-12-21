import Link from "next/link"
import { blogPosts } from "@/data/blog-metadata"

export default function BlogsPage() {
    return (
        <main className="max-w-2xl mx-auto flex flex-col px-6 pt-0 sm:pt-20 pb-20">
            <h1 className="text-2xl font-medium text-foreground mb-8">All Posts</h1>

            <div className="space-y-8">
                {blogPosts.map((blog) => (
                    <Link
                        key={blog.slug}
                        href={`/blogs/${blog.slug}`}
                        className="block group"
                    >
                        <article className="space-y-2">
                            <h2 className="text-xl font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                                {blog.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <time>{blog.date}</time>
                                <span>•</span>
                                <span>{blog.readTime}</span>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {blog.excerpt}
                            </p>
                        </article>
                    </Link>
                ))}
            </div>
        </main>
    )
}
