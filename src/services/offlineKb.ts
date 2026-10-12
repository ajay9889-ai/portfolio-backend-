/**
 * offlineKb.ts
 * Standalone offline knowledge engine and system prompt for the portfolio AI assistant.
 * Used by chatController when Gemini is unavailable, rate-limited, or for quick offline replies.
 */

export const SYSTEM_INSTRUCTION = `
You are Ajay's official AI Portfolio Assistant — a warm, confident, and highly knowledgeable voice and chat agent embedded in Ajay A's personal portfolio website.

═══════════════════════════════════════════════════════
ABOUT AJAY A
═══════════════════════════════════════════════════════
• Full Name: Ajay A
• Location: Bengaluru, Karnataka, India
• Role Title: Full-Stack Developer & AI Systems Engineer
• Personal Email: ajayhasrb123@gmail.com
• GitHub: https://github.com/ajay9889-ai
• LinkedIn: https://linkedin.com/in/ajay-a
• Portfolio: This very website you are on!

═══════════════════════════════════════════════════════
EDUCATION
═══════════════════════════════════════════════════════
1. MCA (Master of Computer Applications)
   • Institution: BMS Institute of Technology and Management (BMSIT&M), Bengaluru
   • Period: 2023 – 2025
   • CGPA: 8.5 / 10
   • Focus: Software Engineering, Full-Stack Web Architecture, Scalable Databases
   • Achievement: HackVerse 2025 Hackathon Winner (ElderNest project)

2. BCA (Bachelor of Computer Applications)
   • Institution: Government First Grade College, Sorab, Karnataka
   • Period: 2020 – 2023
   • CGPA: 8.2 / 10
   • Focus: Computer Science fundamentals — C, Java, Python, Web Development, Database Management

═══════════════════════════════════════════════════════
WORK EXPERIENCE
═══════════════════════════════════════════════════════
Software Development Engineer Intern — BrikUp, Bengaluru
• Built and optimized production features using React.js, Next.js, JavaScript, and Tailwind CSS
• Integrated REST APIs for data retrieval, authentication, user profiles, bookings, and reviews
• Debugged complex API and data-rendering issues across the application
• Ran functional testing across login, onboarding, profile, booking, and review flows
• Used Git/GitHub with branch-based collaborative development
• Gained real-world experience shipping features to production under deadlines

═══════════════════════════════════════════════════════
FEATURED PROJECTS
═══════════════════════════════════════════════════════

1. ElderNest — 🏆 1st Place Winner at HackVerse 2025
   • What: An empathetic, WCAG-compliant assistive web platform for elderly users
   • Features: Real-time emergency SOS dispatching, high-contrast accessible interface, voice-assisted navigation, community peer interaction spaces
   • Tech: React.js, Next.js, Tailwind CSS, REST APIs, Node.js
   • Impact: Won 1st Place at HackVerse 2025 hackathon for exceptional accessibility engineering, empathetic UX, and robust API integration
   • Problem Solved: Elderly individuals face digital exclusion from cluttered modern UIs — ElderNest provides ultra-clean, large-target, high-legibility interfaces

2. WisdomPlay — Multilingual Educational Game
   • What: Interactive educational gaming environment for learning curriculum concepts across Indian regional languages
   • Features: Dynamic JSON-driven quiz engines, responsive 2D animation controllers, audio cues, modular level architectures, on-the-fly language switching
   • Tech: Unity, C#, JSON, Audio Systems, Animation Controllers
   • Impact: Lightweight, responsive educational experience supporting rapid content additions without game rebuilds

3. Smart Attendance System — IoT/Hardware Automation
   • What: End-to-end automated attendance pipeline using RFID hardware
   • Features: RFID card readers → Python processing bridge → MySQL database, sub-400ms verification, automated Excel/CSV reports
   • Tech: Python, RFID Hardware, MySQL, Node.js, REST APIs
   • Impact: Zero queuing bottlenecks, instant automated end-of-day attendance summaries

═══════════════════════════════════════════════════════
TECHNICAL SKILLS
═══════════════════════════════════════════════════════
Frontend: React.js, Next.js 15/16 (App Router), TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Responsive Design, Framer Motion, Three.js
Backend & APIs: Node.js, Express.js, Python, REST APIs, JWT Authentication, WebSocket, Socket.IO
Databases: PostgreSQL, MongoDB, MySQL, Supabase, Prisma ORM
DevOps & Cloud: Git, GitHub, Docker, Vercel, Render, Linux, basic AWS
Game Dev: Unity, C#
Hardware/IoT: RFID integration, Python hardware bridges
AI/ML: LLM API integration (Gemini), AI-powered features in web apps

═══════════════════════════════════════════════════════
AVAILABILITY & CONTACT RULES
═══════════════════════════════════════════════════════
• When asked about Ajay's availability, call the \`get_availability\` tool. Never guess or hallucinate his current schedule.
• When a visitor says "send a message to Ajay", "mail him", "I want to hire him", or expresses desire to contact him:
  1. Detect intent and collect required fields conversationally: Name, Email, and Message.
  2. Optional fields: Company, Purpose (hiring / freelance / collaboration / other).
  3. Once all required fields are collected, invoke the \`send_message_to_ajay\` tool with the collected arguments.
  4. In voice mode, keep questions concise (1-2 sentences). For email in voice mode, ask them to spell it or offer the on-screen form.
• You can also direct visitors to the Contact form or ajayhasrb123@gmail.com.
• Response time: Typically within 24 hours.

═══════════════════════════════════════════════════════
TOOLS & ACTIONS
═══════════════════════════════════════════════════════
You have tools available:
- \`scroll_to\`: Smooth scroll to sections: hero, about, skills, work, experience, contact.
- \`open_project\`: Scroll and highlight project card ('ElderNest', 'WisdomPlay', 'Smart Attendance').
- \`show_resume\`: Guide visitor to resume / contact.
- \`open_contact_form\`: Scroll to contact section.
- \`change_theme\`: Switch theme ('dark' or 'light').
- \`show_skills\`: Scroll to skills section.
- \`get_availability\`: Retrieve Ajay's current availability status and note.
- \`send_message_to_ajay\`: Forward visitor message draft to client.

═══════════════════════════════════════════════════════
RESPONSE INSTRUCTIONS
═══════════════════════════════════════════════════════
• Be professional, confident, warm, and natural.
• Keep responses conversational — typically 2-3 sentences — optimized for voice readout.
• Avoid complex markdown tables or excessive bullet points that sound unnatural when read aloud.
• Always give direct, helpful answers grounded in Ajay's actual data above.
• Never invent facts not listed above. If you don't know something, say so and suggest contacting Ajay directly.
`.trim();

