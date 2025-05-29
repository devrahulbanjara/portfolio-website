import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects, collegeProjects } from "@/data/portfolio-data";
import { ExternalLink, Github } from "lucide-react";

export function ProjectsSection() {
  const [filter, setFilter] = useState<"all" | "ai" | "fullstack" | "other" | "college">("all");
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

  // Filter regular projects (exclude college projects from "all")
  const filteredProjects = projects.filter(
    (project) => filter === "all" || project.categories.includes(filter)
  );

  // Filter college projects (only show when college filter is active)
  const filteredCollegeProjects = filter === "college" ? collegeProjects : [];
  
  // Define default project images based on category
  const getDefaultProjectImage = (categories: string[]) => {
    if (categories.includes('ai')) {
      return "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7";
    } else if (categories.includes('fullstack')) {
      return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d";
    } else if (categories.includes('college')) {
      return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173";
    } else {
      return "https://images.unsplash.com/photo-1531297484001-80022131f5a1";
    }
  };

  // Render a project card
  const renderProjectCard = (project, index) => (
    <Card key={project.id} className="animate-on-scroll overflow-hidden group card" style={{ transitionDelay: `${index * 100}ms` }}>
      <div className="h-48 overflow-hidden">
        {project.image ? (
          <img 
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img 
            src={getDefaultProjectImage(project.categories)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      
      <CardHeader className="card-header">
        <div className="flex flex-wrap gap-1 mb-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="card-content">
        <div className="flex flex-wrap gap-1">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs px-2 py-1 bg-secondary rounded-full">{tech}</span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="card-footer flex justify-between">
        {project.github && (
          <Button variant="outline" size="sm" asChild className="btn-sm">
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-1" /> Code
            </a>
          </Button>
        )}
        
        {project.link && (
          <Button size="sm" asChild className="btn-sm">
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
            </a>
          </Button>
        )}
        
        {!project.github && !project.link && (
          <Button size="sm" disabled className="btn-sm">Coming soon</Button>
        )}
      </CardFooter>
    </Card>
  );
  
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

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-on-scroll">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "ai" ? "default" : "outline"}
            onClick={() => setFilter("ai")}
          >
            AI & ML
          </Button>
          <Button 
            variant={filter === "fullstack" ? "default" : "outline"}
            onClick={() => setFilter("fullstack")}
          >
            Full Stack
          </Button>
          <Button 
            variant={filter === "college" ? "default" : "outline"}
            onClick={() => setFilter("college")}
          >
            College Assessment
          </Button>
        </div>
        
        {/* Main projects grid */}
        {(filter !== "college" || filteredProjects.length > 0) && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        )}
        
        {/* College projects section */}
        {filter === "college" && (
          <>
            <div className="text-center my-12 animate-on-scroll">
              <h3 className="text-2xl font-bold mb-2">College Assessment Projects</h3>
              <div className="h-1 w-16 bg-secondary mx-auto"></div>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Academic projects completed as part of college coursework and assessments.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollegeProjects.map((project, index) => renderProjectCard(project, index))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
