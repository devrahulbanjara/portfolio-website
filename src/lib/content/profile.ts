import type { Profile } from "./types";

export const profile: Profile = {
  name: "Rahul Dev Banjara",
  initials: "RB",
  headline: "AI / ML & Software Engineer",
  /**
   * Hero line and meta description. Kept to one clause: the hero says WHO, the
   * bio says what the work was, and What I Build is the only place capabilities
   * are enumerated. An earlier version repeated all three across all three
   * sections, so the page said the same thing to a reader three times.
   */
  // No cloud or framework named on purpose. The work spans AWS, but also plain
  // PyTorch training runs, multi-agent systems, and MLOps - naming one platform
  // in the hero makes the range look narrower than it is.
  positioning:
    "I build AI systems end to end, and teach the engineers who ship them.",
  bio: [
    // Concrete work, not a second capability list. Every example here is drawn
    // from the Adex bullets in ./experience.ts - the client is not named.
    "My work sits where models meet real users: a churn-prevention platform an enterprise acts on daily, a clinical retrieval system validated with practising physicians, and document pipelines that hold up against messy real-world input.",
    "Alongside that I teach. I designed TekBay Academy's AWS Machine Learning Engineer curriculum from scratch and have taken 60+ engineers through it in person, with a 100% pass rate in the first batch.",
  ],
  email: "rdbanjara07@gmail.com",
  // Stored, deliberately not rendered. See the note on Profile.phone.
  phone: "+977-9866121812",
  avatarUrl: "/profile.webp",
  portraitUrl: "/profile-full.webp",
  // `www` is canonical: it is what the current site serves and what Google has
  // indexed. The apex redirects here.
  siteUrl: "https://www.rahuldevbanjara.com.np",
  social: [
    {
      name: "GitHub",
      url: "https://github.com/devrahulbanjara",
      icon: "github",
      inNav: true,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/devrahulbanjara",
      icon: "linkedin",
      inNav: true,
    },
    {
      name: "Hugging Face",
      url: "https://huggingface.co/devrahulbanjara",
      icon: "huggingface",
      inNav: false,
    },
    {
      name: "Email",
      url: "mailto:rdbanjara07@gmail.com",
      icon: "email",
      inNav: true,
    },
  ],
  // No resume PDF exists in either repository yet. Components must treat this
  // as absent rather than rendering a dead link.
  resumeUrl: null,
};
