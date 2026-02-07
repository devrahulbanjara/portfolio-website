import Link from "next/link"
import type { Metadata } from "next"
import { projects, personalInfo } from "@/data/portfolio-data"

export const metadata: Metadata = {
    title: `Projects | ${personalInfo.name}`,
    description: `A collection of ML systems, AI tools, and open-source projects by ${personalInfo.name}.`,
    openGraph: {
        title: `Projects | ${personalInfo.name}`,
        description: `A collection of ML systems, AI tools, and open-source projects by ${personalInfo.name}.`,
        type: "website",
    },
}

export default function ProjectsPage() {
    const featuredProjects = projects.filter(p => p.featured)
    const otherProjects = projects.filter(p => !p.featured)

    return (
        <main className="min-h-screen pb-24">
            {/* Header */}
            <header className="max-w-[672px] mx-auto px-6 pt-8 sm:pt-20 pb-12">
                <h1 className="text-[32px] sm:text-[38px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
                    Projects
                </h1>
                <p className="mt-3 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-[520px]">
                    A collection of things I've built, from production ML systems to open-source
                    tools.
                </p>
            </header>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
                <section className="max-w-[672px] mx-auto px-6 mb-12">
                    <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-6">
                        Featured
                    </h2>
                    <div className="space-y-8">
                        {featuredProjects.map(project => (
                            <div key={project.id} className="space-y-2.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="text-base font-semibold text-foreground">
                                        {project.url ? (
                                            <Link
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-muted-foreground transition-colors"
                                            >
                                                {project.title}
                                            </Link>
                                        ) : (
                                            project.title
                                        )}
                                    </h3>
                                    {project.inProgress && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 rounded border border-border/50">
                                            <span className="w-1 h-1 bg-foreground/60 rounded-full animate-pulse"></span>
                                            In Progress
                                        </span>
                                    )}
                                    {project.githubUrl && (
                                        <Link
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            title="View on GitHub"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-[14px] leading-relaxed">
                                    {project.description}
                                </p>
                                <ul className="space-y-1.5 text-muted-foreground text-[14px] leading-relaxed pt-1">
                                    {project.details.map((detail, i) => (
                                        <li key={i} className="flex gap-2.5">
                                            <span className="text-muted-foreground/60 select-none">
                                                –
                                            </span>
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Other Projects */}
            {otherProjects.length > 0 && (
                <section className="bg-muted/40 dark:bg-muted/25 py-14">
                    <div className="max-w-[672px] mx-auto px-6">
                        <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-6">
                            Other Projects
                        </h2>
                        <div className="space-y-8">
                            {otherProjects.map(project => (
                                <div key={project.id} className="space-y-2.5">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-base font-semibold text-foreground">
                                            {project.url ? (
                                                <Link
                                                    href={project.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-muted-foreground transition-colors"
                                                >
                                                    {project.title}
                                                </Link>
                                            ) : (
                                                project.title
                                            )}
                                        </h3>
                                        {project.inProgress && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 rounded border border-border/50">
                                                <span className="w-1 h-1 bg-foreground/60 rounded-full animate-pulse"></span>
                                                In Progress
                                            </span>
                                        )}
                                        {project.githubUrl && (
                                            <Link
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                title="View on GitHub"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </Link>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-[14px] leading-relaxed">
                                        {project.description}
                                    </p>
                                    <ul className="space-y-1.5 text-muted-foreground text-[14px] leading-relaxed pt-1">
                                        {project.details.map((detail, i) => (
                                            <li key={i} className="flex gap-2.5">
                                                <span className="text-muted-foreground/60 select-none">
                                                    –
                                                </span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}
