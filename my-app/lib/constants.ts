export const CODING_LEVELS = ["BEGINNER", "INTERMEDIATE", "EXPERT"] as const;
export const IDEA_VISIBILITY = [
  "DRAFT",
  "PUBLISHED",
  "NEEDS_REFINEMENT",
] as const;
export const REVIEW_STATUS = [
  "PENDING_REVIEW",
  "REVIEWED",
  "ERROR",
] as const;
export const QUALITY_BANDS = [
  "NEEDS_REVISION",
  "GOOD",
  "STRONG",
  "EXCELLENT",
] as const;
export const IMPLEMENTATION_STATUS = ["IN_PROGRESS", "BUILT"] as const;
export const MEMBER_ROLES = ["LEAD", "TEAMMATE"] as const;
export const JOIN_REQUEST_STATUS = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export const SOCIAL_LINK_TYPES = [
  "GITHUB",
  "LINKEDIN",
  "DISCORD",
  "TWITTER",
  "PORTFOLIO",
  "OTHER",
] as const;
export const REVIEW_JOB_STATUS = [
  "QUEUED",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
] as const;

export const IMAGE_LIMITS = {
  profile: {
    maxBytes: 2_000_000,
    maxWidth: 512,
    maxHeight: 512,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  },
  screenshot: {
    maxBytes: 900_000,
    maxLongEdge: 1600,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  },
} as const;

export const STORAGE_BUCKETS = {
  profileImages: "profile-images",
  ideaScreenshots: "idea-screenshots",
} as const;

export const SKILL_SUGGESTIONS = {
  frontend: [
    "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SolidJS", "Remix", "Astro", "TypeScript",
    "JavaScript", "HTML", "CSS", "SCSS", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Shadcn UI",
    "Redux", "Zustand", "React Query", "Framer Motion", "Webpack", "Vite", "Parcel",
  ],
  backend: [
    "Node.js", "Express.js", "NestJS", "Fastify", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot",
    "PHP", "Laravel", "CodeIgniter", "Go", "Gin", "Rust", "Actix", "C", "C++", "C#", ".NET", "Ruby on Rails",
    "REST API", "GraphQL", "gRPC", "WebSockets",
  ],
  database: [
    "MongoDB", "PostgreSQL", "MySQL", "MariaDB", "SQLite", "Redis", "Firebase", "Firestore", "Supabase",
    "Appwrite", "PlanetScale", "Neon", "Prisma", "Drizzle ORM", "TypeORM", "Mongoose", "Sequelize",
  ],
  devops: [
    "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Cloudflare", "Vercel", "Netlify", "Render", "Railway",
    "DigitalOcean", "NGINX", "Apache", "Linux", "Ubuntu", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins",
    "Terraform", "Ansible", "Prometheus", "Grafana",
  ],
  mobile: [
    "React Native", "Expo", "Flutter", "Dart", "Swift", "SwiftUI", "Kotlin", "Jetpack Compose",
    "Android Development", "iOS Development", "Ionic",
  ],
  ai: [
    "OpenAI", "LangChain", "LlamaIndex", "RAG", "Vector Databases", "Pinecone", "ChromaDB", "FAISS",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Computer Vision", "NLP", "LLMs",
    "Prompt Engineering", "AI Agents", "Hugging Face",
  ],
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Insomnia", "VS Code", "Cursor", "Figma", "Adobe XD",
    "Notion", "Jira", "Slack", "npm", "pnpm", "yarn", "Bun", "ESLint", "Prettier",
  ],
  cybersecurity: [
    "Burp Suite", "Nmap", "Metasploit", "Wireshark", "OWASP", "Penetration Testing", "Ethical Hacking",
    "Reverse Engineering", "Malware Analysis", "CTF", "Network Security", "Web Security",
  ],
  blockchain: [
    "Solidity", "Ethereum", "Web3.js", "Ethers.js", "Smart Contracts", "Hardhat", "Foundry", "IPFS", "Blockchain Development",
  ],
  dataScience: [
    "Pandas", "NumPy", "Matplotlib", "Power BI", "Tableau", "Data Analysis", "Data Visualization", "Statistics",
    "Big Data", "Apache Spark",
  ],
} as const;