export interface PatternRule {
  keywords: string[];
  response: string;
}

export const KNOWLEDGE_BASE: PatternRule[] = [
  // ── Greetings & Small Talk ──
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo'],
    response: "Hey there! 👋 I'm Ajay's AI Assistant. I can tell you all about his projects, tech stack, work experience, and availability. What would you like to know?",
  },
  {
    keywords: ['how are you', 'how do you do', "what's up", 'whats up'],
    response: "I'm doing great, thanks for asking! I'm here to help you learn about Ajay — his projects, skills, and availability for roles. What can I help with?",
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'thanks', 'thank you', 'thankyou'],
    response: "Thanks for chatting! If you'd like to connect with Ajay, use the Contact form below or email him at ajayhasrb123@gmail.com. Have a great day! 🙌",
  },
  {
    keywords: ['who are you', 'your name', 'are you ai', 'are you a bot', 'are you real', 'what is your name'],
    response: "I'm Ajay's AI Portfolio Assistant — a smart voice and chat agent built right into this portfolio website. I know everything about Ajay's background, projects, and skills. Ask me anything!",
  },

  // ── About Ajay ──
  {
    keywords: ['who is ajay', 'tell me about ajay', 'about ajay', 'introduce ajay', 'about yourself', 'introduce yourself', 'about him'],
    response: "Ajay A is a Full-Stack Developer & AI Systems Engineer based in Bengaluru, India. He holds an MCA from BMSIT&M with an 8.5 CGPA, won 1st place at HackVerse 2025, and interned as an SDE at BrikUp. He builds web products from frontend to API and works on AI-powered solutions.",
  },
  {
    keywords: ['where is ajay', 'location', 'city', 'where does ajay live', 'based in', 'from where'],
    response: "Ajay is based in Bengaluru, Karnataka, India — one of India's biggest tech hubs. He's open to both on-site and remote opportunities!",
  },

  // ── Education ──
  {
    keywords: ['education', 'degree', 'college', 'university', 'qualification', 'study', 'studied', 'academic'],
    response: "Ajay holds an MCA from BMS Institute of Technology and Management (BMSIT&M), Bengaluru with an 8.5 CGPA (2023–2025), and a BCA from Government First Grade College, Sorab with an 8.2 CGPA (2020–2023).",
  },
  {
    keywords: ['mca', 'masters', 'post graduation', 'bmsit', 'bms institute'],
    response: "Ajay completed his MCA (Master of Computer Applications) from BMSIT&M, Bengaluru (2023–2025) with an excellent 8.5 CGPA. He specialized in Software Engineering, Full-Stack Web Architecture, and Scalable Databases.",
  },
  {
    keywords: ['bca', 'bachelors', 'undergraduate', 'sorab', 'graduation'],
    response: "Ajay earned his BCA from Government First Grade College, Sorab, Karnataka (2020–2023) with an 8.2 CGPA. He built a strong foundation in Computer Science, C, Java, Python, and Database Management.",
  },
  {
    keywords: ['cgpa', 'gpa', 'marks', 'score', 'grades', 'percentage'],
    response: "Ajay scored an 8.5 CGPA in his MCA from BMSIT&M, Bengaluru and an 8.2 CGPA in his BCA from Government First Grade College, Sorab. Consistently strong academic performance!",
  },

  // ── Work Experience ──
  {
    keywords: ['brikup', 'intern', 'internship', 'experience', 'work experience', 'company', 'job', 'sde intern', 'professional'],
    response: "Ajay interned as a Software Development Engineer at BrikUp in Bengaluru. He shipped production features using Next.js and TypeScript, engineered secure REST authentication flows, integrated APIs for profiles and bookings, debugged data-rendering issues, and practiced Git-based collaborative development.",
  },
  {
    keywords: ['what did ajay do at', 'what did he do', 'what was his role', 'responsibilities'],
    response: "At BrikUp, Ajay built and optimized production frontend features with React.js and Next.js, integrated REST APIs for authentication and data flows, debugged complex rendering issues, ran functional testing across multiple flows, and used Git/GitHub for team collaboration.",
  },

  // ── ElderNest Project ──
  {
    keywords: ['eldernest', 'elder nest', 'hackverse', 'hackathon', 'award', 'winner', 'prize', 'first place', '1st place', 'elderly', 'senior citizen', 'accessible'],
    response: "ElderNest won 1st Place at HackVerse 2025! 🏆 It's an empathetic, WCAG-compliant web platform for elderly users featuring real-time emergency SOS dispatching, high-contrast accessible UI, voice-assisted navigation, and community peer interaction. Built with React, Next.js, Tailwind CSS, and Node.js.",
  },

  // ── WisdomPlay Project ──
  {
    keywords: ['wisdomplay', 'wisdom play', 'game', 'unity', 'educational', 'multilingual', 'quiz'],
    response: "WisdomPlay is a multilingual educational game built in Unity and C#. It features dynamic JSON-driven quizzes, responsive 2D animation controllers, audio cues, and modular level architectures. It supports on-the-fly language switching across Indian regional languages without requiring game rebuilds.",
  },

  // ── Smart Attendance System ──
  {
    keywords: ['attendance', 'iot', 'rfid', 'hardware', 'smart attendance', 'card reader', 'scanner'],
    response: "The Smart Attendance System is an IoT automation solution connecting RFID card readers to a Python processing bridge and MySQL database. It achieves sub-400ms contactless attendance scans with zero queuing and generates automated Excel/CSV attendance reports.",
  },

  // ── Projects General ──
  {
    keywords: ['projects', 'what has ajay built', 'portfolio projects', 'what did ajay build', 'show projects', 'your projects', 'his projects'],
    response: "Ajay has three featured projects: 1) ElderNest — HackVerse 2025 winner for elderly accessibility. 2) WisdomPlay — a multilingual educational Unity game. 3) Smart Attendance System — an IoT RFID solution with sub-400ms scans. You can explore each in detail on this portfolio!",
  },
  {
    keywords: ['live project', 'live projects', 'live demo', 'live demos', 'live link', 'live links', 'deployments', 'working demo', 'launch app'],
    response: "Ajay has interactive live deployments right on this portfolio in the Live Projects section! You can launch live web demos of ElderNest, WisdomPlay, and the Smart Attendance System directly in your browser.",
  },

  // ── Tech Stack & Skills ──
  {
    keywords: ['skills', 'skill', 'what are your skills', 'what are his skills', 'tech stack', 'technology', 'technologies', 'stack', 'what does ajay use', 'tools', 'technical skills'],
    response: "Ajay's core technical skills & stack: Frontend — React, Next.js 15/16, TypeScript, Tailwind CSS, Three.js. Backend — Node.js, Express, Python, REST APIs, WebSockets. Databases — PostgreSQL, MongoDB, MySQL. DevOps — Git, Docker, Vercel, Linux. Plus Unity for game dev and AI/LLM integrations.",
  },
  {
    keywords: ['frontend', 'front end', 'front-end', 'ui', 'user interface', 'react', 'nextjs', 'next.js'],
    response: "On the frontend, Ajay works with React.js, Next.js 15/16 (App Router), TypeScript, Tailwind CSS, HTML5, CSS3, Framer Motion for animations, and Three.js for 3D graphics. This very portfolio is built with Next.js 16 and Three.js!",
  },
  {
    keywords: ['backend', 'back end', 'back-end', 'server', 'api', 'node', 'express'],
    response: "For backend development, Ajay uses Node.js, Express.js, Python, REST APIs, JWT authentication, and WebSocket/Socket.IO for real-time communication. He's comfortable building scalable API architectures from scratch.",
  },
  {
    keywords: ['database', 'db', 'sql', 'nosql', 'postgres', 'mongo', 'mysql', 'data storage'],
    response: "Ajay works with PostgreSQL, MongoDB, MySQL, Supabase, and Prisma ORM. He can handle both relational and NoSQL databases depending on project requirements.",
  },
  {
    keywords: ['devops', 'deployment', 'cloud', 'docker', 'aws', 'vercel', 'hosting', 'ci cd', 'git'],
    response: "For DevOps, Ajay uses Git/GitHub, Docker, Vercel, Render, and Linux. He has basic AWS experience and is comfortable deploying applications to production environments.",
  },
  {
    keywords: ['typescript', 'javascript', 'programming language', 'languages', 'coding language'],
    response: "Ajay is proficient in TypeScript, JavaScript, Python, C#, and has foundational knowledge of C and Java. TypeScript and JavaScript are his primary languages for full-stack web development.",
  },
  {
    keywords: ['tailwind', 'css', 'styling', 'design', 'responsive'],
    response: "Ajay uses Tailwind CSS extensively for styling — it's his go-to for rapid, responsive, and premium UI development. He also works with vanilla CSS3 and Framer Motion for complex animations.",
  },
  {
    keywords: ['three.js', 'threejs', '3d', 'animation', 'canvas', 'webgl'],
    response: "Yes! Ajay works with Three.js for 3D web graphics. The animated 3D orbit canvas you see on this portfolio's background is built with Three.js — featuring dynamic geometry, orbiting particles, and accent-colored lighting.",
  },
  {
    keywords: ['ai', 'machine learning', 'ml', 'artificial intelligence', 'llm', 'gemini', 'chatbot'],
    response: "Ajay integrates AI and LLM capabilities into web applications. This very AI assistant you're chatting with is powered by Gemini with a comprehensive portfolio knowledge base. He builds AI-powered features like voice agents and intelligent chat interfaces.",
  },

  // ── Hiring & Availability ──
  {
    keywords: ['hire', 'hiring', 'recruit', 'available', 'availability', 'open to work', 'looking for'],
    response: "Yes! Ajay is actively available for full-time Software Engineering roles, contracts, and freelance projects. Reach out via the Contact form below or email him directly at ajayhasrb123@gmail.com — he typically responds within 24 hours!",
  },
  {
    keywords: ['freelance', 'freelancer', 'contract', 'project', 'collaboration', 'work together', 'build something'],
    response: "Absolutely! Ajay takes on freelance projects and collaborations. Whether it's building a web app, designing an API, or creating an AI-powered feature, he's happy to discuss. Use the Contact form or email ajayhasrb123@gmail.com!",
  },
  {
    keywords: ['send message', 'send mail', 'send email', 'mail him', 'email him', 'mail ajay', 'write to ajay', 'send an email', 'i want to send a mail', 'i want to message him'],
    response: "What message would you like to send to Ajay? Please tell me your message, and I'll ask for your name and email so he can get back to you.",
  },
  {
    keywords: ['contact', 'reach', 'get in touch', 'connect', 'talk', 'how to reach'],
    response: "You can send Ajay a message right here through this assistant or using the Contact section below. You can also email him directly at ajayhasrb123@gmail.com — he typically responds within 24 hours!",
  },
  {
    keywords: ['resume', 'cv', 'download resume', 'pdf'],
    response: "For Ajay's detailed resume, please contact him directly at ajayhasrb123@gmail.com or ask me to scroll to his Contact section. You can also review his full project history right here!",
  },
  {
    keywords: ['salary', 'pay', 'compensation', 'rate', 'charge', 'cost', 'pricing'],
    response: "For discussions about compensation and rates, please contact Ajay directly at ajayhasrb123@gmail.com or use the Contact form. He's flexible and open to discussing terms based on the project scope.",
  },

  // ── Portfolio & Navigation ──
  {
    keywords: ['portfolio', 'website', 'this site', 'this website', 'how was this built', 'how did you build'],
    response: "This portfolio is built with Next.js 16, TypeScript, Tailwind CSS, Three.js for the 3D animated background, and features a theme-adaptive dark/light mode, AI voice & chat assistant, contact form with email delivery, and live project reactions.",
  },
  {
    keywords: ['dark mode', 'light mode', 'theme', 'toggle'],
    response: "This portfolio supports both dark mode (sleek obsidian with solar orange accents) and light mode (clean cream with vibrant orange highlights). Use the sun/moon toggle in the navigation bar to switch!",
  },
  {
    keywords: ['voice', 'voice agent', 'speak', 'microphone', 'talk to you', 'voice chat'],
    response: "Yes! I have a full voice mode — click the voice tab, speak naturally, and I'll listen and respond with natural voice synthesis. You can switch between Voice and Chat anytime!",
  },

  // ── GitHub & Social ──
  {
    keywords: ['github', 'source code', 'repository', 'repos', 'open source'],
    response: "Check out Ajay's GitHub at github.com/ajay9889-ai for source code and repositories. He uses Git and GitHub extensively for version control and collaborative development.",
  },
  {
    keywords: ['linkedin', 'social', 'social media', 'profile'],
    response: "You can find Ajay on LinkedIn at linkedin.com/in/ajay-a. Feel free to connect and reach out for opportunities or collaborations!",
  },
  {
    keywords: ['instagram', 'insta', 'the___ajay______', 'qr code', 'instagram qr', 'scan qr'],
    response: "You can follow Ajay on Instagram @the___ajay______ at instagram.com/the___ajay______. You can also scan his interactive Instagram QR code directly in the Contact section of this portfolio!",
  },

  // ── Strengths & Values ──
  {
    keywords: ['strength', 'best at', 'good at', 'specializ', 'expert', 'strong'],
    response: "Ajay's core strengths: Full-stack web development with React/Next.js and Node.js, building accessible and visually premium user interfaces, API architecture, AI/LLM integration, and delivering production-ready code under deadlines.",
  },
  {
    keywords: ['why should i hire', 'why ajay', 'what makes ajay different', 'unique', 'stand out'],
    response: "Ajay stands out because he combines strong full-stack engineering with a keen eye for design and AI integration. He won 1st at HackVerse 2025, ships production code (proven at BrikUp), and builds premium user experiences like this portfolio.",
  },

  // ── Indian Language / Hinglish Patterns ──
  {
    keywords: ['namaste', 'namaskar', 'vanakkam', 'kem cho', 'sat sri akal', 'pranam', 'namskar'],
    response: "Namaste! 🙏 I am Ajay's AI assistant. Ajay is a Full-Stack Developer from Bengaluru. Feel free to ask me anything about his projects, skills, or how to contact him!",
  },
  {
    keywords: ['kaise ho', 'kaisa hai', 'theek ho', 'sab theek', 'kaisa chal raha'],
    response: "Main bilkul theek hoon! Aur aap? Main yahan Ajay ke baare mein aapke sawaalon ka jawaab dene ke liye hoon — unke projects, skills, aur work experience ke baare mein bataiye!",
  },
  {
    keywords: ['ajay kaun hai', 'ajay ke baare mein', 'ajay kahan se hai', 'ajay ki details'],
    response: "Ajay A ek Full-Stack Developer hain Bengaluru se. Unhone HackVerse 2025 hackathon mein 1st place jeeta ElderNest project ke saath, aur BrikUp mein SDE intern the. Woh React, Next.js, Node.js, aur AI systems mein expert hain!",
  },
  {
    keywords: ['hire karna hai', 'kaam chahiye', 'available hai kya', 'join kar sakta hai'],
    response: "Haan! Ajay full-time software engineering roles, contracts, aur freelance projects ke liye available hain. Contact form use karein ya seedha email karein ajayhasrb123@gmail.com par — woh 24 ghanton mein reply karte hain!",
  },
];

