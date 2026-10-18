import type {
  Alumni,
  Student,
  Mentorship,
  Conversation,
  Notification,
  CareerRoadmap,
  ResumeReview,
  DashboardStats,
  RoadmapStage,
  DemoActivity,
  RecommendedAlumni,
  UserSettings,
  MentorshipActivityData,
} from "@/types";

// ─── Current User (Student) ───────────────────────────────────────────────────

export const currentStudent: Student = {
  id: "s-001",
  userId: "u-001",
  name: "Ashlin",
  avatar: undefined,
  headline: "Second-year Computer Science student · Aspiring Full-Stack Software Engineer",
  university: "University of Technology",
  department: "Computer Science",
  graduationYear: 2027,
  academicYear: "Second Year",
  careerGoal: "Full-Stack Software Engineer",
  skills: [
    { id: "sk-1", name: "Python", level: "intermediate" },
    { id: "sk-2", name: "JavaScript", level: "intermediate" },
    { id: "sk-3", name: "React", level: "intermediate" },
    { id: "sk-4", name: "Django", level: "beginner" },
    { id: "sk-5", name: "SQL", level: "intermediate" },
  ],
  interests: [
    { id: "i-1", name: "Web Development" },
    { id: "i-2", name: "Distributed Systems" },
    { id: "i-3", name: "Open Source" },
  ],
  careerGoals: [
    "Full-Stack Software Engineer",
    "Master cloud-native architecture & modern web tooling",
    "Secure a high-impact software engineering internship",
  ],
  projects: [
    "Alumni Mentorship Platform",
    "Real-time Chat Engine with WebSockets",
    "Distributed Task Queue in Python",
  ],
  bio: "Second-year CS student eager to build scalable web applications. Currently focused on modern full-stack frameworks, REST APIs, and database optimization.",
  resumeUrl: undefined,
  profileCompletionPercent: 90,
};

// ─── Alumni Data ──────────────────────────────────────────────────────────────

