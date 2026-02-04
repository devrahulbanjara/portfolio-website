import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog-utils'

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rahuldevbanjara.com.np'
    
    // Static pages with optimized priorities
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0, // Homepage - highest priority
        },
        {
            url: `${siteUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily', // Blog index changes frequently
            priority: 0.9, // High priority for blog listing
        },
        {
            url: `${siteUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ]

    // Dynamic blog pages with actual dates
    const blogPosts = getAllBlogPosts()
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${siteUrl}/blogs/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const, // Blog posts change less frequently
        priority: 0.8, // High priority for individual posts
    }))

    return [...staticPages, ...blogPages]
}
