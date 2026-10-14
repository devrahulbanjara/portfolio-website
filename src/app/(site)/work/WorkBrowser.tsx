"use client";

import { useState } from "react";
import { projects } from "@/content/profile";
import { ProjectList } from "@/components/site/ProjectList";
import { kindOf } from "@/lib/format";

export function WorkBrowser() {
  const kinds = [...new Set(projects.map(kindOf))];
  const [filter, setFilter] = useState<string | null>(null);
  const items = filter ? projects.filter((p) => kindOf(p) === filter) : projects;
  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        <button type="button" className={filter === null ? "is-on" : ""} onClick={() => setFilter(null)} aria-pressed={filter === null}>
          All <sup>{projects.length}</sup>
        </button>
        {kinds.map((k) => (
          <button key={k} type="button" className={filter === k ? "is-on" : ""} onClick={() => setFilter(k)} aria-pressed={filter === k}>
            {k} <sup>{projects.filter((p) => kindOf(p) === k).length}</sup>
          </button>
        ))}
      </div>
      <ProjectList key={filter ?? "all"} items={items} />
    </>
  );
}
