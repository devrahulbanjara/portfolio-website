"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { navLinks } from "@/data/portfolio-data"
import { cn } from "@/lib/utils"

export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="flex justify-end items-center py-4 px-6">
            <div className="flex gap-6 items-center">
                <Link
                    href="/"
                    className={cn(
                        "text-muted-foreground cursor-pointer hover:text-foreground duration-300 transition-colors",
                        pathname === "/" && "text-foreground"
                    )}
                >
                    Home
                </Link>
                <Link
                    href="/projects"
                    className={cn(
                        "text-muted-foreground cursor-pointer hover:text-foreground duration-300 transition-colors",
                        pathname === "/projects" && "text-foreground"
                    )}
                >
                    Projects
                </Link>
                <Link
                    href="/blogs"
                    className={cn(
                        "text-muted-foreground cursor-pointer hover:text-foreground duration-300 transition-colors",
                        pathname === "/blogs" && "text-foreground"
                    )}
                >
                    Blogs
                </Link>
                {navLinks
                    .filter((link) => link.external)
                    .map((link) => (
                        <Link
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground cursor-pointer hover:text-foreground duration-300 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                <ThemeToggle />
            </div>
        </nav>
    )
}
