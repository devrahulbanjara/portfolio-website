
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const sections = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "blog", label: "Blog" },
    { id: "contact", label: "Contact" }
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar style based on scroll position
      setIsScrolled(window.scrollY > 10);
      
      // Detect which section is currently in viewport
      const currentSection = sections.find(section => {
        const element = document.getElementById(section.id);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out py-4",
        isScrolled ? "glassmorphism shadow-sm backdrop-blur-lg py-3" : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-xl font-bold focus-ring">
          <span className="gradient-text">Rahul.dev</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary focus-ring",
                activeSection === section.id 
                  ? "text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary" 
                  : "text-muted-foreground"
              )}
            >
              {section.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-2 p-2 focus-ring"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-6 flex flex-col gap-1">
              <span className={cn(
                "block h-0.5 w-full bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""
              )} />
              <span className={cn(
                "block h-0.5 w-full bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen ? "opacity-0" : ""
              )} />
              <span className={cn(
                "block h-0.5 w-full bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
              )} />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 p-4 md:hidden flex flex-col gap-1 bg-background/95 backdrop-blur-lg border-t border-border shadow-sm">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "px-4 py-3 text-sm font-medium rounded-md transition-colors",
                activeSection === section.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:bg-secondary"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
