
import { personalInfo } from "@/data/portfolio-data";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-xl font-semibold gradient-text">Rahul.dev</h2>
            <p className="text-muted-foreground mt-2">
              {personalInfo.title}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href={`mailto:${personalInfo.email}`}
              className="text-muted-foreground hover:text-primary transition-all duration-300"
              title="Email"
              aria-label="Send email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a 
              href={personalInfo.social.github}
              className="text-muted-foreground hover:text-primary transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="Visit GitHub profile"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href={personalInfo.social.linkedin}
              className="text-muted-foreground hover:text-primary transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              aria-label="Visit LinkedIn profile"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>
              &copy; {currentYear} {personalInfo.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
