"use client"

import { useState, useEffect, useTransition } from "react"
import { addLike, removeLike } from "@/app/actions/blog-actions"

interface LikeButtonProps {
    slug: string
    initialLikes: number
}

export function LikeButton({ slug, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [hasLiked, setHasLiked] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Check if user has already liked this post (using localStorage)
    useEffect(() => {
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}")
        setHasLiked(!!likedPosts[slug])
    }, [slug])

    const handleClick = () => {
        startTransition(async () => {
            const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}")

            if (hasLiked) {
                // Unlike
                const newCount = await removeLike(slug)
                setLikes(newCount)
                setHasLiked(false)
                delete likedPosts[slug]
            } else {
                // Like
                const newCount = await addLike(slug)
                setLikes(newCount)
                setHasLiked(true)
                likedPosts[slug] = true
            }

            localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
        })
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-lg
                text-[13px] font-medium transition-all duration-200
                border
                ${
                    hasLiked
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"
                        : "bg-muted/40 dark:bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
                }
                ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
            aria-label={hasLiked ? "Unlike this post" : "Like this post"}
        >
            <svg
                className={`w-4 h-4 transition-transform duration-200 ${isPending ? "scale-90" : ""} ${hasLiked ? "fill-current" : ""}`}
                fill={hasLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={hasLiked ? 0 : 1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
            </svg>
            <span className="tabular-nums">{likes}</span>
        </button>
    )
}
