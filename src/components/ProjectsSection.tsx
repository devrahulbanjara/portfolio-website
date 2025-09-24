import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/portfolio-data";
import { ExternalLink, Github } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  
  // No inline expansion; use a modal for full content

  // Render a clean, uniform card: Title → Description → Skills → Links
  const renderCompactCard = (project, index) => {
    return (
      <Card
        key={project.id}
        className="animate-on-scroll overflow-hidden group relative border border-border/60 bg-gradient-to-b from-background to-secondary/10 hover:to-secondary/20 transition-all duration-300 h-full flex flex-col"
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/80 via-primary to-transparent" />

        <CardHeader className="py-4">
          <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <div className="mt-1 text-sm leading-relaxed relative">
            <p
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {project.description}
            </p>
            {project.description && project.description.length > 120 && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="mt-2 text-xs text-primary hover:underline">Read more</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{project.title}</DialogTitle>
                    <DialogDescription>
                      {project.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="mb-2 text-xs uppercase text-muted-foreground">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-background/60">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      {project.github && (
                        <Button variant="outline" size="sm">
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                            <Github className="h-4 w-4" /> View Code
                          </a>
                        </Button>
                      )}
                      {project.link && (
                        <Button size="sm">
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span key={tech} className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-background/60">
                {tech}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto">
          <div className="ml-auto flex items-center gap-2">
            {project.github && (
              <Button variant="outline" size="icon" className="h-8 w-8">
                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="View Code">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.link && (
              <Button size="icon" className="h-8 w-8">
                <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="Live Demo">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {!project.github && !project.link && (
              <Button variant="secondary" size="sm" disabled>
                Coming Soon
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
