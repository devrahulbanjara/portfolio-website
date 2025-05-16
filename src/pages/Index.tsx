
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ContactSection } from "@/components/ContactSection";
import { BlogSection } from "@/components/BlogSection";
import { Footer } from "@/components/Footer";
import { personalInfo } from "@/data/portfolio-data";

const Index = () => {
  useEffect(() => {
    // Update page title and meta description
    document.title = `${personalInfo.name} | ${personalInfo.title}`;
    
    // Setup smooth scroll reveal animation
    const handleScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll:not(.active)");
      
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible) {
          el.classList.add("active");
        }
      });
    };
    
    // Initial check
    setTimeout(handleScroll, 100);
    
    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
