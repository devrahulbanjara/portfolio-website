import { person, site, certifications, experience } from "@/content/profile";

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Person + WebSite graph — the backbone of "Rahul Dev Banjara" search results. */
export function personGraph() {
  const current = experience.find((e) => !e.end);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: person.name,
        alternateName: person.nameDevanagari,
        url: site.url,
        email: `mailto:${person.email}`,
        image: `${site.url}/opengraph-image`,
        jobTitle: person.role,
        description: site.description,
        homeLocation: { "@type": "Place", name: person.location },
        worksFor: current ? { "@type": "Organization", name: current.company } : undefined,
        knowsAbout: ["Artificial intelligence", "Large language models", "AI agents", "Retrieval-augmented generation", "Machine learning", "Amazon SageMaker", "Python", "Data science", "Teaching"],
        knowsLanguage: ["en", "ne", "hi"],
        hasCredential: certifications.map((c) => ({
          "@type": "EducationalOccupationalCredential",
          name: c.name,
          credentialCategory: "certification",
          recognizedBy: { "@type": "Organization", name: c.issuer },
        })),
        sameAs: person.socials.filter((s) => s.url.startsWith("http")).map((s) => s.url),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}/#person` },
        inLanguage: "en",
      },
    ],
  };
}
