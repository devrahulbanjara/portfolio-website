import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface BlogPost {
    slug: string
    title: string
    date: string
    excerpt: string
    readTime: string
    keywords?: string[]
    tags?: string[]
    category?: string
    content?: string
}

/**
 * Get all blog posts with metadata
 * Automatically reads from content/blogs directory
 */
export function getAllBlogPosts(): BlogPost[] {
    const blogsDirectory = path.join(process.cwd(), "content/blogs")

    if (!fs.existsSync(blogsDirectory)) {
        return []
    }

    const filenames = fs.readdirSync(blogsDirectory)
    const posts = filenames
        .filter(filename => filename.endsWith(".md") && filename !== "README.md")
        .map(filename => {
            const slug = filename.replace(".md", "")
            const fullPath = path.join(blogsDirectory, filename)
            const fileContents = fs.readFileSync(fullPath, "utf8")
            const { data } = matter(fileContents)

            return {
                slug,
                title: data.title || "",
                date: data.date || "",
                excerpt: data.excerpt || "",
                readTime: data.readTime || "",
                keywords: data.keywords || [],
                tags: data.tags || [],
                category: data.category || "",
            }
        })

    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get a single blog post by slug
 */
export function getBlogPost(slug: string): BlogPost | null {
    const blogsDirectory = path.join(process.cwd(), "content/blogs")
    const fullPath = path.join(blogsDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
        return null
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return {
        slug,
        title: data.title || "",
        date: data.date || "",
        excerpt: data.excerpt || "",
        readTime: data.readTime || "",
        keywords: data.keywords || [],
        tags: data.tags || [],
        category: data.category || "",
        content,
    }
}

/**
 * Get all blog slugs for static generation
 */
export function getAllBlogSlugs(): string[] {
    const blogsDirectory = path.join(process.cwd(), "content/blogs")

    if (!fs.existsSync(blogsDirectory)) {
        return []
    }

    const filenames = fs.readdirSync(blogsDirectory)
    return filenames
        .filter(filename => filename.endsWith(".md") && filename !== "README.md")
        .map(filename => filename.replace(".md", ""))
}

/**
 * Get related blog posts based on keywords/tags/category
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
    const currentPost = getBlogPost(currentSlug)
    if (!currentPost) return []

    const allPosts = getAllBlogPosts()
    const relatedPosts = allPosts
        .filter(post => post.slug !== currentSlug)
        .map(post => {
            let score = 0

            // Score based on shared keywords
            if (currentPost.keywords && post.keywords) {
                const sharedKeywords = currentPost.keywords.filter(kw =>
                    post.keywords?.includes(kw)
                )
                score += sharedKeywords.length * 3
            }

            // Score based on shared tags
            if (currentPost.tags && post.tags) {
                const sharedTags = currentPost.tags.filter(tag => post.tags?.includes(tag))
                score += sharedTags.length * 2
            }

            // Score based on category match
            if (currentPost.category && post.category === currentPost.category) {
                score += 5
            }

            return { post, score }
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ post }) => post)

    return relatedPosts
}
