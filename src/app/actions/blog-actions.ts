"use server"

import { redis } from "@/lib/redis"
import { revalidatePath } from "next/cache"

export interface Comment {
    id: string
    text: string
    author: string
    createdAt: number
}

// Get likes count for a blog post
export async function getLikes(slug: string): Promise<number> {
    try {
        const likes = await redis.get<number>(`likes:${slug}`)
        return likes || 0
    } catch {
        return 0
    }
}

// Add a like to a blog post
export async function addLike(slug: string): Promise<number> {
    try {
        const newCount = await redis.incr(`likes:${slug}`)
        revalidatePath(`/blogs/${slug}`)
        return newCount
    } catch {
        return 0
    }
}

// Remove a like from a blog post
export async function removeLike(slug: string): Promise<number> {
    try {
        const current = await redis.get<number>(`likes:${slug}`)
        if (current && current > 0) {
            const newCount = await redis.decr(`likes:${slug}`)
            revalidatePath(`/blogs/${slug}`)
            return newCount
        }
        return current || 0
    } catch {
        return 0
    }
}

// Get all comments for a blog post
export async function getComments(slug: string): Promise<Comment[]> {
    try {
        const comments = await redis.lrange<Comment>(`comments:${slug}`, 0, -1)
        return comments || []
    } catch {
        return []
    }
}

// Add a comment to a blog post
export async function addComment(
    slug: string,
    text: string,
    author: string
): Promise<Comment | null> {
    try {
        const trimmedText = text.trim()
        const trimmedAuthor = author.trim() || "Anonymous"
        
        if (!trimmedText || trimmedText.length > 1000) {
            return null
        }
        
        const newComment: Comment = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: trimmedText,
            author: trimmedAuthor.slice(0, 50), // Limit author name length
            createdAt: Date.now(),
        }
        
        // Add to the beginning of the list (newest first)
        await redis.lpush(`comments:${slug}`, newComment)
        revalidatePath(`/blogs/${slug}`)
        
        return newComment
    } catch {
        return null
    }
}
