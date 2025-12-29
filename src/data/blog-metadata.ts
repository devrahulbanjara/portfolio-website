export interface BlogPost {
    slug: string
    title: string
    date: string
    excerpt: string
    readTime: string
}

const posts: BlogPost[] = [
    {
        slug: "sagemaker-caching",
        title: "Mastering Caching in Amazon SageMaker Pipelines for Faster and More Economical ML Workflows",
        date: "December 21, 2025",
        excerpt:
            "Eliminate redundant computations and reduce costs by implementing intelligent caching in your SageMaker ML pipelines.",
        readTime: "8 min read",
    },
    {
        slug: "mlops-best-practices",
        title: "MLOps Best Practices for Production Systems",
        date: "November 28, 2025",
        excerpt:
            "Lessons learned from deploying ML models at scale in production environments. Covering CI/CD, monitoring, and model versioning.",
        readTime: "8 min read",
    },
    {
        slug: "understanding-transformers",
        title: "Understanding Transformer Architecture from Scratch",
        date: "December 15, 2024",
        excerpt:
            "A deep dive into the attention mechanism and how transformers revolutionized NLP. We'll build a transformer from scratch using PyTorch.",
        readTime: "12 min read",
    },
]

// Automatically sort posts by date (newest first)
export const blogPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())