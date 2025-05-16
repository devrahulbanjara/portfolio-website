
import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalInfo } from "@/data/portfolio-data";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simple 3D tilt effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = (y - centerY) / 20;
      const tiltY = (centerX - x) / 20;
      
      containerRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    };
    
    const handleMouseLeave = () => {
      if (!containerRef.current) return;
      containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };
    
    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <section 
      id="hero" 
      className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-16"
    >
      {/* Background decorations */}
      <div className="absolute -top-[30%] -right-[10%] w-[50%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[40%] bg-primary/30 blur-[120px] rounded-full" />
      
      <div 
        ref={containerRef}
        className="container relative z-10 transition-all duration-300 ease-out"
      >
        <div className="flex flex-col items-start max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 animate-fade-in opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <div className="h-1 w-16 bg-primary rounded"></div>
            <span className="text-muted-foreground font-mono">Hello, I'm</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <span className="gradient-text">{personalInfo.name}</span>
          </h1>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <span className="text-foreground/80">
              {personalInfo.title}
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            {personalInfo.about}
          </p>
          
          <div className="flex gap-4 animate-fade-in opacity-0" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
            <Button asChild>
              <a href="#contact">
                Get in touch <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#projects">
                View Projects
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-[30px] h-[50px] border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse-light" />
        </div>
      </div>
    </section>
  );
}
