
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { experiences } from "@/data/portfolio-data";

export function ExperienceSection() {
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
  
  return (
    <section id="experience" ref={sectionRef} className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Experience</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            My professional journey in machine learning and software development.
          </p>
        </div>
        
        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 h-full w-0.5 bg-border transform md:translate-x-[-50%]"></div>
          
          {experiences.map((exp, index) => (
            <div 
              key={exp.id}
              className={`animate-on-scroll relative flex md:justify-between mb-12 last:mb-0 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary rounded-full transform translate-x-[-50%] translate-y-1/2 z-10 md:mt-4"></div>
              
              {/* Content */}
              <div className={`ml-8 md:ml-0 md:w-[48%] flex flex-col ${index % 2 === 0 ? "md:mr-0" : "md:ml-0"}`}>
                {/* Date above the card (desktop view) */}
                <div className={`hidden md:block text-sm text-muted-foreground font-medium mb-2 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                  {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                  {exp.endDate === "Present" ? " Present" : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
                
                {/* Date for mobile */}
                <div className="block md:hidden text-sm text-muted-foreground mb-2">
                  {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                  {exp.endDate === "Present" ? " Present" : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
                
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>{exp.position}</CardTitle>
                    <CardDescription>{exp.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {exp.description.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="mr-2 mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Empty space for timeline balance */}
              <div className="hidden md:block md:w-[48%]"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