export const alumniData: (Alumni & { experienceYears?: string })[] = [
  {
    id: "rec-001",
    userId: "u-rec-1",
    name: "Marcus Vance",
    avatar: undefined,
    headline: "Senior Backend Engineer at Datadog · Ex-Google",
    location: "San Francisco, CA",
    company: "Datadog",
    role: "Backend Engineer",
    graduationYear: 2020,
    department: "Computer Science",
    degree: "B.S. in Computer Science",
    industry: "Cloud & Observability",
    yearsOfExperience: 5,
    experienceYears: "5+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Python", level: "expert" },
      { id: "sk-2", name: "Django", level: "expert" },
      { id: "sk-3", name: "PostgreSQL", level: "expert" },
      { id: "sk-4", name: "AWS", level: "advanced" },
      { id: "sk-5", name: "Redis", level: "advanced" },
      { id: "sk-6", name: "Docker", level: "advanced" },
    ],
    interests: [
      { id: "i-1", name: "Distributed Systems" },
      { id: "i-2", name: "Database Internals" },
      { id: "i-3", name: "Open Source" },
    ],
    workExperience: [
      {
        id: "we-rec-1",
        company: "Datadog",
        role: "Senior Backend Engineer",
        startYear: 2022,
        current: true,
        description: "Scaling high-throughput ingestion pipelines processing 2M events/sec in Python and Go with PostgreSQL.",
      },
      {
        id: "we-rec-2",
        company: "Google",
        role: "Software Engineer",
        startYear: 2020,
        endYear: 2022,
        current: false,
        description: "Built Cloud SQL reliability and automated migration toolsets for relational database instances.",
      },
    ],
    education: [
      {
        id: "edu-rec-1",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2020,
      },
    ],
    bio: "Senior backend engineer with 5+ years of experience building resilient microservices and distributed database systems. I went through the campus recruitment cycle myself and love helping motivated students bridge the gap between classroom theory and production engineering standards.",
    linkedinUrl: "https://linkedin.com/in/marcusvance-demo",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "Backend Architecture & Schema Design",
      "Django API Optimization",
      "Technical Problem Solving & LeetCode",
      "Career Navigation in Big Tech",
    ],
    mentorshipInterests: [
      "Early-career software engineering roadmaps",
      "Transitioning from university assignments to scalable production systems",
      "System design fundamentals & mock technical interviews",
    ],
    areasOfExpertise: [
      "Scalable REST & gRPC API Design",
      "PostgreSQL Indexing, Partitioning & Query Plans",
      "High-Concurrency Caching with Redis",
      "Docker & Cloud-Native Containerization",
    ],
    projects: [
      {
        id: "proj-m1",
        title: "High-Throughput Metric Ingestion Engine",
        description: "Engineered a distributed telemetry pipeline handling 2M events/sec with sub-50ms p99 latency.",
        techStack: ["Python", "Go", "PostgreSQL", "Kafka", "Docker"],
      },
      {
        id: "proj-m2",
        title: "django-query-batcher (Open Source)",
        description: "A popular open-source utility for optimizing N+1 query patterns in Django ORM batching operations.",
        techStack: ["Python", "Django", "PostgreSQL"],
      },
    ],
    responseRate: 96,
    averageResponseTime: "within 24 hours",
    totalMentees: 15,
    matchScore: 96,
    matchExplanation: "Direct stack match: Shares your core Python & Django skills and provides deep mentorship in PostgreSQL schema design.",
    lastActive: "Active today",
  },
  {
    id: "rec-002",
    userId: "u-rec-2",
    name: "Elena Rostova",
    avatar: undefined,
    headline: "Staff Software Engineer at Airbnb · Payments & Core Flow",
    location: "Seattle, WA",
    company: "Airbnb",
    role: "Software Engineer",
    graduationYear: 2019,
    department: "Computer Science",
    degree: "B.S. in Computer Science",
    industry: "Travel Tech & Hospitality",
    yearsOfExperience: 6,
    experienceYears: "6+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Java", level: "expert" },
      { id: "sk-2", name: "Spring Boot", level: "expert" },
      { id: "sk-3", name: "SQL", level: "expert" },
      { id: "sk-4", name: "React", level: "advanced" },
      { id: "sk-5", name: "TypeScript", level: "advanced" },
      { id: "sk-6", name: "Microservices", level: "expert" },
    ],
    interests: [
      { id: "i-1", name: "Enterprise Architecture" },
      { id: "i-2", name: "Web Performance" },
      { id: "i-3", name: "Mentorship for Women in Tech" },
    ],
    workExperience: [
      {
        id: "we-rec-3",
        company: "Airbnb",
        role: "Staff Software Engineer",
        startYear: 2021,
        current: true,
        description: "Lead engineer for transactional payment pipelines and multi-tenant booking services.",
      },
      {
        id: "we-rec-4",
        company: "Microsoft",
        role: "Software Engineer II",
        startYear: 2019,
        endYear: 2021,
        current: false,
        description: "Built Azure Commerce platform transactional APIs using Java Spring Boot and React.",
      },
    ],
    education: [
      {
        id: "edu-rec-2",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2019,
      },
    ],
    bio: "Staff engineer with 6+ years across big tech and growth-stage companies. Passionate about end-to-end full-stack software development: building reliable transactional backends and pairing them with polished, responsive React web frontends.",
    linkedinUrl: "https://linkedin.com/in/elenarostova-demo",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "Full-Stack Software Engineering",
      "Enterprise Backend Systems (Java/Spring Boot/SQL)",
      "System Design & Resume Critique",
      "Internship & New Grad Hiring Loops",
    ],
    mentorshipInterests: [
      "Full-stack architecture & React state management",
      "Transitioning from internship to full-time engineering hire",
      "Code review standards & team engineering practices",
    ],
    areasOfExpertise: [
      "Full-Stack Web Architecture (React + Java/Node)",
      "Relational SQL Schema Design & Transactions",
      "Resilient Microservices & Fault Tolerance",
      "Design Systems & Component Libraries",
    ],
    projects: [
      {
        id: "proj-e1",
        title: "Global Booking Checkout Architecture",
        description: "Redesigned the core multi-currency booking flow supporting 50M+ guest reservations annually.",
        techStack: ["Java", "Spring Boot", "React", "TypeScript", "SQL"],
      },
      {
        id: "proj-e2",
        title: "Distributed Transaction Ledger",
        description: "Created an idempotent financial reconciliation service processing high-volume merchant disbursements.",
        techStack: ["Java", "Kafka", "PostgreSQL"],
      },
    ],
    responseRate: 92,
    averageResponseTime: "within 2 days",
    totalMentees: 11,
    matchScore: 91,
    matchExplanation: "Aligns with your Full-Stack goal: Brings heavy SQL expertise, React knowledge, and enterprise software engineering leadership.",
    lastActive: "Active yesterday",
  },
  {
    id: "rec-003",
    userId: "u-rec-3",
    name: "Dr. Aisha Al-Mansoor",
    avatar: undefined,
    headline: "Senior AI Engineer at Cohere · Foundation Models & Serving",
    location: "New York, NY",
    company: "Cohere",
    role: "AI Engineer",
    graduationYear: 2018,
    department: "Computer Science",
    degree: "Ph.D. in Computer Science",
    industry: "Artificial Intelligence & LLMs",
    yearsOfExperience: 7,
    experienceYears: "7+ years experience",
    isVerified: false,
    skills: [
      { id: "sk-1", name: "Python", level: "expert" },
      { id: "sk-2", name: "Machine Learning", level: "expert" },
      { id: "sk-3", name: "Model Deployment", level: "expert" },
      { id: "sk-4", name: "FastAPI", level: "advanced" },
      { id: "sk-5", name: "PyTorch", level: "expert" },
      { id: "sk-6", name: "Docker", level: "advanced" },
    ],
    interests: [
      { id: "i-1", name: "Generative AI" },
      { id: "i-2", name: "Model Serving Latency" },
      { id: "i-3", name: "AI Safety" },
    ],
    workExperience: [
      {
        id: "we-rec-5",
        company: "Cohere",
        role: "Senior AI Engineer",
        startYear: 2022,
        current: true,
        description: "Designing inference infrastructure and fine-tuning pipelines for enterprise language models.",
      },
      {
        id: "we-rec-6",
        company: "Meta",
        role: "Research Engineer",
        startYear: 2018,
        endYear: 2022,
        current: false,
        description: "Applied AI research on conversational systems and tokenization architectures.",
      },
    ],
    education: [
      {
        id: "edu-rec-3",
        institution: "University of Technology",
        degree: "M.S. & Ph.D.",
        field: "Computer Science",
        graduationYear: 2018,
      },
    ],
    bio: "Bridging the gap between software engineering and modern AI model deployment. Eager to help motivated undergraduates learn how to turn raw machine learning scripts into production-ready web APIs.",
    linkedinUrl: "https://linkedin.com/in/aisha-almansoor-demo",
    mentorshipAvailability: "limited",
    mentorshipAreas: [
      "AI Engineering & Model Deployment",
      "Python in Production",
      "Transitioning from SWE to Applied AI",
      "Publishing & Portfolio Projects",
    ],
    mentorshipInterests: [
      "Deploying PyTorch & HuggingFace models behind FastAPI",
      "Graduate studies vs industry tech careers",
      "Evaluating open-source generative AI toolkits",
    ],
    areasOfExpertise: [
      "Low-Latency Model Serving Architecture",
      "Vector Databases & Semantic Embeddings Search",
      "Python Performance Profiling",
      "Containerized ML Pipelines",
    ],
    projects: [
      {
        id: "proj-a1",
        title: "Enterprise LLM Inference Gateway",
        description: "Built a streaming token inference gateway supporting dynamic batching and sub-20ms first-token latency.",
        techStack: ["Python", "FastAPI", "PyTorch", "Docker"],
      },
      {
        id: "proj-a2",
        title: "Semantic Search Indexer",
        description: "Automated document chunking and vector index creation over 10M+ technical documentation pages.",
        techStack: ["Python", "LangChain", "PostgreSQL pgvector"],
      },
    ],
    responseRate: 85,
    averageResponseTime: "within 3 days",
    totalMentees: 8,
    matchScore: 88,
    matchExplanation: "Expands your capabilities: Builds upon your Python base to guide you in production model deployment and modern AI system integration.",
    lastActive: "Active 3 days ago",
  },
  {
    id: "a-001",
    userId: "u-101",
    name: "Arjun Mehta",
    avatar: undefined,
    headline: "Senior Product Manager at Stripe · Ex-SWE",
    location: "San Francisco, CA",
    company: "Stripe",
    role: "Product Manager",
    graduationYear: 2018,
    department: "Computer Science & Engineering",
    degree: "B.S. in Computer Science",
    industry: "FinTech & Payments",
    yearsOfExperience: 7,
    experienceYears: "7+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Product Strategy", level: "expert" },
      { id: "sk-2", name: "A/B Testing", level: "expert" },
      { id: "sk-3", name: "SQL", level: "advanced" },
      { id: "sk-4", name: "Roadmapping", level: "expert" },
      { id: "sk-5", name: "User Research", level: "advanced" },
      { id: "sk-6", name: "Python", level: "intermediate" },
    ],
    interests: [
      { id: "i-1", name: "FinTech" },
      { id: "i-2", name: "Payments Infrastructure" },
      { id: "i-3", name: "Developer Tools" },
    ],
    workExperience: [
      {
        id: "we-1",
        company: "Stripe",
        role: "Senior Product Manager",
        startYear: 2022,
        current: true,
        description: "Leading payments infrastructure products serving 100K+ merchants globally.",
      },
      {
        id: "we-2",
        company: "Google",
        role: "Product Manager",
        startYear: 2019,
        endYear: 2022,
        current: false,
        description: "Worked on Google Pay merchant integrations and developer APIs.",
      },
      {
        id: "we-3",
        company: "Amazon",
        role: "Software Development Engineer",
        startYear: 2018,
        endYear: 2019,
        current: false,
        description: "Backend catalog ingestion services.",
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2018,
      },
    ],
    bio: "I transitioned from software engineering to product management and have helped 14+ students navigate the same career pivot. I focus on practical, actionable guidance rather than generic motivational advice.",
    linkedinUrl: "https://linkedin.com/in/arjunmehta",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "SWE to PM transition",
      "FinTech career paths",
      "Product interviews & case prep",
      "Resume & portfolio strategy",
    ],
    mentorshipInterests: [
      "Crafting compelling product case studies",
      "Technical product interview frameworks",
      "Communicating engineering trade-offs to business stakeholders",
    ],
    areasOfExpertise: [
      "Product Requirements Documents (PRDs)",
      "Quantitative Experimentation & A/B Testing",
      "FinTech Compliance & Payment Rails",
    ],
    projects: [
      {
        id: "proj-am1",
        title: "Global Merchant Onboarding Revamp",
        description: "Reduced merchant sign-up drop-off by 34% through automated KYC verification.",
        techStack: ["SQL", "A/B Testing", "Python"],
      },
    ],
    responseRate: 92,
    averageResponseTime: "within 1 day",
    totalMentees: 14,
    matchScore: 78,
    matchExplanation: "Offers perspective on the software-to-product path, cross-functional leadership, and data-driven prioritization.",
    lastActive: "Active today",
  },
  {
    id: "a-002",
    userId: "u-102",
    name: "Neha Kapoor",
    avatar: undefined,
    headline: "Engineering Manager at Airbnb · Core Booking",
    location: "San Francisco, CA",
    company: "Airbnb",
    role: "Engineering Manager",
    graduationYear: 2016,
    department: "Computer Science & Engineering",
    degree: "B.S. in Computer Science",
    industry: "Travel Tech & Hospitality",
    yearsOfExperience: 9,
    experienceYears: "9+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Engineering Leadership", level: "expert" },
      { id: "sk-2", name: "System Design", level: "expert" },
      { id: "sk-3", name: "Java", level: "expert" },
      { id: "sk-4", name: "React", level: "advanced" },
      { id: "sk-5", name: "Team Building", level: "expert" },
    ],
    interests: [
      { id: "i-1", name: "Engineering Culture" },
      { id: "i-2", name: "Distributed Systems" },
      { id: "i-3", name: "Travel Tech" },
    ],
    workExperience: [
      {
        id: "we-201",
        company: "Airbnb",
        role: "Engineering Manager",
        startYear: 2021,
        current: true,
        description: "Managing 3 teams building Airbnb's core booking infrastructure.",
      },
      {
        id: "we-202",
        company: "Airbnb",
        role: "Senior Software Engineer",
        startYear: 2018,
        endYear: 2021,
        current: false,
      },
      {
        id: "we-203",
        company: "LinkedIn",
        role: "Software Engineer",
        startYear: 2016,
        endYear: 2018,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-201",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2016,
      },
    ],
    bio: "Engineering leader passionate about growing engineers into their best selves. I mentor students interested in software engineering, engineering management, and building lasting careers in tech.",
    linkedinUrl: "https://linkedin.com/in/nehakapoor",
    mentorshipAvailability: "limited",
    mentorshipAreas: [
      "SWE interview prep",
      "Engineering management",
      "Career growth in tech",
    ],
    mentorshipInterests: [
      "Long-term career ladders in tech",
      "Interview behavioral loops",
      "System design principles",
    ],
    areasOfExpertise: [
      "Engineering Leadership",
      "Distributed Systems Architecture",
      "Mentoring & Career Coaching",
    ],
    projects: [
      {
        id: "proj-nk1",
        title: "Airbnb Booking Resiliency Framework",
        description: "Orchestrated zero-downtime database failovers across AWS multi-region setups.",
        techStack: ["Java", "Distributed Systems", "AWS"],
      },
    ],
    responseRate: 78,
    averageResponseTime: "within 3 days",
    totalMentees: 9,
    matchScore: 82,
    matchExplanation: "Mentors on engineering rigor, system design interviews, and building sustainable technical careers.",
    lastActive: "Active 2 days ago",
  },
  {
    id: "a-003",
    userId: "u-103",
    name: "Rohan Verma",
    avatar: undefined,
    headline: "Staff Data Scientist at Netflix · Personalization & ML",
    location: "Los Angeles, CA",
    company: "Netflix",
    role: "Data Scientist",
    graduationYear: 2019,
    department: "Statistics & Data Science",
    degree: "M.S. in Applied Statistics",
    industry: "Consumer Media & Streaming",
    yearsOfExperience: 6,
    experienceYears: "6+ years experience",
    isVerified: false,
    skills: [
      { id: "sk-1", name: "Python", level: "expert" },
      { id: "sk-2", name: "Machine Learning", level: "expert" },
      { id: "sk-3", name: "SQL", level: "advanced" },
      { id: "sk-4", name: "Spark", level: "advanced" },
      { id: "sk-5", name: "A/B Testing", level: "expert" },
      { id: "sk-6", name: "Data Storytelling", level: "advanced" },
    ],
    interests: [
      { id: "i-1", name: "Recommendation Systems" },
      { id: "i-2", name: "Streaming Media" },
      { id: "i-3", name: "Consumer Behavior" },
    ],
    workExperience: [
      {
        id: "we-301",
        company: "Netflix",
        role: "Data Scientist",
        startYear: 2021,
        current: true,
        description: "Building recommendation algorithms for 250M+ subscribers.",
      },
      {
        id: "we-302",
        company: "Spotify",
        role: "Data Analyst",
        startYear: 2019,
        endYear: 2021,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-301",
        institution: "University of Technology",
        degree: "M.S.",
        field: "Applied Statistics",
        graduationYear: 2019,
      },
    ],
    bio: "Data scientist building algorithms that reach millions of viewers every day. Love helping students break into data science roles at top consumer tech companies.",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "Data science interviews",
      "Python & ML foundations",
      "Breaking into tech from non-CS",
    ],
    mentorshipInterests: [
      "Large-scale recommendation algorithms",
      "Production SQL & PySpark optimization",
      "Portfolio projects that impress hiring managers",
    ],
    areasOfExpertise: [
      "Recommender Systems & Ranking",
      "Statistical Experimentation",
      "Big Data Processing with Spark",
    ],
    projects: [
      {
        id: "proj-rv1",
        title: "Netflix Dynamic Thumbnail Selector",
        description: "Implemented contextual multi-armed bandit algorithm testing personalized artwork variants.",
        techStack: ["Python", "Spark", "SQL", "A/B Testing"],
      },
    ],
    responseRate: 88,
    averageResponseTime: "within 2 days",
    totalMentees: 6,
    matchScore: 76,
    matchExplanation: "Matches your Python and SQL background with practical guidance on building intelligent data-backed applications.",
    lastActive: "Active yesterday",
  },
  {
    id: "a-004",
    userId: "u-104",
    name: "Sanya Gupta",
    avatar: undefined,
    headline: "UX Design Lead at Microsoft · Teams & Accessibility",
    location: "Seattle, WA",
    company: "Microsoft",
    role: "UX Designer",
    graduationYear: 2017,
    department: "Information Science",
    degree: "B.S. in Information Science",
    industry: "Enterprise Software & UX",
    yearsOfExperience: 8,
    experienceYears: "8+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "UX Research", level: "expert" },
      { id: "sk-2", name: "Figma", level: "expert" },
      { id: "sk-3", name: "Design Systems", level: "expert" },
      { id: "sk-4", name: "Prototyping", level: "expert" },
      { id: "sk-5", name: "Accessibility", level: "advanced" },
      { id: "sk-6", name: "React", level: "intermediate" },
    ],
    interests: [
      { id: "i-1", name: "Accessibility" },
      { id: "i-2", name: "Enterprise UX" },
      { id: "i-3", name: "Inclusive Design" },
    ],
    workExperience: [
      {
        id: "we-401",
        company: "Microsoft",
        role: "UX Design Lead",
        startYear: 2022,
        current: true,
        description: "Leading design for Microsoft Teams accessibility features.",
      },
      {
        id: "we-402",
        company: "Microsoft",
        role: "Senior UX Designer",
        startYear: 2019,
        endYear: 2022,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-401",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Information Science",
        graduationYear: 2017,
      },
    ],
    bio: "Design leader focused on building digital products that work for everyone. I particularly enjoy mentoring students who want to build strong design-developer collaboration skills.",
    mentorshipAvailability: "available",
    mentorshipAreas: ["UX portfolio reviews", "Design interviews", "Career pivots into design"],
    mentorshipInterests: [
      "Connecting Figma tokens to React component libraries",
      "Designing accessible WCAG-compliant UI patterns",
    ],
    areasOfExpertise: [
      "Enterprise Design Systems",
      "Usability Testing & Feedback Loops",
      "Figma to Code Workflows",
    ],
    projects: [
      {
        id: "proj-sg1",
        title: "Microsoft Teams Inclusive Meeting HUD",
        description: "Redesigned real-time captions and high-contrast meeting tools used by 300M+ monthly users.",
        techStack: ["Figma", "Design Systems", "Accessibility"],
      },
    ],
    responseRate: 95,
    averageResponseTime: "within 1 day",
    totalMentees: 11,
    matchScore: 68,
    matchExplanation: "Helps full-stack engineers design intuitive, accessible user interfaces and translate designs into code.",
    lastActive: "Active today",
  },
  {
    id: "a-005",
    userId: "u-105",
    name: "Vikram Nair",
    avatar: undefined,
    headline: "Venture Capital Associate at Sequoia · Enterprise SaaS",
    location: "Menlo Park, CA",
    company: "Sequoia Capital",
    role: "Associate",
    graduationYear: 2020,
    department: "Electrical Engineering & CS",
    degree: "B.S. in Electrical Engineering & CS",
    industry: "Venture Capital & SaaS",
    yearsOfExperience: 5,
    experienceYears: "5+ years experience",
    isVerified: false,
    skills: [
      { id: "sk-1", name: "Venture Capital", level: "advanced" },
      { id: "sk-2", name: "Financial Modeling", level: "advanced" },
      { id: "sk-3", name: "Market Research", level: "expert" },
      { id: "sk-4", name: "Startup Evaluation", level: "advanced" },
      { id: "sk-5", name: "Python", level: "intermediate" },
    ],
    interests: [
      { id: "i-1", name: "Early-stage Investing" },
      { id: "i-2", name: "B2B SaaS" },
      { id: "i-3", name: "AI & ML" },
    ],
    workExperience: [
      {
        id: "we-501",
        company: "Sequoia Capital",
        role: "Associate",
        startYear: 2022,
        current: true,
        description: "Sourcing and evaluating early-stage investments in enterprise software.",
      },
      {
        id: "we-502",
        company: "Goldman Sachs",
        role: "Investment Banking Analyst",
        startYear: 2020,
        endYear: 2022,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-501",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Electrical Engineering & Computer Science",
        graduationYear: 2020,
      },
    ],
    bio: "From engineering to investment banking to early-stage VC — happy to talk with students about technical founder paths, startup valuations, and non-traditional careers in tech finance.",
    mentorshipAvailability: "limited",
    mentorshipAreas: ["Breaking into VC", "Finance from STEM", "Startup ideation & pitch decks"],
    mentorshipInterests: [
      "Commercializing technical research into venture-backed startups",
      "Understanding venture metrics (CAC, LTV, Net Retention)",
    ],
    areasOfExpertise: [
      "Venture Capital Due Diligence",
      "SaaS Business Models",
      "Startup Fundraising & Pitching",
    ],
    projects: [
      {
        id: "proj-vn1",
        title: "Developer Tools Market Intelligence Map",
        description: "Authored comprehensive report analyzing open-source developer tooling monetization models.",
        techStack: ["Market Research", "Financial Modeling", "Python"],
      },
    ],
    responseRate: 65,
    averageResponseTime: "within 5 days",
    totalMentees: 4,
    matchScore: 60,
    matchExplanation: "Valuable for students interested in tech entrepreneurship, venture capital, and commercializing software products.",
    lastActive: "Active 4 days ago",
  },
  {
    id: "a-006",
    userId: "u-106",
    name: "Deepa Krishnan",
    avatar: undefined,
    headline: "Staff Software Engineer at Uber · Distributed Systems",
    location: "New York, NY",
    company: "Uber",
    role: "Staff Software Engineer",
    graduationYear: 2015,
    department: "Computer Science & Engineering",
    degree: "B.S. in Computer Science",
    industry: "Mobility & Real-time Systems",
    yearsOfExperience: 10,
    experienceYears: "10+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Distributed Systems", level: "expert" },
      { id: "sk-2", name: "Go", level: "expert" },
      { id: "sk-3", name: "Kubernetes", level: "expert" },
      { id: "sk-4", name: "System Design", level: "expert" },
      { id: "sk-5", name: "Java", level: "expert" },
    ],
    interests: [
      { id: "i-1", name: "Infrastructure" },
      { id: "i-2", name: "Open Source" },
      { id: "i-3", name: "Ride-sharing Tech" },
    ],
    workExperience: [
      {
        id: "we-601",
        company: "Uber",
        role: "Staff Software Engineer",
        startYear: 2020,
        current: true,
        description: "Building real-time dispatch infrastructure handling 10M+ trips daily.",
      },
      {
        id: "we-602",
        company: "Uber",
        role: "Senior Software Engineer",
        startYear: 2018,
        endYear: 2020,
        current: false,
      },
      {
        id: "we-603",
        company: "Twitter",
        role: "Software Engineer",
        startYear: 2015,
        endYear: 2018,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-601",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2015,
      },
    ],
    bio: "10+ years in backend infrastructure and real-time distributed platforms. Passionate about helping engineers master system design and transition from new grad to senior staff levels.",
    mentorshipAvailability: "unavailable",
    mentorshipAreas: [],
    mentorshipInterests: [
      "Currently on sabbatical from active 1:1 mentorship sessions",
    ],
    areasOfExpertise: [
      "Real-time Distributed Event Streaming",
      "High-Availability Kubernetes Deployment",
      "Consensus Protocols & Leader Election",
    ],
    projects: [
      {
        id: "proj-dk1",
        title: "Real-Time Ride Dispatch Core",
        description: "Architected fault-tolerant geospatial matching cluster handling 100K queries/sec.",
        techStack: ["Go", "Kubernetes", "Kafka", "Distributed Systems"],
      },
    ],
    responseRate: 55,
    averageResponseTime: "within 1 week",
    totalMentees: 7,
    matchScore: 72,
    matchExplanation: "Senior distributed systems authority with deep experience in real-time dispatch systems.",
    lastActive: "Active 1 week ago",
  },
  {
    id: "a-007",
    userId: "u-107",
    name: "David O'Connor",
    avatar: undefined,
    headline: "Security Engineering Lead at CrowdStrike",
    location: "Austin, TX",
    company: "CrowdStrike",
    role: "Security Engineer",
    graduationYear: 2019,
    department: "Computer Science",
    degree: "B.S. in Computer Science",
    industry: "Cybersecurity",
    yearsOfExperience: 6,
    experienceYears: "6+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "Python", level: "expert" },
      { id: "sk-2", name: "Cybersecurity", level: "expert" },
      { id: "sk-3", name: "Linux", level: "expert" },
      { id: "sk-4", name: "Cloud Architecture", level: "advanced" },
      { id: "sk-5", name: "Docker", level: "advanced" },
      { id: "sk-6", name: "SQL", level: "intermediate" },
    ],
    interests: [
      { id: "i-1", name: "Cloud Security" },
      { id: "i-2", name: "Threat Hunting" },
      { id: "i-3", name: "Zero-Trust Architecture" },
    ],
    workExperience: [
      {
        id: "we-701",
        company: "CrowdStrike",
        role: "Security Engineering Lead",
        startYear: 2022,
        current: true,
        description: "Leading cloud threat mitigation systems and automated security response pipelines.",
      },
      {
        id: "we-702",
        company: "FireEye",
        role: "Security Operations Engineer",
        startYear: 2019,
        endYear: 2022,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-701",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2019,
      },
    ],
    bio: "Security engineer focused on application defense, cloud security architecture, and automated threat hunting. I help students understand how security integrates directly into modern software engineering pipelines.",
    linkedinUrl: "https://linkedin.com/in/davidoconnor-demo",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "Application Security & Secure Coding",
      "Cybersecurity Careers & Certifications",
      "Linux & Network Defense",
    ],
    mentorshipInterests: [
      "Securing web applications against OWASP Top 10 vulnerabilities",
      "Building security audit tools with Python",
    ],
    areasOfExpertise: [
      "Application Security (AppSec)",
      "Cloud Infrastructure Hardening",
      "Linux Kernel & Threat Analysis",
    ],
    projects: [
      {
        id: "proj-do1",
        title: "Automated Cloud Threat Hunter",
        description: "Engineered automated cloud compliance and vulnerability scanner in Python for AWS workloads.",
        techStack: ["Python", "AWS", "Docker", "Linux"],
      },
    ],
    responseRate: 90,
    averageResponseTime: "within 2 days",
    totalMentees: 7,
    matchScore: 80,
    matchExplanation: "Aligns with your Python skills to guide you on writing secure code, token authorization, and infrastructure security.",
    lastActive: "Active today",
  },
  {
    id: "a-008",
    userId: "u-108",
    name: "Maya Lin",
    avatar: undefined,
    headline: "Frontend Platform Engineer at Vercel · Web Performance",
    location: "San Francisco, CA",
    company: "Vercel",
    role: "Frontend Engineer",
    graduationYear: 2021,
    department: "Computer Science",
    degree: "B.S. in Computer Science",
    industry: "Developer Tools & Web",
    yearsOfExperience: 4,
    experienceYears: "4+ years experience",
    isVerified: true,
    skills: [
      { id: "sk-1", name: "React", level: "expert" },
      { id: "sk-2", name: "TypeScript", level: "expert" },
      { id: "sk-3", name: "Next.js", level: "expert" },
      { id: "sk-4", name: "JavaScript", level: "expert" },
      { id: "sk-5", name: "Tailwind CSS", level: "expert" },
      { id: "sk-6", name: "Web Performance", level: "advanced" },
    ],
    interests: [
      { id: "i-1", name: "Design Systems" },
      { id: "i-2", name: "Edge Computing" },
      { id: "i-3", name: "Open Source Tooling" },
    ],
    workExperience: [
      {
        id: "we-801",
        company: "Vercel",
        role: "Frontend Platform Engineer",
        startYear: 2022,
        current: true,
        description: "Developing developer platform dashboards and open-source Next.js performance tooling.",
      },
      {
        id: "we-802",
        company: "Dropbox",
        role: "Frontend Engineer",
        startYear: 2021,
        endYear: 2022,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-801",
        institution: "University of Technology",
        degree: "B.S.",
        field: "Computer Science",
        graduationYear: 2021,
      },
    ],
    bio: "Frontend engineer dedicated to building blazingly fast, accessible web applications. I love working with students on modern React, TypeScript patterns, and making codebases maintainable.",
    linkedinUrl: "https://linkedin.com/in/mayalin-demo",
    mentorshipAvailability: "available",
    mentorshipAreas: [
      "Modern React & Next.js Architecture",
      "TypeScript Best Practices",
      "Frontend Coding Interviews",
      "Portfolio Code Reviews",
    ],
    mentorshipInterests: [
      "Building full-stack React projects that stand out to tech recruiters",
      "Mastering TypeScript type narrowing and generic components",
    ],
    areasOfExpertise: [
      "Next.js App Router Architecture",
      "React Server Components & Performance",
      "Tailwind CSS & Responsive Layouts",
    ],
    projects: [
      {
        id: "proj-ml1",
        title: "Web Performance Core Profiler",
        description: "Built automated performance regression profiler monitoring Core Web Vitals for edge deployments.",
        techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      },
    ],
    responseRate: 94,
    averageResponseTime: "within 24 hours",
    totalMentees: 10,
    matchScore: 89,
    matchExplanation: "Exceptional match for your React and JavaScript background: gives direct coaching on modern TypeScript, Next.js, and web performance.",
    lastActive: "Active today",
  },
  {
    id: "a-009",
    userId: "u-109",
    name: "Samuel Adebayo",
    avatar: undefined,
    headline: "Cloud Solutions Architect at AWS · Serverless & Containers",
    location: "Seattle, WA",
    company: "Amazon Web Services",
    role: "Cloud Architect",
    graduationYear: 2017,
    department: "Electrical & Computer Engineering",
    degree: "M.S. in Computer Engineering",
    industry: "Cloud Infrastructure",
    yearsOfExperience: 8,
    experienceYears: "8+ years experience",
    isVerified: false,
    skills: [
      { id: "sk-1", name: "AWS", level: "expert" },
      { id: "sk-2", name: "Terraform", level: "expert" },
      { id: "sk-3", name: "Kubernetes", level: "advanced" },
      { id: "sk-4", name: "Microservices", level: "expert" },
      { id: "sk-5", name: "Python", level: "advanced" },
      { id: "sk-6", name: "SQL", level: "advanced" },
    ],
    interests: [
      { id: "i-1", name: "Cloud Native" },
      { id: "i-2", name: "DevOps & SRE" },
      { id: "i-3", name: "Serverless" },
    ],
    workExperience: [
      {
        id: "we-901",
        company: "Amazon Web Services",
        role: "Cloud Solutions Architect",
        startYear: 2020,
        current: true,
        description: "Advising enterprise customers on multi-region AWS cloud migration and containerization.",
      },
      {
        id: "we-902",
        company: "Oracle",
        role: "Systems Engineer",
        startYear: 2017,
        endYear: 2020,
        current: false,
      },
    ],
    education: [
      {
        id: "edu-901",
        institution: "University of Technology",
        degree: "M.S.",
        field: "Computer Engineering",
        graduationYear: 2017,
      },
    ],
    bio: "Cloud architect with 8+ years designing scalable AWS infrastructure. I mentor students on cloud fundamentals, DevOps best practices, and preparing for cloud certifications.",
    linkedinUrl: "https://linkedin.com/in/samueladebayo-demo",
    mentorshipAvailability: "limited",
    mentorshipAreas: [
      "AWS Cloud Architecture",
      "Terraform Infrastructure as Code",
      "DevOps & SRE Career Pathways",
    ],
    mentorshipInterests: [
      "Deploying student web apps reliably on cloud providers",
      "Cloud certifications and interview strategies",
    ],
    areasOfExpertise: [
      "AWS Well-Architected Framework",
      "Infrastructure as Code with Terraform",
      "Container Orchestration with ECS & EKS",
    ],
    projects: [
      {
        id: "proj-sa1",
        title: "Multi-Account Cloud Governance Engine",
        description: "Created modular Terraform repository standardizing network VPCs and security baselines.",
        techStack: ["AWS", "Terraform", "Python"],
      },
    ],
    responseRate: 80,
    averageResponseTime: "within 3 days",
    totalMentees: 5,
    matchScore: 83,
    matchExplanation: "Valuable guide for deploying your Python and Django applications on AWS cloud infrastructure using modern DevOps practices.",
    lastActive: "Active 2 days ago",
  },
];

