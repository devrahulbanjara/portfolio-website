interface HowToStep {
    name: string
    text: string
    image?: string
}

interface HowToSchemaProps {
    title: string
    description: string
    steps: HowToStep[]
    totalTime?: string
    estimatedCost?: string
}

export function HowToSchema({
    title,
    description,
    steps,
    totalTime,
    estimatedCost,
}: HowToSchemaProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rahuldevbanjara.com.np"

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: title,
        description: description,
        ...(totalTime && { totalTime: totalTime }),
        ...(estimatedCost && {
            estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: estimatedCost },
        }),
        step: steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: `${siteUrl}${step.image}` }),
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
    )
}
