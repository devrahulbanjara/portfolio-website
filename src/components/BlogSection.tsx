
import { blogs } from "@/data/portfolio-data";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

export function BlogSection() {
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
  
  const featuredBlog = blogs.find(blog => blog.featured);
  
  return (
    <section id="blog" ref={sectionRef} className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-2">Blog</h2>
          <div className="h-0.5 w-12 bg-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Thoughts, insights, and discoveries from my journey in AI and machine learning.
          </p>
        </div>
        
        {featuredBlog && (
          <div className="max-w-4xl mx-auto animate-on-scroll">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="grid md:grid-cols-5 gap-0">
                <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary mb-4">
                      Featured Post
                    </span>
                    <CardTitle className="text-2xl md:text-3xl mb-3">
                      {featuredBlog.title}
                    </CardTitle>
                    <CardDescription className="text-base mb-4">
                      {featuredBlog.description}
                    </CardDescription>
                  </div>
                  <div>
                    <a 
                      href={featuredBlog.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group inline-flex items-center font-medium text-primary hover:underline"
                    >
                      Read more 
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
                <div className="md:col-span-2 bg-secondary overflow-hidden">
                  {featuredBlog.image ? (
                    <img 
                      src={featuredBlog.image} 
                      alt={featuredBlog.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1518770660439-4636190af475"
                      alt="Blog post illustration" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {blogs.length > 1 && (
          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4">
              View all articles
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
