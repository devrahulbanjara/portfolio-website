import type { Profile } from "./types";

export const profile: Profile = {
  name: "Rahul Dev Banjara",
  initials: "RB",
  headline: "AI / ML & Software Engineer",
  positioning:
    "I build end-to-end AI systems in production — generative and agentic AI, machine learning, and full MLOps lifecycles on AWS.",
  bio: [
    "I build end-to-end AI systems across healthcare and enterprise — generative and agentic AI (RAG, multi-agent orchestration), backend and software engineering, and full MLOps lifecycles on AWS.",
    "I'm also a certified trainer at TekBay Academy, teaching the next wave of ML engineers toward the AWS Machine Learning Engineer – Associate (MLA-C01) certification.",
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
