import { site, person, experience, education, certifications, teaching, projects, services } from "@/content/profile";
import { getPublishedPosts } from "@/lib/posts";

/**
 * /llms.txt — a plain-text summary for AI assistants and crawlers
 * (the emerging llms.txt convention), generated from the same content as the site.
 */
export async function GET() {
  const posts = await getPublishedPosts();
  const u = (p: string) => `${site.url}${p}`;
  const body = `# ${person.name}

> ${person.role} and ${person.secondaryRole} based in ${person.location}. ${person.headline}

${person.intro}

## Contact
- Email: ${person.email}
- Contact form: ${u("/contact")}
- Availability: ${person.availability.label}
${person.socials.filter((s) => s.url.startsWith("http")).map((s) => `- ${s.label}: ${s.url}`).join("\n")}

## Experience
${experience.map((e) => `- ${e.role}, ${e.company} (${e.start} – ${e.end ?? "present"})`).join("\n")}

## Education
${education.map((e) => `- ${e.degree}, ${e.school} (${e.start}–${e.end})`).join("\n")}

## Certifications
${certifications.map((c) => `- ${c.name} — ${c.issuer} (${c.issued.slice(0, 4)}): ${c.credentialUrl}`).join("\n")}

## Teaching
${teaching.courses.map((c) => `- ${c.title}: ${c.description}`).join("\n")}

## Services
${services.map((s) => `- ${s.title}: ${s.pitch}`).join("\n")}

## Pages
- [About](${u("/about")})
- [Projects](${u("/work")})
${projects.map((p) => `- [${p.title}](${u(`/work/${p.slug}`)}): ${p.tagline}`).join("\n")}
- [Teaching](${u("/teaching")})
- [Résumé](${u("/resume")})
- [Blog](${u("/blog")})
${posts.map((p) => `- [${p.title}](${u(`/blog/${p.slug}`)}): ${p.excerpt}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
