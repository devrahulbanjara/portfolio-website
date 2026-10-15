"use client";

import { useState } from "react";
import { projects } from "@/content/profile";
import { ProjectList } from "@/components/site/ProjectList";
import { kindOf } from "@/lib/format";

const builds = projects.filter((p) => p.category !== "OpenSource");
const openSource = projects.filter((p) => p.category === "OpenSource");

export function WorkBrowser() {
  const kinds = [...new Set(builds.map(kindOf))];
  const [filter, setFilter] = useState<string | null>(null);
  const items = filter ? builds.filter((p) => kindOf(p) === filter) : builds;
  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        <button type="button" className={filter === null ? "is-on" : ""} onClick={() => setFilter(null)} aria-pressed={filter === null}>
          All <sup>{builds.length}</sup>
        </button>
        {kinds.map((k) => (
          <button key={k} type="button" className={filter === k ? "is-on" : ""} onClick={() => setFilter(k)} aria-pressed={filter === k}>
            {k} <sup>{builds.filter((p) => kindOf(p) === k).length}</sup>
          </button>
        ))}
      </div>
      <ProjectList key={filter ?? "all"} items={items} />

      {openSource.length > 0 && (
        <section className="work-group" aria-labelledby="open-source">
          <h2 id="open-source" className="work-group-title" data-reveal>
            Open source contributions <sup>{openSource.length}</sup>
          </h2>
          <p className="work-group-lede" data-reveal>
            Tools I&apos;ve built for software I use every day, released for anyone to install, with the benchmarks to back them up.
          </p>
          <ProjectList items={openSource} />
        </section>
      )}
    </>
  );
}
