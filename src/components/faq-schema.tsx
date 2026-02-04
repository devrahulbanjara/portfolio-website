interface FAQItem {
    question: string
    answer: string
}

interface FAQSchemaProps {
    faqs: FAQItem[]
    title: string
}

export function FAQSchema({ faqs, title }: FAQSchemaProps) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "name": title,
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
    )
}