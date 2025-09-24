
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


export const skillsSummary = {
  languages: ["Python", "JavaScript", "C", "Java", "SQL"],
  tools: [
    "Langchain",
    "Langraph",
    "RAG",
    "AWS Core Services (AWS Certified)",
    "Docker",
    "HuggingFace",
    "MLflow",
    "Git",
    "TensorFlow",
    "PyTorch",
    "Transformers",
    "Streamlit",
    "YOLO",
    "FastAPI",
    "React"
  ]
};

export const projects: Project[] = [
  {
    id: "recruitment-automation",
    title: "Recruitment Automation & Job Marketplace Platform",
    description: "Multi-Agent Recruitment Automation and Job Marketplace to Transform the hiring process with AI-powered recruitment platform that combines intelligent automation with human expertise ",
    image: "/images/projects/document-verification.jpg",
    tags: ["Agents", "LangGraph", "LLM"],
    techStack: ["LangGraph", "LangChain", "FastAPI", "ASR", "RAG"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/ConvexHire"
  },
  {
    id: "aws-fraud-detection",
    title: "Credit Card Fraud Detection on AWS",
    description: "real-time credit card fraud detection system built with AWS machine learning services, processing streaming transactions through the use of AWS Services for immediate fraud prevention.",
    image: "/images/projects/deepseek-medical.jpg",
    tags: ["AWS", "SageMaker", "MLOps"],
    techStack: ["Kinesis", "Lambda", "S3", "Glue", "SageMaker", "XGBoost"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/financial-transaction-fraud-detection-using-aws"
  },
  {
    id: "document-verification",
    title: "Document Verification System",
    description: "AI-driven document fraud detection using ResNet50, YOLOv8, and EasyOCR.",
    image: "/images/projects/document-verification.jpg",
    tags: ["Computer Vision", "OCR", "NLP"],
    techStack: ["ResNet50", "YOLOv8", "EasyOCR", "Regex", "Streamlit"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/Document-Verification-System"
  },
  {
    id: "aarthikniti",
    title: "AarthikNiti – Personal Finance Tool",
    description: "A powerful personal finance management application designed to help you track expenses, analyze income patterns, and achieve your financial goals with AI-powered insights.",
    image: "/images/projects/aarthikniti.jpg",
    tags: ["Finance", "OCR", "Analytics"],
    techStack: ["FastAPI", "Streamlit", "OCR", "Auth"],
    featured: true,
    categories: ["ai", "fullstack"],
    link: "https://aarthik-niti-expense-tracker.vercel.app/",
    github: "https://github.com/devrahulbanjara/AarthikNiti-Expense-Tracker"
  },
  {
    id: "deepseek-medical",
    title: "DeepSeek R1 Distill Llama 8B – Medical LoRA",
    description: "Fine-tuned the DeepSeek-R1-Distill-Llama-8B model for medical consultation tasks to provide accurate, reliable medical information and reasoning based on user queries, serving as a virtual medical consultant.",
    image: "/images/projects/deepseek-medical.jpg",
    tags: ["LLM", "LoRA", "Quantization"],
    techStack: ["PyTorch", "Unsloth", "PEFT", "Hugging Face"],
    featured: true,
    categories: ["ai"],
    github: "https://github.com/devrahulbanjara/DeepSeek-Finetuned-with-LoRA-on-Medical-Dataset"
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
    id: "adex-international",
    company: "Adex International, Lalitpur",
    position: "Associate AI/ML Engineer",
    startDate: "2025-06",
    endDate: "Present",
    description: [
      "Built Automatic Speech Recognition (ASR) system for realtime speech to text",
      "Developed practical curriculum for AWS Certified Machine Learning Engineer",
      "Created comprehensive resources for AWS MLA-C01 candidates from 101 to advanced topics",
      "Deployed website chatbot to answer all site-related queries",
      "Made a Document Verification Pipeline for Insurance Claim Documents",
      "Engineered a platform to identify all the resources creations on AWS based on tags for cost optimization.",
    ],
    technologies: ["ASR", "AWS", "LangChain", "FastAPI"]
  },
  {
    id: "fusemachines-2025",
    company: "Fusemachines",
    position: "AI Fellowship 2024",
    startDate: "2025-03",
    endDate: "2025-10",
    description: [
      "Built industry-grade CV and AI for Governance solutions",
      "End-to-end ML lifecycle and deployment experience",
      "Handled data shifts and real-world challenges",
      "Worked on sentiment analysis and text classification",
      "Research paper reading and SOTA implementations",
      "Training on supervised, unsupervised, and generative DL"
    ],
    technologies: ["PyTorch", "TensorFlow", "YOLOv8", "Transformers", "SageMaker"]
  }
];

export const certifications: Certification[] = [
  {
    title: "AWS Certified Machine Learning – Associate (MLA-C01)",
    issuer: "Amazon Web Services",
    date: "2025",
    link: "https://cp.certmetrics.com/amazon/en/public/verify/credential/035ddb7ca35541e0a815a122d7afcb84",
    image: "/images/certifications/aws-mla-c01.png"
  },
  {
    title: "Microdegree™ in Artificial Intelligence",
    issuer: "Fusemachines",
    date: "2024",
    link: "https://s3.amazonaws.com/fuseclassroom-resources-prod/student-certificates/Microdegree%E2%84%A2+in+Artificial+Intelligence-RAHUL+DEV+BANJARA.pdf",
    image: "/images/certifications/fusemachines-microdegree.png"
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
    school: "Herald College Kathmandu",
    location: "Naxal, Kathmandu",
    degree: "B.Hons in Computer Science",
    period: "2023–2026"
  },
  {
    school: "Capital College & Research Center",
    location: "Balkumari, Lalitpur",
    degree: "10+2 Computer Science | NEB",
    period: "2020–2022"
  }
];

export const personalInfo = {
  name: "Rahul Dev Banjara",
  title: "AI Engineer",
  email: "rdbanjara07@gmail.com",
  phone: "+977 9866121812",
  location: "Nepal",
  about: "AI/ML Engineer specializing in Computer Vision, NLP, and Generative AI, creating end-to-end intelligent systems with optimized models, full-stack deployment, and cost-efficient solutions on AWS.",
  social: {
    github: "https://github.com/devrahulbanjara",
    linkedin: "https://www.linkedin.com/in/devrahulbanjara/"
  },
  extras: "Community leader at AI Learners Community — organized workshops, demos, and mentorships."
};
