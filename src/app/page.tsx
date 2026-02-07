import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    personalInfo,
    skills,
    workExperience,
    projects,
    education,
    certifications,
    activities,
} from "@/data/portfolio-data"
import { blogPosts } from "@/data/blog-metadata"

export default function Home() {
    const featuredProjects = projects.filter(p => p.featured)
    const latestBlogs = blogPosts().slice(0, 3)

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <section className="max-w-[672px] mx-auto px-6 pt-8 sm:pt-20">
                <div className="mb-12">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border mb-6">
                        <Image
                            src={personalInfo.profileImage}
                            alt={`${personalInfo.name}'s profile`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-[36px] sm:text-[42px] font-bold text-foreground leading-[1.15] tracking-[-0.02em]">
                            Hi, I&apos;m {personalInfo.name.split(" ")[0]}.
                        </h1>
                        <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-[540px]">
                            {personalInfo.role}
                        </p>
                        <div className="text-[15px] text-muted-foreground leading-[1.7] space-y-3 max-w-[560px]">
                            {personalInfo.bio.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <a
                                href={`mailto:${personalInfo.email}`}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                {personalInfo.email}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mb-14">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-muted/50 dark:bg-muted/40 border border-border/60">
                        <span className="text-[13px] text-muted-foreground">
                            Currently working on
                        </span>
                        <span className="text-[13px] font-semibold text-foreground">
                            {personalInfo.currentWork}
                        </span>
                    </div>
                </div>

                <div className="mb-14">
                    <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span
                                key={skill}
                                className="px-2.5 py-1 text-[13px] text-muted-foreground bg-muted/50 dark:bg-muted/40 rounded-md border border-border/50"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Work Experience */}
            <section className="bg-muted/40 dark:bg-muted/25 py-14">
                <div className="max-w-[672px] mx-auto px-6">
                    <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                        Experience
                    </h2>
                    <div className="space-y-10">
                        {workExperience.map(job => (
                            <div key={job.id} className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base font-semibold text-foreground">
                                        {job.title}
                                    </h3>
                                    <span className="text-[13px] text-muted-foreground tabular-nums">
                                        {job.duration}
                                    </span>
                                </div>
                                <p className="text-[14px] text-muted-foreground font-medium">
                                    {job.company}
                                </p>
                                <ul className="space-y-1.5 text-muted-foreground text-[14px] leading-relaxed pt-1">
                                    {job.description.map((point, i) => (
                                        <li key={i} className="flex gap-2.5">
                                            <span className="text-muted-foreground/60 select-none">
                                                –
                                            </span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="max-w-[672px] mx-auto px-6 py-14">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                    Featured Projects
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
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mt-6"
                >
                    View all projects
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                    </svg>
                </Link>
            </section>

            {/* Education */}
            <section className="bg-muted/40 dark:bg-muted/25 py-14">
                <div className="max-w-[672px] mx-auto px-6">
                    <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                        Education
                    </h2>
                    <div className="space-y-8">
                        {education.map(edu => (
                            <div key={edu.id} className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base font-semibold text-foreground">
                                        {edu.degree}
                                    </h3>
                                    <span className="text-[13px] text-muted-foreground tabular-nums">
                                        {edu.duration}
                                    </span>
                                </div>
                                <p className="text-[14px] text-muted-foreground font-medium">
                                    {edu.institution}
                                </p>
                                <ul className="space-y-1.5 text-muted-foreground text-[14px] leading-relaxed pt-1">
                                    {edu.highlights.map((highlight, i) => (
                                        <li key={i} className="flex gap-2.5">
                                            <span className="text-muted-foreground/60 select-none">
                                                –
                                            </span>
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="max-w-[672px] mx-auto px-6 py-14">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                    Certifications
                </h2>
                <div className="space-y-5">
                    {certifications.map(cert => (
                        <a
                            key={cert.id}
                            href={cert.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                    <h3 className="text-[15px] font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                                        {cert.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                        <span>{cert.issuer}</span>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span>{cert.date}</span>
                                    </div>
                                    {cert.credentialId && (
                                        <p className="text-[12px] text-muted-foreground/70 font-mono">
                                            ID: {cert.credentialId}
                                        </p>
                                    )}
                                </div>
                                <svg
                                    className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                                    />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Activities & Leadership */}
            <section className="bg-muted/40 dark:bg-muted/25 py-14">
                <div className="max-w-[672px] mx-auto px-6">
                    <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                        Activities & Leadership
                    </h2>
                    <div className="space-y-8">
                        {activities.map(activity => (
                            <div key={activity.id} className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base font-semibold text-foreground">
                                        {activity.role}
                                    </h3>
                                    {activity.duration && (
                                        <span className="text-[13px] text-muted-foreground tabular-nums">
                                            {activity.duration}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[14px] text-muted-foreground font-medium">
                                    {activity.organization}
                                </p>
                                <ul className="space-y-1.5 text-muted-foreground text-[14px] leading-relaxed pt-1">
                                    {activity.contributions.map((contribution, i) => (
                                        <li key={i} className="flex gap-2.5">
                                            <span className="text-muted-foreground/60 select-none">
                                                –
                                            </span>
                                            <span>{contribution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Blogs */}
            <section className="max-w-[672px] mx-auto px-6 py-14">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-8">
                    Latest Writing
                </h2>
                <div className="space-y-6">
                    {latestBlogs.map(blog => (
                        <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="block group">
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1.5">
                                <h3 className="text-[15px] font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                                    {blog.title}
                                </h3>
                                <span className="text-[13px] text-muted-foreground tabular-nums flex-shrink-0">
                                    {blog.date}
                                </span>
                            </div>
                            <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                                {blog.excerpt}
                            </p>
                        </Link>
                    ))}
                </div>
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mt-6"
                >
                    View all posts
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                    </svg>
                </Link>
            </section>

            {/* Contact CTA */}
            <section className="max-w-[672px] mx-auto px-6 pb-8">
                <div className="pt-8 border-t border-border/60">
                    <Button
                        variant="default"
                        size="sm"
                        className="rounded-full text-[13px] px-5"
                        asChild
                    >
                        <Link href={`mailto:${personalInfo.email}`}>Get in touch</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
