export interface Skill {
  name: string;
  icon?: string;
  category: "languages" | "frameworks" | "tools" | "ml" | "other";
  level?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  techStack: string[];
  link?: string;
  github?: string;
  featured: boolean;
  category: "ai" | "fullstack" | "other";
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | "Present";
  description: string[];
  technologies: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  link?: string;
  image?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  link: string;
  featured: boolean;
  image?: string;
}

export const skills: Skill[] = [
  { name: "Python", category: "languages", level: 95 },
  { name: "Java", category: "languages", level: 80 },
  { name: "C", category: "languages", level: 75 },
  { name: "PyTorch", category: "ml", level: 90 },
  { name: "TensorFlow", category: "ml", level: 85 },
  { name: "FastAPI", category: "frameworks", level: 85 },
  { name: "Flask", category: "frameworks", level: 80 },
  { name: "Docker", category: "tools", level: 75 },
  { name: "Git", category: "tools", level: 85 },
  { name: "MLflow", category: "tools", level: 70 },
  { name: "MySQL", category: "tools", level: 80 },
  { name: "NumPy", category: "ml", level: 90 },
  { name: "Pandas", category: "ml", level: 90 },
  { name: "Computer Vision", category: "ml", level: 85 },
  { name: "NLP", category: "ml", level: 80 },
];

export const projects: Project[] = [
  {
    id: "document-verification",
    title: "Document Verification System",
    description: "An intelligent system that verifies document authenticity using computer vision and NLP techniques.",
    image: "/images/projects/document-verification.jpg",
    tags: ["Computer Vision", "OCR", "NLP"],
    techStack: ["ResNet50", "YOLOv8", "EasyOCR", "NLP", "Streamlit"],
    featured: true,
    category: "ai"
  },
  {
    id: "aarthikniti",
    title: "AarthikNiti",
    description: "Expense tracker application with ML-powered receipt scanner and integrated chatbot for financial insights.",
    image: "/images/projects/aarthikniti.jpg",
    tags: ["ML", "Finance", "API"],
    techStack: ["FastAPI", "ML", "Receipt Scanner", "Chatbot"],
    featured: true,
    category: "fullstack"
  },
  {
    id: "medical-chatbot",
    title: "Medical Chatbot",
    description: "RAG-based large language model chatbot for answering medical queries with accurate information.",
    image: "/images/projects/medical-chatbot.jpg",
    tags: ["RAG", "LLM", "Healthcare"],
    techStack: ["Pinecone", "Langchain", "Flask"],
    featured: true,
    category: "ai"
  },
  {
    id: "resume-sense",
    title: "Resume Sense",
    description: "Offline ATS resume analyzer that helps job seekers optimize their resumes without data privacy concerns.",
    image: "/images/projects/resume-sense.jpg",
    tags: ["LLM", "Document Analysis", "Offline"],
    techStack: ["Mistral", "Ollama"],
    featured: false,
    category: "ai"
  },
  {
    id: "potato-disease",
    title: "Potato Disease Classifier",
    description: "CNN-based classifier that identifies diseases in potato plants using leaf images for early detection.",
    image: "/images/projects/potato-disease.jpg",
    tags: ["CNN", "Agriculture", "Classification"],
    techStack: ["CNN", "Computer Vision", "TensorFlow"],
    featured: false,
    category: "ai"
  }
];

export const experiences: Experience[] = [
  {
    id: "fusemachines",
    company: "Fusemachines",
    position: "AI Fellowship",
    startDate: "2024-04",
    endDate: "2024-09",
    description: [
      "Engineered industry-grade AI for Governance & CV solutions",
      "Worked with SOTA models: ResNet, YOLOv8, Llama 3.1",
      "Hands-on end-to-end ML pipeline design",
      "Group collaboration and research paper review"
    ],
    technologies: ["PyTorch", "TensorFlow", "YOLOv8", "Llama 3.1", "ResNet"]
  }
];

export const certifications: Certification[] = [
  {
    title: "Microdegree™ in Artificial Intelligence",
    issuer: "Fusemachines",
    date: "2024-09",
  },
  {
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI",
    date: "2024-03",
  },
  {
    title: "Python 3 Programming",
    issuer: "University of Michigan",
    date: "2023-11",
  }
];

export const blogs: BlogPost[] = [
  {
    id: "yolov8-document",
    title: "Using YOLOv8 to Localize Key Regions in Document Images",
    description: "Learn how to use YOLOv8 to detect and localize important regions in document images for automated processing and verification.",
    date: "2024-02-15",
    link: "https://devrahulbanjara.medium.com/using-yolov8-to-localize-key-regions-in-document-images-1c51d2e44643",
    featured: true,
    image: "/images/blog/yolov8-document.jpg"
  }
];

export const education = [
  {
    school: "Herald College",
    location: "Kathmandu",
    degree: "B.Hons Computer Science",
    period: "2023–2026"
  },
  {
    school: "Capital College & Research Center",
    location: "Kathmandu",
    degree: "10+2",
    period: "2021–2023"
  }
];

export const personalInfo = {
  name: "Rahul Dev Banjara",
  title: "Machine Learning Engineer",
  email: "rdbanjara07@gmail.com",
  phone: "+977 9866121812",
  location: "Nepal",
  about: "Innovative ML Engineer skilled in computer vision and NLP using PyTorch and TensorFlow. I build end-to-end AI solutions across healthcare, finance, and document processing, leveraging CNNs, Transformers, LLMs, and RAG. Passionate about scalable, efficient systems and applying cutting-edge research to real-world problems.",
  social: {
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  extras: "Community leader at AI Learners Community — organized workshops, demos, and mentorships."
};
