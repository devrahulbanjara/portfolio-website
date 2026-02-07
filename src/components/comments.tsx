"use client"

import { useState, useTransition } from "react"
import { addComment, type Comment } from "@/app/actions/blog-actions"

interface CommentsProps {
    slug: string
    initialComments: Comment[]
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
}

export function Comments({ slug, initialComments }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [author, setAuthor] = useState("")
    const [text, setText] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!text.trim()) {
            setError("Please enter a comment")
            return
        }

        if (text.length > 1000) {
            setError("Comment is too long (max 1000 characters)")
            return
        }

        startTransition(async () => {
            const newComment = await addComment(slug, text, author)
            
            if (newComment) {
                setComments([newComment, ...comments])
                setText("")
                // Keep the author name for convenience
            } else {
                setError("Failed to post comment. Please try again.")
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        maxLength={50}
                        className="flex-1 px-3 py-2 text-[14px] bg-background border border-border/60 rounded-lg
                            placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/10
                            transition-all duration-200"
                    />
                </div>
                <textarea
                    placeholder="Write a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="w-full px-3 py-2 text-[14px] bg-background border border-border/60 rounded-lg
                        placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/10
                        transition-all duration-200 resize-none"
                />
                {error && (
                    <p className="text-[13px] text-red-500">{error}</p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground/60">
                        {text.length}/1000
                    </span>
                    <button
                        type="submit"
                        disabled={isPending || !text.trim()}
                        className={`
                            px-4 py-2 text-[13px] font-medium rounded-lg
                            bg-foreground text-background
                            transition-all duration-200
                            ${isPending || !text.trim() 
                                ? "opacity-50 cursor-not-allowed" 
                                : "hover:opacity-90 cursor-pointer"
                            }
                        `}
                    >
                        {isPending ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {comments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <p className="text-[13px] text-muted-foreground">
                        {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </p>
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="p-4 bg-muted/30 dark:bg-muted/20 rounded-lg"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center">
                                        <span className="text-[11px] font-medium text-muted-foreground uppercase">
                                            {comment.author.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="text-[13px] font-medium text-foreground">
                                        {comment.author}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground/60">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-[14px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {comments.length === 0 && (
                <p className="text-[14px] text-muted-foreground/60 text-center py-4">
                    No comments yet. Be the first to share your thoughts!
                </p>
            )}
        </div>
    )
}
