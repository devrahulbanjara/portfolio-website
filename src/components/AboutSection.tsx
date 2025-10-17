import { useEffect, useRef } from "react";
import { personalInfo } from "@/data/portfolio-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function AboutSection() {
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
      { threshold: 0.2 }
    );
    
    const children = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    children?.forEach((child) => observer.observe(child));
    
    return () => {
      children?.forEach((child) => observer.unobserve(child));
    };
  }, []);
  
  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 relative"
    >
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column: Profile image */}
          <div className="animate-on-scroll flex justify-center">
            <div className="relative">
              <Avatar className="w-64 h-64 border-4 border-primary/20">
                <AvatarImage src="/images/avatar.png" alt={`${personalInfo.name}'s profile picture`} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold">
                  {personalInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Abstract background elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl -z-10"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* Right column: About me info */}
          <div className="flex flex-col gap-6">
            <div className="animate-on-scroll">
              <h3 className="text-2xl font-bold mb-3">
                Machine Learning Engineer
              </h3>
              <p className="text-muted-foreground">
                With a strong background in machine learning, I specialize in building
                intelligent systems that leverage the power of data to solve complex problems.
              </p>
            </div>
            
            <div className="animate-on-scroll">
              <h4 className="text-xl font-medium mb-2">What I do</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <p>Design and implement machine learning models using PyTorch and TensorFlow</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <p>Fine-tune large language models (LLMs) using LoRA and quantization techniques</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <p>Develop efficient backend systems for AI applications</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <p>End-to-end machine learning project lifecycle management</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <p>Data processing, analysis, and visualization</p>
                </li>
              </ul>
            </div>
            
            <div className="animate-on-scroll grid grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{personalInfo.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p>{personalInfo.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