// ─── Mentorships ──────────────────────────────────────────────────────────────

export const mentorshipsData: Mentorship[] = [
  {
    id: "m-001",
    studentId: "s-001",
    alumniId: "a-001",
    alumni: {
      id: "a-001",
      name: "Arjun Mehta",
      avatar: undefined,
      role: "Senior Product Manager",
      company: "Stripe",
    },
    status: "active",
    startDate: "2024-08-15",
    nextSession: "2024-10-22",
    sessionCount: 5,
    focus: "SWE to PM transition — interview preparation and skill building",
  },
  {
    id: "m-002",
    studentId: "s-001",
    alumniId: "a-003",
    alumni: {
      id: "a-003",
      name: "Rohan Verma",
      avatar: undefined,
      role: "Data Scientist",
      company: "Netflix",
    },
    status: "pending",
    sessionCount: 0,
    focus: "Data science fundamentals and career path exploration",
  },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsData: Conversation[] = [
  {
    id: "c-001",
    participantId: "a-001",
    participantName: "Arjun Mehta",
    participantAvatar: undefined,
    participantRole: "Senior Product Manager",
    participantCompany: "Stripe",
    lastMessage: "Let's plan to go through your case study prep before the Notion interview.",
    lastMessageAt: "2024-10-16T18:30:00Z",
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        conversationId: "c-001",
        senderId: "a-001",
        senderName: "Arjun Mehta",
        content: "Hey Priya! How did the mock product interview go last week?",
        timestamp: "2024-10-14T10:00:00Z",
        read: true,
      },
      {
        id: "msg-2",
        conversationId: "c-001",
        senderId: "s-001",
        senderName: "Priya Sharma",
        content:
          "It went better than expected! I felt a lot more confident with the framework we practiced. Still struggling a bit with the go-to-market section though.",
        timestamp: "2024-10-14T10:45:00Z",
        read: true,
      },
      {
        id: "msg-3",
        conversationId: "c-001",
        senderId: "a-001",
        senderName: "Arjun Mehta",
        content:
          "That's great progress! GTM is something most PM candidates underestimate. Let's plan to go through your case study prep before the Notion interview.",
        timestamp: "2024-10-16T18:30:00Z",
        read: false,
      },
    ],
  },
  {
    id: "c-002",
    participantId: "a-004",
    participantName: "Sanya Gupta",
    participantAvatar: undefined,
    participantRole: "UX Design Lead",
    participantCompany: "Microsoft",
    lastMessage: "Happy to review your portfolio when you have a draft ready.",
    lastMessageAt: "2024-10-12T14:00:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "msg-4",
        conversationId: "c-002",
        senderId: "s-001",
        senderName: "Priya Sharma",
        content:
          "Hi Sanya, I came across your profile on the alumni platform. I'm exploring UX as a potential path alongside PM — would you be open to a quick chat?",
        timestamp: "2024-10-11T09:00:00Z",
        read: true,
      },
      {
        id: "msg-5",
        conversationId: "c-002",
        senderId: "a-004",
        senderName: "Sanya Gupta",
        content:
          "Of course! UX + PM hybrid roles are quite common. Happy to review your portfolio when you have a draft ready.",
        timestamp: "2024-10-12T14:00:00Z",
        read: true,
      },
    ],
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsData: Notification[] = [
  {
    id: "n-001",
    type: "mentorship_request",
    title: "Mentorship session confirmed",
    description: "Arjun Mehta confirmed your session for Oct 22 at 5:00 PM PST.",
    timestamp: "2024-10-16T09:00:00Z",
    read: false,
    actionUrl: "/mentorship",
    actorName: "Arjun Mehta",
  },
  {
    id: "n-002",
    type: "message",
    title: "New message from Arjun Mehta",
    description: "Let's plan to go through your case study prep before the Notion interview.",
    timestamp: "2024-10-16T18:30:00Z",
    read: false,
    actionUrl: "/messages",
    actorName: "Arjun Mehta",
  },
  {
    id: "n-003",
    type: "match_suggestion",
    title: "New alumni match",
    description: "You have a strong match with Rohan Verma (Data Scientist at Netflix).",
    timestamp: "2024-10-15T12:00:00Z",
    read: false,
    actionUrl: "/alumni",
    actorName: "Rohan Verma",
  },
  {
    id: "n-004",
    type: "profile_view",
    title: "Your profile was viewed",
    description: "An alumni from Google viewed your profile.",
    timestamp: "2024-10-14T16:30:00Z",
    read: true,
    actionUrl: "/settings",
  },
  {
    id: "n-005",
    type: "session_reminder",
    title: "Upcoming session reminder",
    description: "Session with Arjun Mehta in 2 days — prepare your case study.",
    timestamp: "2024-10-14T08:00:00Z",
    read: true,
    actionUrl: "/mentorship",
    actorName: "Arjun Mehta",
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const dashboardStats: DashboardStats = {
  totalConnections: 3,
  activeMentorships: 1,
  unreadMessages: 1,
  profileViews: 12,
};

// ─── Career Roadmap ───────────────────────────────────────────────────────────

export const careerRoadmapData: CareerRoadmap = {
  id: "cr-001",
  studentId: "s-001",
  targetRole: "Product Manager",
  targetCompany: "Series B+ Startup or Top Tech Co.",
  targetDate: "2025-06-30",
  currentProgress: 42,
  milestones: [
    {
      id: "ms-1",
      title: "Complete PM fundamentals course",
      description: "Finish a structured PM course (e.g. Reforge, Exponent, or similar).",
      targetDate: "2024-11-30",
      completed: true,
      category: "skill",
    },
    {
      id: "ms-2",
      title: "Build a product case study portfolio",
      description: "Create 3 end-to-end product case studies covering different problem types.",
      targetDate: "2024-12-31",
      completed: false,
      category: "experience",
    },
    {
      id: "ms-3",
      title: "Complete 10 mock PM interviews",
      description: "Practice product design, estimation, and strategy questions with peers and mentors.",
      targetDate: "2025-01-31",
      completed: false,
      category: "skill",
    },
    {
      id: "ms-4",
      title: "Attend 3 PM networking events",
      description: "Connect with product professionals through meetups, conferences, or virtual events.",
      targetDate: "2025-02-28",
      completed: false,
      category: "network",
    },
    {
      id: "ms-5",
      title: "Apply to 30 PM internship/new grad roles",
      description: "Target a mix of startups, mid-sized companies, and big tech APM programs.",
      targetDate: "2025-03-31",
      completed: false,
      category: "experience",
    },
    {
      id: "ms-6",
      title: "Land a PM offer",
      description: "Receive and accept an offer for a product management role.",
      targetDate: "2025-06-30",
      completed: false,
      category: "experience",
    },
  ],
  skillGaps: [
    {
      skill: "SQL & Data Analysis",
      currentLevel: "intermediate",
      targetLevel: "advanced",
      priority: "high",
      resources: ["Mode Analytics SQL Tutorial", "Leetcode SQL", "Kaggle courses"],
    },
    {
      skill: "Product Metrics & Analytics",
      currentLevel: "beginner",
      targetLevel: "advanced",
      priority: "high",
      resources: ["Reforge Growth Series", "Amplitude Academy", "Lenny's Newsletter"],
    },
    {
      skill: "Go-to-Market Strategy",
      currentLevel: "none",
      targetLevel: "intermediate",
      priority: "medium",
      resources: ["Harvard Business Review articles", "a16z blog", "PM Library"],
    },
    {
      skill: "Technical Product Sense",
      currentLevel: "intermediate",
      targetLevel: "advanced",
      priority: "medium",
      resources: ["Designing Data-Intensive Applications", "System Design Primer"],
    },
  ],
};

// ─── Resume Review ────────────────────────────────────────────────────────────

export const resumeReviewData: ResumeReview = {
  id: "rr-001",
  studentId: "s-001",
  submittedAt: "2024-10-10T10:00:00Z",
  overallScore: 68,
  atsScore: 74,
  improvementAreas: [
    "Quantify impact in work experience bullets",
    "Add a stronger professional summary",
    "Include relevant PM keywords for ATS",
    "Improve action verb variety",
  ],
  feedback: [
    {
      id: "fb-1",
      category: "impact",
      severity: "critical",
      title: "Missing quantified results",
      description:
        "Most of your experience bullets describe tasks rather than outcomes. Hiring managers look for measurable impact. Add numbers wherever possible — team size, growth %, time saved, revenue impacted.",
      section: "Work Experience",
    },
    {
      id: "fb-2",
      category: "summary",
      severity: "critical",
      title: "Professional summary needs clarity",
      description:
        "Your current summary is generic. It should clearly state your target role (PM), relevant background (CS + data), and what makes you a strong candidate in 2-3 sentences.",
      section: "Summary",
    },
    {
      id: "fb-3",
      category: "keywords",
      severity: "suggestion",
      title: "Add PM-relevant keywords",
      description:
        "ATS systems at most PM-hiring companies scan for specific terms. Add keywords like: product roadmap, user research, A/B testing, cross-functional, KPIs, and stakeholder management.",
      section: "General",
    },
    {
      id: "fb-4",
      category: "experience",
      severity: "positive",
      title: "Strong technical background",
      description:
        "Your engineering experience is a genuine advantage for PM roles. Your Python and SQL skills are prominently visible — this is great for data-focused PM positions.",
      section: "Skills",
    },
    {
      id: "fb-5",
      category: "formatting",
      severity: "suggestion",
      title: "Consistent date formatting",
      description:
        "Your work experience dates use mixed formats (some with months, some without). Use a consistent format like 'Aug 2023 – Dec 2023' throughout.",
      section: "Work Experience",
    },
    {
      id: "fb-6",
      category: "clarity",
      severity: "positive",
      title: "Clean, readable layout",
      description:
        "Your resume layout is clear and well-organized. Good use of white space and consistent section headers. This will scan well for human reviewers.",
      section: "General",
    },
  ],
};

// ─── Dashboard Recommended Alumni (Realistic Sample Data) ─────────────────────

export const recommendedAlumniData: RecommendedAlumni[] = [
  alumniData[0] as RecommendedAlumni,
  alumniData[1] as RecommendedAlumni,
  alumniData[2] as RecommendedAlumni,
];

export function getAlumniById(id: string): (Alumni & { experienceYears?: string }) | undefined {
  return alumniData.find((a) => a.id === id);
}

// ─── Dashboard Career Roadmap Stages ──────────────────────────────────────────

export const initialRoadmapStages: RoadmapStage[] = [
  {
    id: "stage-1",
    stepNumber: 1,
    title: "Programming Fundamentals",
    description:
      "Solidify mastery of data structures (arrays, trees, graphs, hash tables), algorithmic complexity (Big-O analysis), and clean object-oriented architecture in Python and JavaScript.",
    status: "completed",
    estimatedWeeks: "Weeks 1–4",
    keySkills: ["Python", "JavaScript", "Data Structures", "Algorithms", "Big-O Analysis"],
    suggestedActivities: [
      "Implement fundamental data structures (Binary Search Trees, Hash Maps, Linked Lists) from scratch in Python",
      "Solve 30 foundational array and string problems on LeetCode / HackerRank",
      "Master functional programming patterns (map, filter, reduce, list comprehensions)",
      "Establish strict Git commit workflows and branching hygiene",
    ],
    project: {
      title: "CLI Algorithmic Visualizer",
      description: "A terminal-based visualizer for graph traversal and sorting algorithms built with Python.",
      techStack: ["Python", "Algorithms", "CLI Tooling"],
      deliverables: "Working CLI tool with automated unit test suite and clean README documentation.",
    },
  },
  {
    id: "stage-2",
    stepNumber: 2,
    title: "Backend Frameworks",
    description:
      "Master modern server-side architectures, MVC/MVT patterns, request-response lifecycles, and asynchronous processing using Django and Node.js.",
    status: "completed",
    estimatedWeeks: "Weeks 5–8",
    keySkills: ["Django", "Express.js", "MVC Pattern", "Middleware", "Asynchronous I/O"],
    suggestedActivities: [
      "Build dynamic server-rendered web applications with Django and Jinja templates",
      "Implement custom request middleware for logging, rate-limiting, and error interception",
      "Understand synchronous WSGI vs asynchronous ASGI server deployment patterns",
      "Integrate environment configuration and secrets management with .env files",
    ],
    project: {
      title: "Campus Alumni Community Portal",
      description: "A multi-page application with server-rendered views, form validation, and role-based permissions.",
      techStack: ["Python", "Django", "SQLite/PostgreSQL", "Tailwind CSS"],
      deliverables: "Complete web app with user sessions, CSRF protection, and pagination.",
    },
  },
  {
    id: "stage-3",
    stepNumber: 3,
    title: "REST API Development",
    description:
      "Design, build, and document production-ready RESTful APIs adhering to HTTP standards, status codes, serialization, pagination, and OpenAPI specifications.",
    status: "in_progress",
    estimatedWeeks: "Weeks 9–12",
    keySkills: ["Django REST Framework", "FastAPI", "RESTful Standards", "Swagger / OpenAPI", "JSON Serialization"],
    suggestedActivities: [
      "Implement resource-oriented endpoints with proper HTTP verbs (GET, POST, PUT, PATCH, DELETE)",
      "Design nested serializers and custom field validations in Django REST Framework",
      "Implement cursor-based and offset pagination for high-volume collections",
      "Generate auto-updating interactive documentation with Swagger UI and Redoc",
    ],
    project: {
      title: "Mentorship Session Booking Engine API",
      description: "RESTful API handling mentee session requests, calendar slot availability, and booking conflicts.",
      techStack: ["Django REST Framework", "Python", "Swagger", "Postman"],
      deliverables: "Fully documented REST API with Postman test collections and response schema validations.",
    },
  },
  {
    id: "stage-4",
    stepNumber: 4,
    title: "Databases and Data Modeling",
    description:
      "Deepen backend rigor: relational schema modeling, foreign key constraints, SQL query optimization, database indexing, and caching strategies with Redis.",
    status: "in_progress",
    estimatedWeeks: "Weeks 13–16",
    keySkills: ["PostgreSQL", "SQL Optimization", "Relational Modeling", "Redis Caching", "Database Indexing"],
    suggestedActivities: [
      "Design 3rd normal form relational schemas and execute migration strategies",
      "Analyze and optimize slow SQL queries using EXPLAIN ANALYZE and composite B-tree indexes",
      "Implement write-through and cache-aside caching layers with Redis for high-frequency endpoints",
      "Handle transactional consistency and database deadlocks using ACID principles",
    ],
    project: {
      title: "High-Throughput Analytics Store",
      description: "Relational database schema handling 100K event writes/day with Redis caching and composite indexing.",
      techStack: ["PostgreSQL", "Redis", "Docker", "SQLAlchemy / Django ORM"],
      deliverables: "SQL migration scripts, index performance benchmark report, and Redis cache-aside implementation.",
    },
  },
  {
    id: "stage-5",
    stepNumber: 5,
    title: "Authentication and Security",
    description:
      "Implement secure authentication and authorization flows: JWT tokens, OAuth2 / SSO, role-based access control (RBAC), and defenses against OWASP Top 10 vulnerabilities.",
    status: "not_started",
    estimatedWeeks: "Weeks 17–19",
    keySkills: ["JWT Tokens", "OAuth 2.0", "RBAC", "OWASP Top 10", "Password Hashing (bcrypt)"],
    suggestedActivities: [
      "Implement refresh token rotation and secure HTTP-only cookie storage",
      "Integrate Google and GitHub OAuth 2.0 social login workflows",
      "Audit API endpoints against SQL injection, XSS, CSRF, and broken object-level authorization (BOLA)",
      "Configure rate limiting and IP throttling to prevent brute-force authentication attacks",
    ],
    project: {
      title: "Secure Identity & RBAC Microservice",
      description: "Centralized authentication microservice issuing short-lived JWT access tokens and managing user roles.",
      techStack: ["Python", "JWT", "OAuth 2.0", "bcrypt", "Redis"],
      deliverables: "Production-ready auth module with password reset, email verification, and token rotation.",
    },
  },
  {
    id: "stage-6",
    stepNumber: 6,
    title: "Testing and Deployment",
    description:
      "Build automated test suites (unit, integration, end-to-end), containerize applications with Docker, configure CI/CD pipelines, and deploy resilient cloud services.",
    status: "not_started",
    estimatedWeeks: "Weeks 20–22",
    keySkills: ["Docker", "pytest", "GitHub Actions", "CI/CD", "AWS / Cloud Deployments"],
    suggestedActivities: [
      "Write comprehensive unit and integration test suites achieving >80% test coverage with pytest",
      "Author multi-stage Dockerfiles optimizing container build layers and minimizing image footprint",
      "Configure automated GitHub Actions workflows for linting, testing, and Docker image builds",
      "Deploy containerized microservices to cloud platforms with environment isolation",
    ],
    project: {
      title: "Full-Stack CI/CD Pipeline & Cloud Deployment",
      description: "Automated GitHub Actions pipeline running test suites and deploying containerized backend services.",
      techStack: ["Docker", "GitHub Actions", "pytest", "AWS / Render"],
      deliverables: "Green CI/CD pipeline, automated test reports, and live cloud deployment URL.",
    },
  },
  {
    id: "stage-7",
    stepNumber: 7,
    title: "Software Engineering Interview Preparation",
    description:
      "Systematic technical interview readiness: timed LeetCode medium/hard algorithmic problem solving, system design fundamentals, and STAR-method behavioral storytelling.",
    status: "not_started",
    estimatedWeeks: "Weeks 23–26",
    keySkills: ["System Design", "Coding Interviews", "Behavioral (STAR)", "Mock Interviews", "Alumni Networking"],
    suggestedActivities: [
      "Complete 75 curated LeetCode problems (Blind 75 / NeetCode 150)",
      "Practice fundamental distributed system design architectures (TinyURL, Rate Limiter, Notification Service)",
      "Prepare 5 structured STAR-method behavioral stories covering teamwork, technical trade-offs, and failure recovery",
      "Schedule 3 mock technical interviews with alumni mentors on AlumniPath",
    ],
    project: {
      title: "System Design Portfolio Document",
      description: "High-level architecture design doc for a real-time chat service detailing scaling trade-offs.",
      techStack: ["System Architecture", "Trade-Off Analysis", "Architecture Diagrams"],
      deliverables: "Comprehensive system design document reviewed and critiqued by an alumni mentor.",
    },
  },
];

// ─── Dashboard Career Overview ────────────────────────────────────────────────

export interface CareerOverviewData {
  targetRole: string;
  currentSkills: string[];
  suggestedSkills: {
    name: string;
    reason: string;
    priority: "high" | "medium";
  }[];
  recommendedNextStep: {
    title: string;
    description: string;
    actionLabel: string;
    href: string;
  };
}

export const careerOverviewData: CareerOverviewData = {
  targetRole: "Full-Stack Software Engineer",
  currentSkills: ["Python", "JavaScript", "React", "Django", "SQL"],
  suggestedSkills: [
    {
      name: "TypeScript",
      reason: "Essential for robust, large-scale React and Node.js codebases.",
      priority: "high",
    },
    {
      name: "Docker & Containers",
      reason: "Industry standard for packaging, testing, and deploying backend microservices.",
      priority: "high",
    },
    {
      name: "PostgreSQL Advanced",
      reason: "Mastering query plans, indexing, and JSONB queries elevates backend design.",
      priority: "high",
    },
    {
      name: "Redis Caching",
      reason: "Crucial for session management and low-latency API response caching.",
      priority: "medium",
    },
    {
      name: "REST / GraphQL Standards",
      reason: "Contract-first API design used across top engineering teams.",
      priority: "medium",
    },
  ],
  recommendedNextStep: {
    title: "Build & Deploy an Authenticated REST API",
    description:
      "Develop a tested REST API with Django and PostgreSQL, containerize it using Docker, and hook it up to a React frontend. Review schema with an alumni mentor.",
    actionLabel: "View Roadmap Guide",
    href: "/career-roadmap",
  },
};

// ─── Dashboard Mentorship Activity ───────────────────────────────────────────

export const initialMentorshipActivity: MentorshipActivityData = {
  pendingRequests: [
    {
      id: "req-001",
      studentId: "s-001",
      alumniId: "rec-003",
      alumni: {
        id: "rec-003",
        name: "Dr. Aisha Al-Mansoor",
        avatar: undefined,
        role: "Senior AI Engineer",
        company: "Cohere",
      },
      status: "pending",
      sessionCount: 0,
      focus: "Guidance on integrating generative AI APIs with full-stack Django/React apps",
      requestDate: "2026-10-15",
      startDate: "2026-10-15",
      requestMessage:
        "I am a second-year CS student focusing on full-stack web applications and AI APIs. I noticed your technical articles and work at Cohere and would love your guidance on production LLM integration patterns.",
      direction: "outgoing",
    },
    {
      id: "req-002",
      studentId: "s-002",
      alumniId: "s-001",
      alumni: {
        id: "s-001",
        name: "Ashlin",
        avatar: undefined,
        role: "Full-Stack Software Engineer Track",
        company: "University of Technology",
      },
      student: {
        id: "s-002",
        name: "Rohan Patel",
        avatar: undefined,
        careerGoal: "Backend Engineer",
        department: "Computer Science",
        academicYear: "Second Year",
      },
      status: "pending",
      sessionCount: 0,
      focus: "Peer mentoring on Docker Compose and Django REST Framework",
      requestDate: "2026-10-17",
      startDate: "2026-10-17",
      requestMessage:
        "Hi Ashlin! I saw your project work on distributed task queues and the alumni mentorship platform. Could we connect for 30 minutes to discuss setting up Docker Compose with PostgreSQL?",
      direction: "incoming",
    },
  ],
  acceptedMentorships: [
    {
      id: "ment-001",
      studentId: "s-001",
      alumniId: "rec-001",
      alumni: {
        id: "rec-001",
        name: "Marcus Vance",
        avatar: undefined,
        role: "Backend Engineer",
        company: "Datadog",
      },
      status: "active",
      startDate: "2026-09-20",
      requestDate: "2026-09-18",
      nextSession: "2026-10-24T18:00:00Z",
      sessionCount: 3,
      focus: "Bi-weekly 1:1 on scalable backend architecture, Django ORM optimization, and code review",
      requestMessage:
        "Looking for deep guidance on scaling relational databases, query planning with PostgreSQL, and transitioning into backend engineering roles.",
      direction: "outgoing",
    },
    {
      id: "ment-002",
      studentId: "s-001",
      alumniId: "rec-002",
      alumni: {
        id: "rec-002",
        name: "Elena Rostova",
        avatar: undefined,
        role: "Software Engineer",
        company: "Airbnb",
      },
      status: "active",
      startDate: "2026-10-01",
      requestDate: "2026-09-28",
      nextSession: "2026-10-28T17:00:00Z",
      sessionCount: 2,
      focus: "Resume refinement, LeetCode algorithmic patterns, and campus technical interviews",
      requestMessage:
        "Preparing for upcoming campus SWE internship interviews and looking for feedback on technical resume presentation.",
      direction: "outgoing",
    },
  ],
  declinedRequests: [
    {
      id: "dec-001",
      studentId: "s-001",
      alumniId: "rec-005",
      alumni: {
        id: "rec-005",
        name: "David Kim",
        avatar: undefined,
        role: "Staff Infrastructure Engineer",
        company: "Netflix",
      },
      status: "declined",
      sessionCount: 0,
      focus: "Distributed Systems & Kubernetes in Production",
      requestDate: "2026-10-02",
      requestMessage:
        "I'm eager to learn about large-scale Kubernetes deployments and high-availability distributed systems.",
      declinedReason:
        "Currently at capacity for 1:1 mentees this semester due to ongoing on-call obligations. Please feel free to re-apply in the spring!",
      direction: "outgoing",
    },
  ],
  recentConversations: [
    {
      id: "conv-001",
      participantId: "rec-001",
      participantName: "Marcus Vance",
      participantAvatar: undefined,
      participantRole: "Backend Engineer",
      participantCompany: "Datadog",
      lastMessage:
        "I looked over your database schema draft. The foreign key indexing looks solid—let's discuss connection pooling on Thursday.",
      lastMessageAt: "2026-10-16T15:20:00Z",
      unreadCount: 1,
      messages: [
        {
          id: "m-101",
          conversationId: "conv-001",
          senderId: "s-001",
          senderName: "Ashlin",
          content: "Hi Marcus! I drafted the database schema for the mentorship platform project. Could you take a quick look when you have a moment?",
          timestamp: "2026-10-15T19:00:00Z",
          read: true,
        },
        {
          id: "m-102",
          conversationId: "conv-001",
          senderId: "rec-001",
          senderName: "Marcus Vance",
          content:
            "I looked over your database schema draft. The foreign key indexing looks solid—let's discuss connection pooling on Thursday.",
          timestamp: "2026-10-16T15:20:00Z",
          read: false,
        },
      ],
    },
    {
      id: "conv-002",
      participantId: "rec-002",
      participantName: "Elena Rostova",
      participantAvatar: undefined,
      participantRole: "Software Engineer",
      participantCompany: "Airbnb",
      lastMessage: "Happy to review your updated resume before the tech career fair next month!",
      lastMessageAt: "2026-10-13T11:45:00Z",
      unreadCount: 0,
      messages: [
        {
          id: "m-201",
          conversationId: "conv-002",
          senderId: "rec-002",
          senderName: "Elena Rostova",
          content: "Happy to review your updated resume before the tech career fair next month!",
          timestamp: "2026-10-13T11:45:00Z",
          read: true,
        },
      ],
    },
  ],
};

// ─── Dashboard Demo Activities (Audit Records) ───────────────────────────────

export const demoRecentActivities: DemoActivity[] = [
  {
    id: "act-1",
    type: "profile",
    title: "Profile updated",
    description: "Added Django and React to skills inventory and verified academic year.",
    timestamp: "2 hours ago",
    tag: "Profile",
  },
  {
    id: "act-2",
    type: "match",
    title: "New mentor recommendation",
    description: "96% match found with Marcus Vance based on Python and backend engineering goals.",
    timestamp: "Yesterday",
    tag: "Match",
  },
  {
    id: "act-3",
    type: "roadmap",
    title: "Career roadmap created",
    description: "Full-Stack Software Engineer 4-stage roadmap initialized with active checkpoints.",
    timestamp: "3 days ago",
    tag: "Roadmap",
  },
  {
    id: "act-4",
    type: "mentorship",
    title: "Mentorship request sent",
    description: "Introductory request sent to Dr. Aisha Al-Mansoor for AI model deployment guidance.",
    timestamp: "4 days ago",
    tag: "Mentorship",
  },
];

// ─── Profile Completion Calculation ──────────────────────────────────────────

export interface ProfileCompletionItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  hint: string;
}

export interface ProfileCompletionResult {
  percent: number;
  completedCount: number;
  totalCount: number;
  items: ProfileCompletionItem[];
  missingCount: number;
}

export function calculateProfileCompletion(student: Student): ProfileCompletionResult {
  const items: ProfileCompletionItem[] = [
    {
      id: "name",
      label: "Full Name",
      points: 10,
      completed: Boolean(student.name && student.name.trim().length > 0),
      hint: "Your official student name",
    },
    {
      id: "department",
      label: "Academic Department",
      points: 10,
      completed: Boolean(student.department && student.department.trim().length > 0),
      hint: "E.g. Computer Science",
    },
    {
      id: "academicYear",
      label: "Academic Year",
      points: 10,
      completed: Boolean(student.academicYear && student.academicYear.trim().length > 0),
      hint: "E.g. Second Year",
    },
    {
      id: "careerGoal",
      label: "Primary Career Goal",
      points: 15,
      completed: Boolean(
        (student.careerGoal && student.careerGoal.trim().length > 0) ||
          (student.careerGoals && student.careerGoals.length > 0)
      ),
      hint: "Target professional position",
    },
    {
      id: "skills",
      label: "Technical Skills (At least 3)",
      points: 20,
      completed: Boolean(student.skills && student.skills.length >= 3),
      hint: "Add minimum 3 technical proficiencies",
    },
    {
      id: "interests",
      label: "Career Interests",
      points: 10,
      completed: Boolean(student.interests && student.interests.length >= 1),
      hint: "Domains or topics you enjoy",
    },
    {
      id: "projects",
      label: "Portfolio Projects",
      points: 15,
      completed: Boolean(student.projects && student.projects.length >= 1),
      hint: "Add at least 1 highlighted project",
    },
    {
      id: "bio",
      label: "Personal Bio / Summary",
      points: 10,
      completed: Boolean(student.bio && student.bio.trim().length > 10),
      hint: "Short summary of your background & interests",
    },
  ];

  const earnedPoints = items.reduce((sum, item) => (item.completed ? sum + item.points : sum), 0);
  const totalPossible = items.reduce((sum, item) => sum + item.points, 0);
  const percent = Math.min(100, Math.round((earnedPoints / totalPossible) * 100));
  const completedCount = items.filter((i) => i.completed).length;

  return {
    percent,
    completedCount,
    totalCount: items.length,
    missingCount: items.length - completedCount,
    items,
  };
}

// ─── Default User Settings ───────────────────────────────────────────────────

export const initialUserSettings: UserSettings = {
  account: {
    email: "ashlin.student@university.edu",
    role: "student",
    accountCreatedAt: "September 2025",
  },
  profile: {
    name: "Ashlin",
    department: "Computer Science",
    academicYear: "Second Year",
    graduationYear: 2027,
    bio: "Second-year CS student eager to build scalable web applications. Currently focused on modern full-stack frameworks, REST APIs, and database optimization.",
    headline: "Second-year Computer Science student · Aspiring Full-Stack Software Engineer",
  },
  careerPreferences: {
    targetRole: "Full-Stack Software Engineer",
    preferredIndustries: [
      "Cloud Computing & SaaS",
      "Developer Tooling",
      "Artificial Intelligence",
    ],
    preferredSkills: [
      "Python",
      "JavaScript",
      "React",
      "Django",
      "SQL",
      "Docker",
    ],
    mentorshipInterests: [
      "Backend Architecture",
      "System Design & Scalability",
      "Campus Interview Preparation",
    ],
  },
  notificationPreferences: {
    mentorshipRequests: true,
    messages: true,
    careerReminders: true,
    weeklyDigest: false,
  },
  privacy: {
    profileVisibility: "public",
    mentorshipAvailability: "open",
    showEmail: true,
    showLinkedIn: true,
  },
  appearance: {
    theme: "system",
    compactMode: false,
  },
};

