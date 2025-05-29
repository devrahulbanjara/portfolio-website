import { useEffect, useRef } from "react";
import { skills } from "@/data/portfolio-data";
import { Progress } from "@/components/ui/progress";

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
  
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
  
  const categoryLabels: Record<string, string> = {
    languages: "Programming Languages",
    frameworks: "Frameworks & Libraries",
    tools: "Tools & Platforms",
    ml: "Machine Learning",
    other: "Other Skills"
  };
  
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
          {/* ML Skills */}
          <div className="animate-on-scroll">
            <h3 className="text-xl font-bold mb-6">{categoryLabels.ml}</h3>
            <div className="space-y-6">
              {groupedSkills.ml?.map((skill, index) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden skill-bar">
                    <div 
                      data-progress={skill.level}
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Programming Languages */}
          <div className="animate-on-scroll">
            <h3 className="text-xl font-bold mb-6">{categoryLabels.languages}</h3>
            <div className="space-y-6">
              {groupedSkills.languages?.map((skill, index) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden skill-bar">
                    <div 
                      data-progress={skill.level}
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Frameworks */}
          <div className="animate-on-scroll">
            <h3 className="text-xl font-bold mb-6">{categoryLabels.frameworks}</h3>
            <div className="space-y-6">
              {groupedSkills.frameworks?.map((skill, index) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden skill-bar">
                    <div 
                      data-progress={skill.level}
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tools */}
          <div className="animate-on-scroll">
            <h3 className="text-xl font-bold mb-6">{categoryLabels.tools}</h3>
            <div className="space-y-6">
              {groupedSkills.tools?.map((skill, index) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden skill-bar">
                    <div 
                      data-progress={skill.level}
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
