/**
 * Domain types for portfolio content.
 *
 * Portfolio content is edited in code and deployed - there is no CMS for it.
 * Only the blog is CMS-managed (see src/lib/blog).
 *
 * These types deliberately contain no JSX. Icons are referenced by string key
 * and resolved through `resolveIcon` in ./icons, which keeps this data plain,
 * serializable, and free of a React dependency.
 */

/** Key into the icon registry in ./icons. */
export type IconKey = string;

export interface SocialLink {
  /** Display name, e.g. "GitHub". */
  name: string;
  url: string;
  icon: IconKey;
  /** Whether it appears in the floating dock nav. */
  inNav: boolean;
}

export interface Profile {
  name: string;
  /** Used for the avatar fallback when the image fails to load. */
  initials: string;
  /** Short role line, shown under the name. */
  headline: string;
  /** One-sentence positioning statement for the hero. */
  positioning: string;
  /** Longer bio paragraphs, in order. */
  bio: readonly string[];
  email: string;
  /**
   * Present in the source data but deliberately NOT rendered. The previous site
   * stored it and never displayed it; publishing it is a decision Rahul has not
   * made. Kept here so the data is complete, not so it is shown.
   */
  phone?: string;
  avatarUrl: string;
  portraitUrl: string;
  /** Canonical production origin, no trailing slash. */
  siteUrl: string;
  social: readonly SocialLink[];
  /** Path to the resume PDF, or null while none exists. */
  resumeUrl: string | null;
}

export interface Experience {
  slug: string;
  role: string;
  organization: string;
  /** Human-readable range, e.g. "June 2025 – Present". */
  period: string;
  /** ISO date used only for sorting. */
  startedAt: string;
  /** null means current. */
  endedAt: string | null;
  logoUrl: string;
  /** Accomplishment bullets, most significant first. */
  highlights: readonly string[];
  /** Small, relevant tech set. Not an exhaustive inventory. */
  technologies: readonly string[];
}

export interface SkillGroup {
  /** e.g. "Generative AI" */
  title: string;
  /** One line on what this capability actually delivers. */
  summary: string;
  items: readonly string[];
}

export interface ProjectLink {
  kind: "repository" | "live" | "article" | "model";
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  /** Short label for cards, distinct from the full title. */
  shortTitle: string;
  /** One sentence, outcome-first. */
  summary: string;
  /** Detail bullets for the case study and expanded card. */
  highlights: readonly string[];
  technologies: readonly string[];
  links: readonly ProjectLink[];
  /** Screenshot or diagram. null renders a typographic card instead. */
  imageUrl: string | null;
  /**
   * Flagship projects get large cards on the homepage and a case-study page.
   * Non-flagship projects live in the archive.
   */
  flagship: boolean;
  /** Whether a /work/[slug] case study exists. */
  hasCaseStudy: boolean;
}

export interface Education {
  slug: string;
  degree: string;
  institution: string;
  period: string;
  logoUrl: string;
  highlights: readonly string[];
}

export interface Certification {
  slug: string;
  name: string;
  issuer: string;
  /** Year awarded. */
  date: string;
  issuerLogoUrl: string;
  credentialId?: string;
  verificationUrl: string;
  /** Credly badge, where one exists. */
  badgeUrl?: string;
}

export interface Activity {
  slug: string;
  role: string;
  organization: string;
  period: string;
  logoUrl: string;
  highlights: readonly string[];
}
