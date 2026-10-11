export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: "Full Stack" | "AI & ML" | "Systems & IoT" | "Game Dev";
  technologies: string[];
  featured: boolean;
  badge?: string;
  metrics?: { label: string; value: string }[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface SkillCategory {
  category: string;
  skills: { name: string; level: number; icon: string; highlight?: boolean }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  type: "Full-time" | "Contract" | "Internship" | "Freelance";
  description: string[];
  skills: string[];
}

export const PROFILE = {
  name: "Ajay A",
  title: "Full-Stack Developer & AI Systems Engineer",
  tagline: "Building high-impact web products from the interface to the API, from Bengaluru.",
  bio: "MCA graduate passionate about shipping React and Next.js applications, wiring them to scalable APIs, and engineering AI-powered features. HackVerse 2025 winner. Software development intern at BrikUp, building production features.",
  location: "Bengaluru, Karnataka, India",
  availability: "Available for full-time roles, contracts & freelance projects",
  email: "ajayhasrb123@gmail.com",
  socials: {
    github: "https://github.com/ajay9889-ai",
    linkedin: "https://linkedin.com/in/ajay-a",
    twitter: "https://x.com",
  },
  stats: [
    { label: "MCA CGPA", value: "8.5" },
    { label: "Projects Built", value: "3+" },
    { label: "Hackathon Win", value: "1st 🏆" },
    { label: "Available", value: "Now" }
  ]
};

export const PROJECTS: Project[] = [
  {
    id: "eldernest",
    title: "ElderNest",
    slug: "eldernest",
    badge: "HackVerse 2025 — 1st Place 🏆",
    tagline: "Empathetic, WCAG-compliant assistive web platform for elderly users.",
    description: "ElderNest is an empathetic assistive web platform designed for senior citizens. It pairs high-contrast WCAG-compliant design with peer community spaces and immediate one-tap emergency SOS assistance dispatching.",
    category: "Full Stack",
    technologies: ["React.js", "Next.js", "Tailwind CSS", "REST APIs", "Node.js"],
    featured: true,
    metrics: [
      { label: "Hackathon Rank", value: "1st Place" },
      { label: "Accessibility", value: "WCAG AAA" },
      { label: "Features", value: "SOS + Community" }
    ],
    githubUrl: "https://github.com/ajay9889-ai"
  },
  {
    id: "wisdomplay",
    title: "WisdomPlay",
    slug: "wisdomplay",
    tagline: "Multilingual educational Unity game with dynamic JSON-driven quizzes and audio cues.",
    description: "An interactive educational gaming environment designed to teach core curriculum concepts across multiple Indian regional languages via dynamic JSON-driven questions, responsive 2D animation controllers, and audio cues.",
    category: "Game Dev",
    technologies: ["Unity", "C#", "JSON", "Audio Systems", "Animation Controller"],
    featured: true,
    metrics: [
      { label: "Languages", value: "Multi-lingual" },
      { label: "Content System", value: "JSON-driven" },
      { label: "Platform", value: "Unity 2D" }
    ],
    githubUrl: "https://github.com/ajay9889-ai"
  },
  {
    id: "smart-attendance-system",
    title: "Smart Attendance System",
    slug: "smart-attendance-system",
    tagline: "IoT/RFID automated attendance pipeline with sub-400ms scans and auto-reports.",
    description: "Hardware-to-cloud automated attendance pipeline utilizing high-frequency RFID scanners, Python processing bridge, MySQL database logging, and automated CSV/Excel administrative reports.",
    category: "Systems & IoT",
    technologies: ["Python", "RFID Hardware", "MySQL", "Node.js", "REST APIs"],
    featured: true,
    metrics: [
      { label: "Scan Latency", value: "< 400ms" },
      { label: "Reports", value: "Auto CSV/Excel" },
      { label: "Queuing", value: "Zero" }
    ],
    githubUrl: "https://github.com/ajay9889-ai"
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React.js", level: 90, icon: "SiReact", highlight: true },
      { name: "Next.js 15/16 (App Router)", level: 90, icon: "SiNextdotjs", highlight: true },
      { name: "TypeScript", level: 85, icon: "SiTypescript", highlight: true },
      { name: "Tailwind CSS", level: 92, icon: "SiTailwindcss" },
      { name: "Framer Motion", level: 80, icon: "SiFramer" },
      { name: "Three.js", level: 75, icon: "SiThreedotjs" }
    ]
  },
  {
    category: "Backend & APIs",
    skills: [
      { name: "Node.js", level: 88, icon: "SiNodedotjs", highlight: true },
      { name: "Express.js", level: 85, icon: "SiExpress" },
      { name: "Python", level: 82, icon: "SiPython" },
      { name: "REST API Design", level: 88, icon: "SiPostman" },
      { name: "JWT Authentication", level: 85, icon: "SiJsonwebtokens" },
      { name: "WebSocket / Socket.IO", level: 78, icon: "SiSocketdotio" }
    ]
  },
  {
    category: "Databases",
    skills: [
      { name: "PostgreSQL", level: 85, icon: "SiPostgresql", highlight: true },
      { name: "MongoDB", level: 82, icon: "SiMongodb" },
      { name: "MySQL", level: 85, icon: "SiMysql" },
      { name: "Supabase", level: 78, icon: "SiSupabase" },
      { name: "Prisma ORM", level: 80, icon: "SiPrisma" }
    ]
  },
  {
    category: "DevOps & Tools",
    skills: [
      { name: "Git & GitHub", level: 90, icon: "SiGit", highlight: true },
      { name: "Docker", level: 75, icon: "SiDocker" },
      { name: "Vercel", level: 88, icon: "SiVercel" },
      { name: "Render", level: 82, icon: "SiRender" },
      { name: "Linux", level: 78, icon: "SiLinux" },
      { name: "AWS (Basic)", level: 65, icon: "SiAmazonaws" }
    ]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "brikup-intern",
    role: "Software Development Engineer Intern",
    company: "BrikUp",
    period: "Internship",
    location: "Bengaluru, India",
    type: "Internship",
    description: [
      "Built and optimized production features using React.js, Next.js, JavaScript, and Tailwind CSS.",
      "Integrated REST APIs for data retrieval, authentication, user profiles, bookings, and reviews.",
      "Debugged complex API and data-rendering issues across multiple application views.",
      "Ran functional testing across login, onboarding, profile, booking, and review flows.",
      "Used Git/GitHub with branch-based collaborative development workflow."
    ],
    skills: ["React.js", "Next.js", "JavaScript", "Tailwind CSS", "REST APIs", "Git", "GitHub"]
  },
  {
    id: "mca-bmsit",
    role: "MCA Student — Full Stack & AI Focus",
    company: "BMS Institute of Technology and Management",
    period: "2023 — 2025",
    location: "Bengaluru, India",
    type: "Full-time",
    description: [
      "Specialized in Software Engineering, Full-Stack Web Architecture, and Scalable Databases.",
      "Won 1st Place at HackVerse 2025 Hackathon with ElderNest — an accessible assistive platform for elderly users.",
      "Graduated with 8.5 CGPA."
    ],
    skills: ["React.js", "Node.js", "Next.js", "Python", "PostgreSQL", "MongoDB", "System Design"]
  }
];
