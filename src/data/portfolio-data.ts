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
  categories: ("ai" | "fullstack" | "other" | "college")[];
  category?: "ai" | "fullstack" | "other" | "college";
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
  { name: "Python", category: "languages", level: 65 },
  { name: "Java", category: "languages", level: 50 },
  { name: "C", category: "languages", level: 40 },
  { name: "PyTorch", category: "ml", level: 60 },
  { name: "TensorFlow", category: "ml", level: 50 },
  { name: "LLM Fine-tuning", category: "ml", level: 60 },
  { name: "LoRA", category: "ml", level: 60 },
  { name: "FastAPI", category: "frameworks", level: 70 },
  { name: "Flask", category: "frameworks", level: 65 },
  { name: "Docker", category: "tools", level: 70 },
  { name: "Git", category: "tools", level: 80 },
  { name: "Weights and Biases", category: "tools", level: 70 },
  { name: "MySQL", category: "tools", level: 70 },
  { name: "NumPy", category: "ml", level: 70 },
  { name: "Pandas", category: "ml", level: 70 },
  { name: "Computer Vision", category: "ml", level: 65 },
  { name: "NLP", category: "ml", level: 65 },
];

export const projects: Project[] = [
  {
    id: "nepali-paraphraser",
    title: "Nepali Language Paraphraser",
    description: "A Nepali paraphrasing system using NLP, built with Transformer-based models to generate contextually accurate paraphrases from input text in Devanagari script.",
    image: "/images/projects/nepali-paraphraser.jpg",
    tags: ["NLP", "Transformers", "Devanagari"],
    techStack: ["PyTorch", "Transformers", "NLTK", "FastAPI"],
    featured: true,
    categories: ["ai"]
  },
  {
    id: "deepseek-medical",
    title: "DeepSeek Medical LLM",
    description: "Fine-tuned the DeepSeek-R1-Distill-Llama-8B model using LoRA adapters on a medical consultation dataset.",
    image: "/images/projects/deepseek-medical.jpg",
    tags: ["LLM", "LoRA", "Healthcare"],
    techStack: ["PyTorch", "Unsloth", "PEFT", "Hugging Face"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/DeepSeek-Finetuned-with-LoRA-on-Medical-Dataset"
  },
  {
    id: "document-verification",
    title: "Document Verification System",
    description: "An intelligent system that verifies document authenticity using computer vision and NLP techniques.",
    image: "/images/projects/document-verification.jpg",
    tags: ["Computer Vision", "OCR", "NLP"],
    techStack: ["ResNet50", "YOLOv8", "EasyOCR", "NLP", "Streamlit"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/Document-Verification-System"
  },
  {
    id: "aarthikniti",
    title: "AarthikNiti",
    description: "Expense tracker application with ML-powered receipt scanner and integrated chatbot for financial insights.",
    image: "/images/projects/aarthikniti.jpg",
    tags: ["ML", "Finance", "API"],
    techStack: ["FastAPI", "ML", "Receipt Scanner", "Chatbot"],
    featured: true,
    categories: ["ai", "fullstack"],
    github: "https://github.com/devrahulbanjara/AarthikNiti-Expense-Tracker"
  },
  {
    id: "medical-chatbot",
    title: "Medical Chatbot",
    description: "RAG-based large language model chatbot for answering medical queries with accurate information.",
    image: "/images/projects/medical-chatbot.jpg",
    tags: ["RAG", "LLM", "Healthcare"],
    techStack: ["Pinecone", "Langchain", "Flask"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/Medical-Chatbot"
  },
  {
    id: "resume-sense",
    title: "Resume Sense",
    description: "Offline ATS resume analyzer that helps job seekers optimize their resumes without data privacy concerns.",
    image: "/images/projects/resume-sense.jpg",
    tags: ["LLM", "Document Analysis", "Offline"],
    techStack: ["Mistral", "Ollama"],
    featured: false,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/ResumeSense-AI-Powered-ATS-Resume-Analyzer"
  }
];

export const collegeProjects: Project[] = [
  {
    id: "water-quality",
    title: "Water Quality Predictor",
    description: "A machine learning project that predicts water potability using various water quality parameters.",
    image: "/images/projects/college/water-quality.jpg",
    tags: ["Machine Learning", "Classification", "Data Analysis"],
    techStack: ["Python", "Jupyter Notebook", "SciKit Learn"],
    featured: false,
    categories: ["college"]
  },
  {
    id: "smart-quiz",
    title: "Smart Quiz Hub",
    description: "A quiz management system with both GUI and console interface for creating, administering, and evaluating quizzes.",
    image: "/images/projects/college/smart-quiz.jpg",
    tags: ["GUI", "Database", "OOP"],
    techStack: ["Java", "MySQL", "Java Swing"],
    featured: false,
    categories: ["college"]
  },
  {
    id: "weather-app",
    title: "Weather Application",
    description: "A weather app using OpenWeatherMap API that stores data in MySQL and caches it in the browser.",
    image: "/images/projects/college/weather-app.jpg",
    tags: ["API", "Web", "Database"],
    techStack: ["PHP", "HTML", "CSS", "JavaScript", "MySQL"],
    featured: false,
    categories: ["college"]
  },
  {
    id: "banking-system",
    title: "Online Banking System",
    description: "A Java-based banking system demonstrating OOP principles with file handling and GUI.",
    image: "/images/projects/college/banking-system.jpg",
    tags: ["OOP", "GUI", "File Handling"],
    techStack: ["Java", "Java Swing", "MySQL"],
    featured: false,
    categories: ["college"]
  },
  {
    id: "tic-tac-toe",
    title: "Noughts and Crosses",
    description: "A console-based Tic-Tac-Toe game for two players with win/draw logic.",
    image: "/images/projects/college/tic-tac-toe.jpg",
    tags: ["Game", "Console", "Logic"],
    techStack: ["Python"],
    featured: false,
    categories: ["college"]
  },
  {
    id: "caesar-cipher",
    title: "Caesar Cipher",
    description: "A Python program to encrypt and decrypt messages from both console and file input.",
    image: "/images/projects/college/caesar-cipher.jpg",
    tags: ["Encryption", "File Handling", "Console"],
    techStack: ["Python"],
    featured: false,
    categories: ["college"]
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
  about: "Innovative ML Engineer skilled in computer vision, NLP, and LLM fine-tuning using PyTorch and TensorFlow. I specialize in optimizing large language models with techniques like LoRA and quantization. I build end-to-end AI solutions across healthcare, finance, and document processing, leveraging CNNs, Transformers, LLMs, and RAG. Passionate about scalable, efficient systems and applying cutting-edge research to real-world problems.",
  social: {
    github: "https://github.com/devrahulbanjara",
    linkedin: "https://www.linkedin.com/in/devrahulbanjara/"
  },
  extras: "Community leader at AI Learners Community — organized workshops, demos, and mentorships."
};
