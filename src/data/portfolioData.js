"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPERIENCES = exports.SKILL_CATEGORIES = exports.PROJECTS = exports.PROFILE = void 0;
exports.PROFILE = {
    name: "Ajay H",
    title: "Senior Full-Stack & AI Systems Engineer",
    tagline: "Architecting high-performance web applications, resilient distributed systems, and modern AI pipelines.",
    bio: "Passionate software engineer with deep expertise in modern TypeScript/Next.js architectures, scalable Node.js microservices, and AI-driven data intelligence. Dedicated to building world-class user experiences backed by robust, secure backend engines.",
    location: "Bengaluru, India",
    availability: "Available for high-impact roles & select consulting projects",
    email: "ajayhasrb123@gmail.com",
    socials: {
        github: "https://github.com/ajay9889-ai",
        linkedin: "https://linkedin.com",
        twitter: "https://x.com",
    },
    stats: [
        { label: "Years of Experience", value: "4+" },
        { label: "Projects Completed", value: "35+" },
        { label: "Production Deployments", value: "50+" },
        { label: "Code Quality SLA", value: "99.9%" }
    ]
};
exports.PROJECTS = [
    {
        id: "nara-ai-platform",
        title: "Nara AI — Autonomous Data Intelligence Platform",
        slug: "nara-ai",
        tagline: "Automated multi-dataset statistical analysis, truth-gate verification, and LangGraph business insights engine.",
        description: "An enterprise-grade analytical intelligence platform featuring automated CSV/Parquet profiling, statistical KPI computation, AST-sandboxed SQL execution, and multi-tenant RBAC.",
        category: "AI & ML",
        technologies: ["Next.js 15", "TypeScript", "Python", "FastAPI", "DuckDB", "PostgreSQL", "Tailwind CSS", "LangGraph"],
        featured: true,
        metrics: [
            { label: "Query Latency", value: "< 45ms" },
            { label: "Test Pass Rate", value: "100%" },
            { label: "Engine Speed", value: "10k rows/s" }
        ],
        githubUrl: "https://github.com/nara-ai-tech",
        liveUrl: "https://nara.ai"
    },
    {
        id: "cinematic-motion-studio",
        title: "Cinematic 60FPS Launch Film Studio",
        slug: "motion-studio",
        tagline: "Hardware-accelerated web animation engine with audio-sync timeline choreography.",
        description: "An interactive 75-second high-end product film renderer built with requestAnimationFrame time orchestration, Web Audio narrator cues, and multi-camera smooth zoom interpolation.",
        category: "Frontend",
        technologies: ["Next.js 15", "React 19", "Framer Motion", "Web Audio API", "Canvas 2D", "Tailwind CSS"],
        featured: true,
        metrics: [
            { label: "Frame Rate", value: "Locked 60 FPS" },
            { label: "Audio Precision", value: "Sub-millisecond" }
        ],
        githubUrl: "https://github.com/ajay9889-ai",
        liveUrl: "http://localhost:5000/promo"
    },
    {
        id: "cloud-distributed-ledger",
        title: "High-Concurrency Credit & Billing Ledger",
        slug: "credit-ledger",
        tagline: "ACID-compliant reservation-hold and settlement engine with idempotent idempotency locks.",
        description: "A distributed financial balance engine supporting 2-phase hold/settle semantics, cryptographic service-to-service JWT verification, and automated stripe webhook reconciliation.",
        category: "Systems & Cloud",
        technologies: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "Zod", "Vitest"],
        featured: true,
        metrics: [
            { label: "Concurrency", value: "5,000 req/s" },
            { label: "Ledger Drift", value: "0.00%" }
        ],
        githubUrl: "https://github.com/ajay9889-ai"
    },
    {
        id: "saas-dashboard-pro",
        title: "Nexus — Enterprise Analytics & KPI Studio",
        slug: "nexus-analytics",
        tagline: "Real-time data visualization dashboard with drag-and-drop widget canvas.",
        description: "Modular dashboard builder supporting custom formula metric calculations, live WebSocket streams, and high-performance SVG/Canvas charting.",
        category: "Full Stack",
        technologies: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Chart.js", "PostgreSQL"],
        featured: false,
        metrics: [
            { label: "Live Charts", value: "50+ Types" },
            { label: "Export Formats", value: "PDF, SVG, CSV" }
        ],
        githubUrl: "https://github.com/ajay9889-ai"
    }
];
exports.SKILL_CATEGORIES = [
    {
        category: "Frontend Engineering",
        skills: [
            { name: "Next.js 15 & React 19", level: 95, icon: "SiNextdotjs", highlight: true },
            { name: "TypeScript", level: 95, icon: "SiTypescript", highlight: true },
            { name: "Tailwind CSS & Design Systems", level: 92, icon: "SiTailwindcss", highlight: true },
            { name: "Framer Motion & Animations", level: 88, icon: "SiFramer" },
            { name: "State Management (Zustand/Redux)", level: 90, icon: "SiRedux" },
            { name: "Web Audio & Media APIs", level: 85, icon: "SiHtml5" }
        ]
    },
    {
        category: "Backend & Distributed Systems",
        skills: [
            { name: "Node.js & Express / NestJS", level: 94, icon: "SiNodedotjs", highlight: true },
            { name: "Python & FastAPI", level: 90, icon: "SiFastapi", highlight: true },
            { name: "REST & GraphQL API Architecture", level: 92, icon: "SiGraphql" },
            { name: "Microservices & Event-Driven Systems", level: 88, icon: "SiApachekafka" },
            { name: "Authentication (OAuth2, JWT, RBAC)", level: 92, icon: "SiJsonwebtokens" }
        ]
    },
    {
        category: "Databases & Storage",
        skills: [
            { name: "PostgreSQL & Supabase", level: 92, icon: "SiPostgresql", highlight: true },
            { name: "DuckDB & SQLite Engine", level: 88, icon: "SiSqlite" },
            { name: "Redis & In-Memory Caching", level: 90, icon: "SiRedis" },
            { name: "ChromaDB & Vector Stores (pgvector)", level: 85, icon: "SiOpenai" }
        ]
    },
    {
        category: "AI, ML & Data Pipelines",
        skills: [
            { name: "LangGraph & LangChain Agents", level: 90, icon: "SiOpenai", highlight: true },
            { name: "Gemini & OpenAI API Integration", level: 92, icon: "SiGoogle" },
            { name: "Data Profiling & Automated EDA", level: 88, icon: "SiPandas" },
            { name: "Prompt Engineering & Guardrails", level: 92, icon: "SiShieldsdotio" }
        ]
    },
    {
        category: "DevOps & Cloud Tools",
        skills: [
            { name: "Docker & Containerization", level: 88, icon: "SiDocker", highlight: true },
            { name: "Git, GitHub Actions & CI/CD", level: 90, icon: "SiGithubactions" },
            { name: "AWS / GCP Cloud Storage & Compute", level: 85, icon: "SiGooglecloud" },
            { name: "Vercel & Render Cloud Hosting", level: 92, icon: "SiVercel" }
        ]
    }
];
exports.EXPERIENCES = [
    {
        id: "exp-1",
        role: "Lead Full-Stack & AI Systems Architect",
        company: "Nara AI Technologies",
        period: "2024 — Present",
        location: "Bengaluru, India",
        type: "Full-time",
        description: [
            "Architected and deployed end-to-end analytical intelligence engine processing multi-gigabyte datasets with sub-second response times.",
            "Engineered 75s launch film platform with Web Audio streaming, high-fps camera zoom transforms, and responsive timeline model.",
            "Implemented strict RBAC, multi-tenant workspace isolation, and automated credit reservation/settlement ledgers with zero balance drift."
        ],
        skills: ["Next.js 15", "TypeScript", "Python", "FastAPI", "PostgreSQL", "DuckDB", "Tailwind CSS"]
    },
    {
        id: "exp-2",
        role: "Senior Software Engineer (Full Stack)",
        company: "Venture Data Labs",
        period: "2022 — 2024",
        location: "Bengaluru, India",
        type: "Full-time",
        description: [
            "Built modular business dashboard generator with interactive visualization components and dynamic export engines.",
            "Designed resilient REST API gateway handling over 10M monthly requests with rate limiting and automated circuit breakers.",
            "Spearheaded frontend migration to React with TypeScript, cutting bundle sizes by 42% and raising Lighthouse performance score to 98."
        ],
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "AWS"]
    }
];
