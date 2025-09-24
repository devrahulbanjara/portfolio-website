import { useEffect, useRef } from "react";
import { skillsSummary } from "@/data/portfolio-data";
import { Badge } from "@/components/ui/badge";

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            
            // Animate progress bars when they come into view
            const progressBars = entry.target.querySelectorAll("[data-progress]");
            progressBars.forEach((bar) => {
              const value = bar.getAttribute("data-progress");
              if (value) {
                setTimeout(() => {
                  (bar as HTMLElement).style.width = `${value}%`;
                }, 100);
              }
            });
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
  
  const sections = [
    { title: "Languages", items: skillsSummary.languages },
    { title: "Technologies & Tools", items: skillsSummary.tools },
  ];
  
  return (
    <section 
      id="skills" 
      ref={sectionRef}
      className="py-20 bg-secondary/50"
    >
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Skills</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            My technical toolkit and expertise, honed through experience and continuous learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {sections.map((section, idx) => (
            <div key={section.title} className="animate-on-scroll">
              <h3 className="text-xl font-bold mb-6">{section.title}</h3>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <Badge key={item} variant="secondary" className="text-sm px-3 py-1">{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
