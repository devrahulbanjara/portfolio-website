import type { Metadata } from "next";
import { PageIntro } from "@/components/site/PageIntro";
import { WorkBrowser } from "./WorkBrowser";

export const metadata: Metadata = {
  title: "Projects — AI agents, RAG and ML on AWS",
  description: "Projects by Rahul Dev Banjara: production AI agents, Nepali search, AWS ML tooling and education platforms, each with the problem, decisions and results.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageIntro title="Projects I've built" lede="Each one has a short case study: the problem, what I built, the decisions I made and how it turned out." />
      <section className="wrap" style={{ paddingBlock: "3rem clamp(6rem, 12vw, 10rem)" }}>
        <WorkBrowser />
      </section>
    </>
  );
}