export function getIntelligentPortfolioReply(message: string): string {
  if (!message || typeof message !== 'string') {
    return "Ajay A is a Full-Stack Developer & AI Systems Engineer based in Bengaluru. Feel free to ask about his projects, tech stack, or connect at ajayhasrb123@gmail.com!";
  }

  // 1. Phonetic voice speech normalization
  let query = message.toLowerCase().trim();
  query = query
    .replace(/\b(elder\s*nest|older\s*nest|alder\s*nest)\b/gi, 'eldernest')
    .replace(/\b(wisdom\s*play)\b/gi, 'wisdomplay')
    .replace(/\b(brick\s*up|break\s*up|bric\s*up|brickup)\b/gi, 'brikup')
    .replace(/\b(hack\s*verse|hackers\s*2025)\b/gi, 'hackverse')
    .replace(/\b(bms\s*it|bmsit\s*m)\b/gi, 'bmsit')
    .replace(/\b(smart\s*attendance|rfid\s*attendance)\b/gi, 'smart attendance')
    .replace(/\b(r\s*j|a\s*j)\b/gi, 'ajay');

  // Clean punctuation for word-level matching
  const cleanQuery = query.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  let bestRule: PatternRule | null = null;
  let highestScore = 0;

  for (const rule of KNOWLEDGE_BASE) {
    let ruleScore = 0;

    for (const keyword of rule.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Exact query match
      if (cleanQuery === lowerKeyword || query === lowerKeyword) {
        ruleScore += 100;
        continue;
      }

      // Exact phrase match in query (multi-word keyword)
      if (lowerKeyword.includes(' ') && cleanQuery.includes(lowerKeyword)) {
        ruleScore += lowerKeyword.length * 4;
        continue;
      }

      // Word boundary match
      const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(cleanQuery)) {
        ruleScore += Math.max(10, lowerKeyword.length * 3);
      }
    }

    if (ruleScore > highestScore) {
      highestScore = ruleScore;
      bestRule = rule;
    }
  }

  // Threshold check: if score is sufficient, return best matched rule
  if (bestRule && highestScore >= 8) {
    return bestRule.response;
  }

  // Smart default
  return "Ajay A is a Full-Stack Developer & AI Systems Engineer based in Bengaluru. He won 1st place at HackVerse 2025 with ElderNest, interned as an SDE at BrikUp, and specializes in React, Next.js, Node.js, and AI integrations. Feel free to ask about his projects, tech stack, or reach out at ajayhasrb123@gmail.com!";
}
