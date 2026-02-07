#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const matter = require("gray-matter")

const BLOG_DIR = path.join(process.cwd(), "content/blogs")
const MAX_TITLE_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 155
const MIN_KEYWORDS = 5
const MAX_KEYWORDS = 10

function auditBlogPost(filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const { data: frontmatter } = matter(content)
    const issues = []
    const fileName = path.basename(filePath)

    // Check title length
    if (!frontmatter.title) {
        issues.push("❌ Missing title")
    } else if (frontmatter.title.length > MAX_TITLE_LENGTH) {
        issues.push(`⚠️  Title too long (${frontmatter.title.length}/${MAX_TITLE_LENGTH} chars)`)
    }

    // Check description length
    if (!frontmatter.excerpt) {
        issues.push("❌ Missing excerpt/description")
    } else if (frontmatter.excerpt.length > MAX_DESCRIPTION_LENGTH) {
        issues.push(
            `⚠️  Description too long (${frontmatter.excerpt.length}/${MAX_DESCRIPTION_LENGTH} chars)`
        )
    }

    // Check keywords
    if (!frontmatter.keywords || frontmatter.keywords.length === 0) {
        issues.push("❌ Missing keywords")
    } else if (frontmatter.keywords.length < MIN_KEYWORDS) {
        issues.push(`⚠️  Too few keywords (${frontmatter.keywords.length}/${MIN_KEYWORDS} minimum)`)
    } else if (frontmatter.keywords.length > MAX_KEYWORDS) {
        issues.push(
            `⚠️  Too many keywords (${frontmatter.keywords.length}/${MAX_KEYWORDS} maximum)`
        )
    }

    // Check tags
    if (!frontmatter.tags || frontmatter.tags.length === 0) {
        issues.push("❌ Missing tags")
    }

    // Check category
    if (!frontmatter.category) {
        issues.push("❌ Missing category")
    }

    // Check date
    if (!frontmatter.date) {
        issues.push("❌ Missing date")
    }

    // Check readTime
    if (!frontmatter.readTime) {
        issues.push("❌ Missing readTime")
    }

    return { fileName, issues, frontmatter }
}

function runSEOAudit() {
    console.log("🔍 Running SEO Audit for Blog Posts...\n")

    if (!fs.existsSync(BLOG_DIR)) {
        console.error("❌ Blog directory not found:", BLOG_DIR)
        process.exit(1)
    }

    const blogFiles = fs
        .readdirSync(BLOG_DIR)
        .filter(file => file.endsWith(".md"))
        .map(file => path.join(BLOG_DIR, file))

    let totalIssues = 0
    const results = []

    blogFiles.forEach(filePath => {
        const result = auditBlogPost(filePath)
        results.push(result)
        totalIssues += result.issues.length

        if (result.issues.length === 0) {
            console.log(`✅ ${result.fileName} - No issues found`)
        } else {
            console.log(`🔴 ${result.fileName}:`)
            result.issues.forEach(issue => console.log(`   ${issue}`))
        }
        console.log("")
    })

    // Summary
    console.log("📊 SEO Audit Summary:")
    console.log(`   Total files: ${blogFiles.length}`)
    console.log(`   Total issues: ${totalIssues}`)
    console.log(`   Clean files: ${results.filter(r => r.issues.length === 0).length}`)
    console.log(`   Files with issues: ${results.filter(r => r.issues.length > 0).length}`)

    // Recommendations
    if (totalIssues > 0) {
        console.log("\n💡 Recommendations:")
        console.log("   1. Add missing metadata fields to improve SEO")
        console.log("   2. Keep titles under 60 characters for better SERP display")
        console.log("   3. Keep descriptions under 155 characters")
        console.log("   4. Add 5-10 relevant keywords per post")
        console.log("   5. Categorize posts for better organization")
    } else {
        console.log("\n🎉 All blog posts are SEO-optimized!")
    }

    // Only exit with error if there are critical issues (missing required fields)
    const criticalIssues = results.reduce((count, result) => {
        return count + result.issues.filter(issue => issue.includes("❌")).length
    }, 0)

    if (criticalIssues > 0) {
        console.log(`\n🚨 Found ${criticalIssues} critical issues that must be fixed!`)
        process.exit(1)
    } else if (totalIssues > 0) {
        console.log(
            `\n⚠️  Found ${totalIssues} warnings. Build will continue, but consider fixing these for better SEO.`
        )
        process.exit(0)
    } else {
        process.exit(0)
    }
}

if (require.main === module) {
    runSEOAudit()
}

module.exports = { auditBlogPost, runSEOAudit }
