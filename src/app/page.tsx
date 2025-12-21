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
    const featuredProjects = projects.filter((p) => p.featured)
    const recentBlogs = blogPosts.slice(0, 3)

    return (
        <div className="pb-20">
            {/* Hero & Skills Section - No background */}
            <div className="max-w-2xl mx-auto px-6 pt-0 sm:pt-20">
                {/* Profile Image */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                    <Image
                        src={personalInfo.profileImage}
                        alt={`${personalInfo.name}'s profile`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Introduction */}
                <div className="mt-5 flex-col flex gap-2">
                    <h1 className="text-3xl font-medium text-foreground">
                        Hi, I&apos;m {personalInfo.name}.
                    </h1>
                    <div className="mb-2 text-muted-foreground leading-relaxed">
                        {personalInfo.bio.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>

                    {/* Email Link */}
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {personalInfo.email}
                    </a>
                </div>

                {/* Current Work */}
                <p className="text-muted-foreground mb-12 mt-4">
                    Currently working on{" "}
                    <span className="text-foreground font-medium">
                        {personalInfo.currentWork} ⚡
                    </span>
                </p>

                {/* Top Skills Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-medium text-foreground mb-4">Top Skills</h2>
                    <div className="flex flex-wrap gap-2 *:text-muted-foreground text-sm">
                        {skills.map((skill, index) => (
                            <React.Fragment key={skill}>
                                <span>{skill}</span>
                                {index < skills.length - 1 && <span>•</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Work Experience Section - WITH FULL-WIDTH BACKGROUND */}
            <div className="w-full bg-muted/50 dark:bg-muted/20 py-12">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-xl font-medium text-foreground mb-6">
                        Work Experience
                    </h2>
                    <div className="space-y-8">
                        {workExperience.map((job) => (
                            <div key={job.id} className="space-y-2">
                                <h3 className="text-lg font-medium text-foreground">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium">{job.company}</span>
                                    <span>•</span>
                                    <span>{job.duration}</span>
                                </div>
                                <ul className="space-y-1 text-muted-foreground text-sm pl-0">
                                    {job.description.map((point, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-foreground">–</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Projects Section - No background */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                <h2 className="text-xl font-medium text-foreground mb-6">
                    Featured Projects
                </h2>
                <div className="space-y-6">
                    {featuredProjects.map((project) => (
                        <div key={project.id} className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-medium text-foreground">
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-foreground bg-muted/60 dark:bg-muted/30 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse"></span>
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
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {project.description}
                            </p>
                            <ul className="space-y-1 text-muted-foreground text-sm">
                                {project.details.map((detail, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-foreground">–</span>
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <Link
                    href="/projects"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mt-4"
                >
                    View all projects →
                </Link>
            </div>

            {/* Education Section - WITH FULL-WIDTH BACKGROUND */}
            <div className="w-full bg-muted/50 dark:bg-muted/20 py-12">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-xl font-medium text-foreground mb-6">Education</h2>
                    <div className="space-y-6">
                        {education.map((edu) => (
                            <div key={edu.id} className="space-y-2">
                                <h3 className="text-lg font-medium text-foreground">
                                    {edu.degree}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium">{edu.institution}</span>
                                    <span>•</span>
                                    <span>{edu.duration}</span>
                                </div>
                                <ul className="space-y-1 text-muted-foreground text-sm">
                                    {edu.highlights.map((highlight, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-foreground">–</span>
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Certifications Section - No background */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                <h2 className="text-xl font-medium text-foreground mb-6">Certifications</h2>
                <div className="space-y-4">
                    {certifications.map((cert) => (
                        <a
                            key={cert.id}
                            href={cert.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group space-y-1 hover:translate-x-1 transition-transform duration-200"
                        >
                            <div className="flex items-start gap-2">
                                <h3 className="text-base font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                                    {cert.name}
                                </h3>
                                <svg
                                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{cert.issuer}</span>
                                <span>•</span>
                                <span>{cert.date}</span>
                            </div>
                            {cert.credentialId && (
                                <p className="text-xs text-muted-foreground">
                                    Credential ID: {cert.credentialId}
                                </p>
                            )}
                        </a>
                    ))}
                </div>
            </div>

            {/* Activities & Leadership Section - WITH FULL-WIDTH BACKGROUND */}
            <div className="w-full bg-muted/50 dark:bg-muted/20 py-12">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-xl font-medium text-foreground mb-6">
                        Activities & Leadership
                    </h2>
                    <div className="space-y-6">
                        {activities.map((activity) => (
                            <div key={activity.id} className="space-y-2">
                                <h3 className="text-lg font-medium text-foreground">
                                    {activity.role}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium">{activity.organization}</span>
                                    {activity.duration && (
                                        <>
                                            <span>•</span>
                                            <span>{activity.duration}</span>
                                        </>
                                    )}
                                </div>
                                <ul className="space-y-1 text-muted-foreground text-sm">
                                    {activity.contributions.map((contribution, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-foreground">–</span>
                                            <span>{contribution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Writings Section - No background */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                <h2 className="text-xl font-medium text-foreground mb-6">
                    Recent Writings
                </h2>
                <div className="space-y-4">
                    {recentBlogs.map((blog) => (
                        <Link
                            key={blog.slug}
                            href={`/blogs/${blog.slug}`}
                            className="block group"
                        >
                            <div className="space-y-1">
                                <h3 className="text-base font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{blog.date}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {blog.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <Link
                    href="/blogs"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mt-4"
                >
                    View all posts →
                </Link>
            </div>

            {/* Contact CTA - No background */}
            <div className="max-w-2xl mx-auto px-6">
                <Button variant="default" className="rounded-full" asChild>
                    <Link href={`mailto:${personalInfo.email}`}>Say Hello</Link>
                </Button>
            </div>
        </div>
    )
}
