import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Removed AspectRatio to allow width to follow image's natural width
import { certifications } from "@/data/portfolio-data";

export function CertificationsSection() {
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
    <section id="certifications" ref={sectionRef} className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Certifications</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {certifications.map((cert, index) => (
            <Card key={`${cert.title}-${index}`} className="animate-on-scroll inline-block" style={{ transitionDelay: `${index * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={cert.image || "/placeholder.svg"}
                    alt={cert.title}
                    className="block h-72 w-auto object-contain mx-auto"
                    style={{ maxWidth: "90vw" }}
                  />
                </div>
              </CardContent>
              <CardHeader className="items-center text-center pt-0">
                <CardTitle className="text-sm font-medium leading-snug">{cert.title}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  <div>{cert.issuer}</div>
                  {cert.date && <div className="mt-0.5">{cert.date}</div>}
                </div>
                {cert.link && (
                  <Button asChild size="sm" className="mt-2">
                    <a href={cert.link} target="_blank" rel="noopener noreferrer">Verify</a>
                  </Button>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificationsSection;


