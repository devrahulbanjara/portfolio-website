import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface BlogPost {
    slug: string
    title: string
    date: string
    excerpt: string
    readTime: string
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
        .filter((filename) => filename.endsWith(".md") && filename !== "README.md")
        .map((filename) => {
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
            }
        })

    // Sort by date (newest first)
    return posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
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
        .filter((filename) => filename.endsWith(".md") && filename !== "README.md")
        .map((filename) => filename.replace(".md", ""))
}
