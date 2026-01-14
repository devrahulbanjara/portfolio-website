"use client"

import { useState } from "react"

interface CopyButtonProps {
    code: string
}

export function CopyButton({ code }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy code:", err)
        }
    }

    return (
        <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-2 rounded-md bg-[#161b22]/80 hover:bg-[#21262d] backdrop-blur-sm border border-[#30363d]/50 hover:border-[#30363d] text-[#c9d1d9] hover:text-[#58a6ff] transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            title={copied ? "Copied!" : "Copy code"}
            aria-label="Copy code to clipboard"
        >
            {copied ? (
                <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            ) : (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            )}
        </button>
    )
}
