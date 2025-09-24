import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/portfolio-data";
import { ExternalLink, Github } from "lucide-react";

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));
    
    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Only show main projects (the current "all" set)
  const mainProjects = projects;
  
  // Render a compact grid card
  const renderCompactCard = (project, index) => {
    const truncatedDescription = project.description.length > 140
      ? project.description.slice(0, 137) + "..."
      : project.description;
    const visibleTags = project.tags.slice(0, 2);
    const hiddenTagsCount = Math.max(project.tags.length - visibleTags.length, 0);
    const visibleTech = project.techStack.slice(0, 4);

    return (
      <Card
        key={project.id}
        className="animate-on-scroll overflow-hidden group relative border border-border/60 bg-gradient-to-b from-background to-secondary/10 hover:to-secondary/20 transition-all duration-300"
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/80 via-primary to-transparent" />

        <CardHeader className="py-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {hiddenTagsCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">+{hiddenTagsCount}</Badge>
              )}
            </div>
          </div>
          <CardDescription className="mt-1 text-sm leading-relaxed">
            {truncatedDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {visibleTech.map((tech) => (
              <span key={tech} className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-background/60">
                {tech}
              </span>
            ))}
            {project.techStack.length > visibleTech.length && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-background/60">
                +{project.techStack.length - visibleTech.length}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="ml-auto flex items-center gap-2">
            {/* AarthikNiti: show both Live and GitHub (if available) */}
            {project.id === "aarthikniti" && project.link && (
              <Button size="icon" className="h-8 w-8">
                <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="Live Demo">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.id === "aarthikniti" && project.github && (
              <Button variant="outline" size="icon" className="h-8 w-8">
                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="View Code">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}

            {/* Other projects: only GitHub if available */}
            {project.id !== "aarthikniti" && project.github && (
              <Button variant="outline" size="icon" className="h-8 w-8">
                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="View Code">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <section id="projects" ref={sectionRef} className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Projects</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            A showcase of my work, including machine learning models, applications, and more.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainProjects.map((project, index) => renderCompactCard(project, index))}
        </div>
      </div>
    </section>
  );
}
