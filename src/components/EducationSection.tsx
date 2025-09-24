import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { education } from "@/data/portfolio-data";

export function EducationSection() {
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
    <section id="education" ref={sectionRef} className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Education</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {education.map((edu, index) => (
            <Card key={`${edu.school}-${index}`} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
              <CardHeader>
                <CardTitle className="text-xl leading-snug">{edu.degree}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div>{edu.school}</div>
                  <div className="mt-1">{edu.location}</div>
                  <div className="mt-1">{edu.period}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EducationSection;


