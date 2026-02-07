"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { navLinks } from "@/data/portfolio-data"
import { cn } from "@/lib/utils"

export function Navigation() {
    const pathname = usePathname()
    const isActive = (path: string) => {
        if (path === "/") return pathname === "/"
        return pathname.startsWith(path)
    }

    return (
        <nav className="max-w-[672px] mx-auto flex justify-between items-center py-5 px-6">
            <Link
                href="/"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors duration-200"
            >
                Rahul
            </Link>
            <div className="flex gap-5 items-center">
                <Link
                    href="/"
                    className={cn(
                        "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200",
                        isActive("/") && pathname === "/" && "text-foreground"
                    )}
                >
                    Home
                </Link>
                <Link
                    href="/projects"
                    className={cn(
                        "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200",
                        isActive("/projects") && "text-foreground"
                    )}
                >
                    Projects
                </Link>
                <Link
                    href="/blogs"
                    className={cn(
                        "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200",
                        isActive("/blogs") && "text-foreground"
                    )}
                >
                    Blogs
                </Link>
                <div className="w-px h-4 bg-border" />
                {navLinks
                    .filter(link => link.external)
                    .map(link => (
                        <Link
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                <ThemeToggle />
            </div>
        </nav>
    )
}
