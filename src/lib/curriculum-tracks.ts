import type { RoadmapStage } from "@/types";

export interface RoleCurriculumTrack {
  role: string;
  description: string;
  category: string;
  benchmarkSkills: { name: string; category: string; benchmarkLevel: string }[];
  skillsToDevelop: {
    skill: string;
    priority: "high" | "medium";
    reason: string;
    suggestedNextStep: string;
    resources: string[];
  }[];
  stages: RoadmapStage[];
}

export const CAREER_TRACKS: Record<string, RoleCurriculumTrack> = {
  "Full-Stack Software Engineer": {
    role: "Full-Stack Software Engineer",
    description: "End-to-end full-stack engineering across modern UI frameworks, relational databases, REST/GraphQL APIs, and containerized cloud deployment.",
    category: "Software Engineering",
    benchmarkSkills: [
      { name: "TypeScript / JavaScript", category: "Core Languages", benchmarkLevel: "Advanced" },
      { name: "React / Next.js", category: "Frontend Framework", benchmarkLevel: "Advanced" },
      { name: "Node.js / Python / Go", category: "Backend Runtime", benchmarkLevel: "Advanced" },
      { name: "PostgreSQL & Prisma/Drizzle", category: "Relational DB", benchmarkLevel: "Advanced" },
      { name: "Docker & Containerization", category: "DevOps & Cloud", benchmarkLevel: "Intermediate" },
      { name: "Redis & Distributed Caching", category: "Performance", benchmarkLevel: "Intermediate" },
      { name: "REST / GraphQL & WebSocket", category: "API Design", benchmarkLevel: "Advanced" },
      { name: "CI/CD & Automated Testing", category: "Engineering Rigor", benchmarkLevel: "Intermediate" },
    ],
    skillsToDevelop: [
      {
        skill: "TypeScript Strict Mode",
        priority: "high",
        reason: "Standard industry expectation for large-scale React and Next.js production codebases.",
        suggestedNextStep: "Refactor core API responses with TypeScript interfaces, generics, and zod validation.",
        resources: ["TypeScript Handbook (Official)", "Execute Program TypeScript"],
      },
      {
        skill: "Docker & Local Multi-Service Orchestration",
        priority: "high",
        reason: "Crucial for spinning up reproducible frontend, backend, and PostgreSQL database containers.",
        suggestedNextStep: "Write multi-stage Dockerfiles and a docker-compose.yml file with volume mounts.",
        resources: ["Docker for Developers Guide", "Play with Docker"],
      },
      {
        skill: "PostgreSQL Query Optimization & Indexing",
        priority: "medium",
        reason: "Moving beyond basic ORM queries to database indexing, B-trees, and EXPLAIN ANALYZE.",
        suggestedNextStep: "Benchmark slow queries with composite indexes and connection pooling.",
        resources: ["Use The Index, Luke!", "PostgreSQL Official Docs"],
      },
      {
        skill: "Redis In-Memory Caching",
        priority: "medium",
        reason: "Critical for session state management and reducing SQL database pressure under high concurrency.",
        suggestedNextStep: "Implement cache-aside pattern on high-latency API responses with TTL expiry.",
        resources: ["Redis University (Free)", "Caching Strategies Overview"],
      },
    ],
    stages: [
      {
        id: "fse-1",
        stepNumber: 1,
        title: "Programming Fundamentals & Clean Code",
        description: "Solidify core data structures (arrays, trees, hash maps), Big-O algorithmic complexity, and idiomatic TypeScript / Python.",
        status: "not_started",
        estimatedWeeks: "Weeks 1–4",
        keySkills: ["TypeScript", "Python", "Data Structures", "Algorithms", "Big-O Analysis"],
        suggestedActivities: [
          "Implement fundamental data structures (Binary Search Trees, Hash Maps, Linked Lists) from scratch",
          "Solve 30 foundational array and string problems on LeetCode",
          "Establish strict Git commit workflows and branching hygiene",
        ],
        project: {
          title: "CLI Algorithmic Visualizer",
          description: "A terminal-based visualizer for graph traversal and sorting algorithms built with TypeScript/Node.js.",
          techStack: ["TypeScript", "Node.js", "Algorithms", "CLI Tooling"],
          deliverables: "Working CLI tool with automated unit test suite and clean documentation.",
        },
      },
      {
        id: "fse-2",
        stepNumber: 2,
        title: "Modern Frontend Architecture & State",
        description: "Build reactive, accessible user interfaces using React, Next.js App Router, Tailwind CSS, and server components.",
        status: "not_started",
        estimatedWeeks: "Weeks 5–8",
        keySkills: ["React", "Next.js", "Tailwind CSS", "Server Components", "State Management"],
        suggestedActivities: [
          "Build accessible multi-page UI layouts with responsive mobile drawers",
          "Implement optimistic UI updates and server actions",
          "Conduct Chrome DevTools performance and lighthouse audits",
        ],
        project: {
          title: "Interactive Collegiate Community Dashboard",
          description: "Modern web application with responsive layouts, search indexing, and real-time UI state sync.",
          techStack: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
          deliverables: "Deployed frontend application scoring >90 on Lighthouse performance and accessibility.",
        },
      },
      {
        id: "fse-3",
        stepNumber: 3,
        title: "Backend API Engineering & REST/GraphQL",
        description: "Design and implement production-ready RESTful and GraphQL APIs with request validation, pagination, and middleware.",
        status: "not_started",
        estimatedWeeks: "Weeks 9–12",
        keySkills: ["Node.js / Express", "FastAPI", "RESTful Standards", "Zod Validation", "OpenAPI"],
        suggestedActivities: [
          "Implement resource-oriented endpoints with proper HTTP status codes",
          "Design request schema validations with Zod",
          "Implement cursor-based and offset pagination for high-volume collections",
        ],
        project: {
          title: "Mentorship Session Booking Engine API",
          description: "RESTful API handling mentee session requests, calendar slot availability, and booking conflicts.",
          techStack: ["Node.js", "TypeScript", "Zod", "Swagger"],
          deliverables: "Fully documented REST API with OpenAPI interactive documentation.",
        },
      },
      {
        id: "fse-4",
        stepNumber: 4,
        title: "Databases, Relational Modeling & Caching",
        description: "Deepen backend rigor: PostgreSQL relational schema modeling, indexing, query optimization, and Redis caching.",
        status: "not_started",
        estimatedWeeks: "Weeks 13–16",
        keySkills: ["PostgreSQL", "SQL Optimization", "Relational Modeling", "Redis Caching", "Prisma / Drizzle"],
        suggestedActivities: [
          "Design 3rd normal form relational schemas and execute migration strategies",
          "Analyze slow queries using EXPLAIN ANALYZE and composite indexes",
          "Implement cache-aside caching layers with Redis for high-frequency endpoints",
        ],
        project: {
          title: "High-Throughput Analytics Store",
          description: "Relational database schema handling high-volume event writes with Redis caching and composite indexing.",
          techStack: ["PostgreSQL", "Redis", "Docker", "Prisma ORM"],
          deliverables: "SQL migration scripts, index performance report, and Redis cache-aside implementation.",
        },
      },
      {
        id: "fse-5",
        stepNumber: 5,
        title: "Authentication, RBAC & Security",
        description: "Implement secure authentication and authorization: JWT tokens, OAuth2 / SSO, role-based access control (RBAC), and OWASP defense.",
        status: "not_started",
        estimatedWeeks: "Weeks 17–19",
        keySkills: ["JWT Tokens", "OAuth 2.0", "RBAC", "OWASP Top 10", "Password Hashing"],
        suggestedActivities: [
          "Implement refresh token rotation and secure HTTP-only cookie storage",
          "Integrate OAuth 2.0 social login workflows",
          "Audit API endpoints against SQL injection, XSS, CSRF, and broken object-level authorization (BOLA)",
        ],
        project: {
          title: "Secure Identity & RBAC Microservice",
          description: "Centralized authentication microservice issuing short-lived JWT access tokens and managing user roles.",
          techStack: ["TypeScript", "JWT", "OAuth 2.0", "bcrypt", "Redis"],
          deliverables: "Production-ready auth module with password reset, email verification, and token rotation.",
        },
      },
      {
        id: "fse-6",
        stepNumber: 6,
        title: "Testing, Containerization & CI/CD",
        description: "Build automated test suites (unit, integration, e2e), containerize applications with Docker, and configure automated GitHub Actions.",
        status: "not_started",
        estimatedWeeks: "Weeks 20–22",
        keySkills: ["Docker", "Playwright / Vitest", "GitHub Actions", "CI/CD", "AWS / Vercel"],
        suggestedActivities: [
          "Write comprehensive unit and integration test suites achieving >80% test coverage",
          "Author multi-stage Dockerfiles optimizing container build layers",
          "Configure automated GitHub Actions workflows for linting, testing, and deployments",
        ],
        project: {
          title: "Full-Stack CI/CD Pipeline & Cloud Deployment",
          description: "Automated GitHub Actions pipeline running test suites and deploying containerized backend services.",
          techStack: ["Docker", "GitHub Actions", "Vitest", "AWS"],
          deliverables: "Green CI/CD pipeline, automated test reports, and live cloud deployment URL.",
        },
      },
      {
        id: "fse-7",
        stepNumber: 7,
        title: "Technical Interview Preparation & Systems Design",
        description: "Systematic technical interview readiness: timed LeetCode medium/hard algorithmic problem solving, system design fundamentals, and behavioral storytelling.",
        status: "not_started",
        estimatedWeeks: "Weeks 23–26",
        keySkills: ["System Design", "Coding Interviews", "Behavioral (STAR)", "Mock Interviews", "Alumni Networking"],
        suggestedActivities: [
          "Complete 75 curated LeetCode problems (Blind 75 / NeetCode 150)",
          "Practice fundamental distributed system design architectures (TinyURL, Rate Limiter)",
          "Prepare 5 structured STAR-method behavioral stories covering technical trade-offs",
        ],
        project: {
          title: "System Design Portfolio Document",
          description: "High-level architecture design doc for a real-time chat service detailing scaling trade-offs.",
          techStack: ["System Architecture", "Trade-Off Analysis", "Architecture Diagrams"],
          deliverables: "Comprehensive system design document reviewed and critiqued by an alumni mentor.",
        },
      },
    ],
  },

  "Backend Developer": {
    role: "Backend Developer",
    description: "Deep server-side architecture, distributed systems, high-concurrency runtimes, database indexing, and telemetry observability.",
    category: "Software Engineering",
    benchmarkSkills: [
      { name: "Go / Java / Python", category: "Backend Language", benchmarkLevel: "Advanced" },
      { name: "PostgreSQL & Database Internals", category: "Relational DB", benchmarkLevel: "Advanced" },
      { name: "Redis & In-Memory Stores", category: "Caching & Queues", benchmarkLevel: "Advanced" },
      { name: "Kafka / RabbitMQ", category: "Message Brokers", benchmarkLevel: "Intermediate" },
      { name: "gRPC & Protocol Buffers", category: "Microservices", benchmarkLevel: "Intermediate" },
      { name: "Docker & Kubernetes", category: "Cloud Infrastructure", benchmarkLevel: "Intermediate" },
      { name: "Distributed Systems & Concurrency", category: "System Architecture", benchmarkLevel: "Advanced" },
      { name: "Prometheus & OpenTelemetry", category: "Observability", benchmarkLevel: "Intermediate" },
    ],
    skillsToDevelop: [
      {
        skill: "Concurrent Go Routines & Thread Safety",
        priority: "high",
        reason: "Crucial for writing non-blocking, high-throughput network daemons and background workers.",
        suggestedNextStep: "Build a thread-safe worker pool in Go with mutex synchronization and context cancellation.",
        resources: ["The Go Programming Language", "Concurrency in Go (O'Reilly)"],
      },
      {
        skill: "Distributed Message Streaming (Kafka)",
        priority: "high",
        reason: "Industry standard for decoupled event ingestion pipelines in backend microservices.",
        suggestedNextStep: "Implement a producer-consumer service with exactly-once delivery guarantees.",
        resources: ["Kafka: The Definitive Guide", "Confluent Developer Tutorials"],
      },
      {
        skill: "Database Indexing & Locks (ACID)",
        priority: "medium",
        reason: "Understanding MVCC, isolation levels, and table locks under concurrent writes.",
        suggestedNextStep: "Simulate deadlocks in PostgreSQL and tune connection poolers (PgBouncer).",
        resources: ["Designing Data-Intensive Applications", "PostgreSQL Internals"],
      },
    ],
    stages: [
      {
        id: "be-1",
        stepNumber: 1,
        title: "Language Mastery & Concurrency Patterns",
        description: "Master concurrent programming, thread pools, channels, memory management, and asynchronous I/O in Go or Python.",
        status: "not_started",
        estimatedWeeks: "Weeks 1–4",
        keySkills: ["Go", "Python", "Concurrency", "Goroutines", "Memory Profiling"],
        suggestedActivities: [
          "Implement worker pools with context timeouts and graceful shutdowns",
          "Profile memory leaks and CPU bottlenecks using pprof and benchmarks",
        ],
        project: {
          title: "High-Concurrency Async Task Dispatcher",
          description: "In-process task queue handling 50K concurrent jobs with retry mechanisms and priority queues.",
          techStack: ["Go", "Goroutines", "Channels", "Unit Tests"],
          deliverables: "Working queue library with 100% test coverage and benchmark results.",
        },
      },
      {
        id: "be-2",
        stepNumber: 2,
        title: "High-Performance REST & gRPC Services",
        description: "Design type-safe microservice contracts using Protocol Buffers and gRPC alongside HTTP/2 REST endpoints.",
        status: "not_started",
        estimatedWeeks: "Weeks 5–8",
        keySkills: ["gRPC", "Protocol Buffers", "REST", "HTTP/2", "Middleware"],
        suggestedActivities: [
          "Compile protobuf definitions and implement bi-directional streaming services",
          "Build centralized logging and error interception interceptors",
        ],
        project: {
          title: "Microservices RPC Order & Inventory Service",
          description: "Dual gRPC and REST gateway service synchronizing inventory checks across distributed nodes.",
          techStack: ["Go / Python", "gRPC", "Protobuf", "Envoy"],
          deliverables: "Working service pair with benchmarked RPC latency graphs.",
        },
      },
      {
        id: "be-3",
        stepNumber: 3,
        title: "Relational Modeling & Database Tuning",
        description: "Architect normalized PostgreSQL schemas, implement partitioning, composite indexing, and transactional isolation.",
        status: "not_started",
        estimatedWeeks: "Weeks 9–12",
        keySkills: ["PostgreSQL", "Query Plans", "Indexing", "PgBouncer", "Transactions"],
        suggestedActivities: [
          "Inspect execution plans using EXPLAIN ANALYZE and eliminate sequential table scans",
          "Configure connection pooling with PgBouncer to prevent connection exhaustion",
        ],
        project: {
          title: "Ledger Financial Transaction Engine",
          description: "ACID-compliant double-entry ledger database handling atomic multi-account transfers.",
          techStack: ["PostgreSQL", "SQLAlchemy", "Docker", "Python"],
          deliverables: "Idempotent migration scripts and deadlock-proof transaction tests.",
        },
      },
      {
        id: "be-4",
        stepNumber: 4,
        title: "Distributed Caching & Message Queues",
        description: "Decouple backend workflows using Redis pub/sub and distributed event streaming with Apache Kafka or RabbitMQ.",
        status: "not_started",
        estimatedWeeks: "Weeks 13–16",
        keySkills: ["Redis", "Kafka", "RabbitMQ", "Pub/Sub", "Event-Driven Architecture"],
        suggestedActivities: [
          "Deploy Kafka brokers in Docker and implement consumer group rebalancing",
          "Design cache invalidation strategies and avoid thundering herd issues",
        ],
        project: {
          title: "Real-Time Telemetry Event Ingestion Pipeline",
          description: "High-throughput pipeline processing 10,000 metrics/sec through Kafka into time-series storage.",
          techStack: ["Kafka", "Redis", "Python/Go", "Docker"],
          deliverables: "Event streaming service with consumer lag monitoring dashboard.",
        },
      },
      {
        id: "be-5",
        stepNumber: 5,
        title: "Observability, Telemetry & SRE Practices",
        description: "Implement distributed tracing, structured logging, Prometheus metrics collection, and alerting SLOs.",
        status: "not_started",
        estimatedWeeks: "Weeks 17–20",
        keySkills: ["OpenTelemetry", "Prometheus", "Grafana", "Structured Logging", "SLOs"],
        suggestedActivities: [
          "Instrument service traces with OpenTelemetry SDK and Jaeger",
          "Build Grafana dashboards displaying P95/P99 latency and error budgets",
        ],
        project: {
          title: "Production Backend Observability Suite",
          description: "Telemetry exporter tracing request lifecycles across multiple services into Grafana.",
          techStack: ["OpenTelemetry", "Prometheus", "Grafana", "Docker"],
          deliverables: "Working monitoring stack with health checks and alerts.",
        },
      },
      {
        id: "be-6",
        stepNumber: 6,
        title: "Distributed Systems Design & Technical Interviews",
        description: "Master distributed systems trade-offs (CAP theorem, consensus, consistent hashing, rate limiters) and technical interviews.",
        status: "not_started",
        estimatedWeeks: "Weeks 21–24",
        keySkills: ["System Design", "Distributed Systems", "Consistent Hashing", "Mock Interviews"],
        suggestedActivities: [
          "Design a globally distributed rate limiter using Token Bucket and Redis",
          "Study Raft consensus algorithm and split-brain resolution techniques",
        ],
        project: {
          title: "Distributed Key-Value Store with Consistent Hashing",
          description: "Cluster of nodes routing keys using a virtual ring with replication and failover.",
          techStack: ["Go", "Consistent Hashing", "Networking", "Unit Tests"],
          deliverables: "Architecture paper and working multi-node prototype.",
        },
      },
    ],
  },

  "AI Engineer": {
    role: "AI Engineer",
    description: "Production LLM architectures, RAG pipelines, fine-tuning, vector embeddings, AI agent orchestration, and model evaluation.",
    category: "Artificial Intelligence",
    benchmarkSkills: [
      { name: "Python & PyTorch", category: "AI Foundations", benchmarkLevel: "Advanced" },
      { name: "LLM APIs & Prompt Engineering", category: "Generative AI", benchmarkLevel: "Advanced" },
      { name: "Vector Databases (pgvector, Pinecone)", category: "Retrieval", benchmarkLevel: "Advanced" },
      { name: "LangChain & LlamaIndex", category: "Agent Frameworks", benchmarkLevel: "Advanced" },
      { name: "RAG Architecture & Chunking", category: "Retrieval", benchmarkLevel: "Advanced" },
      { name: "FastAPI & Model Serving", category: "API Deployment", benchmarkLevel: "Advanced" },
      { name: "Evaluation & Guardrails", category: "AI Safety", benchmarkLevel: "Intermediate" },
      { name: "Fine-Tuning (LoRA / QLoRA)", category: "Model Training", benchmarkLevel: "Intermediate" },
    ],
    skillsToDevelop: [
      {
        skill: "Production RAG & Hybrid Retrieval",
        priority: "high",
        reason: "Standard industry expectation for grounding LLMs on enterprise proprietary knowledge bases.",
        suggestedNextStep: "Build a hybrid BM25 + dense vector embedding retrieval pipeline with cross-encoder re-ranking.",
        resources: ["Anthropic & OpenAI RAG Guides", "Pinecone Vector Learning Hub"],
      },
      {
        skill: "Autonomous Multi-Agent Tool Calling",
        priority: "high",
        reason: "Core pattern for agentic workflows executing APIs, code interpretation, and multistep reasoning.",
        suggestedNextStep: "Implement ReAct agent loop with structured JSON schema outputs and fallback handlers.",
        resources: ["LangChain Documentation", "LlamaIndex Agent Architecture"],
      },
      {
        skill: "Model Evaluation & LLM-as-a-Judge",
        priority: "medium",
        reason: "Ensuring AI generation quality, hallucination prevention, and latency benchmarks.",
        suggestedNextStep: "Create automated synthetic eval datasets testing retrieval precision and factuality.",
        resources: ["RAGAS Evaluation Framework", "OpenAI Evals"],
      },
    ],
    stages: [
      {
        id: "ai-1",
        stepNumber: 1,
        title: "Python, PyTorch & Mathematical Foundations",
        description: "Master modern scientific Python, tensor operations in PyTorch, gradient descent, tokenization, and transformer architectures.",
        status: "not_started",
        estimatedWeeks: "Weeks 1–4",
        keySkills: ["Python", "PyTorch", "Transformers", "Tokenization", "Linear Algebra"],
        suggestedActivities: [
          "Implement self-attention and multi-head attention from scratch in PyTorch",
          "Analyze tokenizers (BPE, WordPiece) and calculate token cost budgets",
        ],
        project: {
          title: "Transformer Attention Visualizer",
          description: "Interactive visualizer plotting attention weight heatmaps across token sequences.",
          techStack: ["PyTorch", "Python", "NumPy", "Matplotlib"],
          deliverables: "Working notebook and attention matrix generator.",
        },
      },
      {
        id: "ai-2",
        stepNumber: 2,
        title: "LLM Orchestration, Prompt Engineering & Tool Calling",
        description: "Harness modern LLM APIs (Gemini, NVIDIA NIM, OpenAI) with structured JSON schemas, function calling, and system prompts.",
        status: "not_started",
        estimatedWeeks: "Weeks 5–8",
        keySkills: ["Prompt Engineering", "Tool Calling", "JSON Schemas", "Gemini API", "NVIDIA NIM"],
        suggestedActivities: [
          "Design deterministic JSON extractors using structured outputs and Pydantic models",
          "Implement tool calling allowing models to search databases and run calculation tools",
        ],
        project: {
          title: "AI Collegiate Advisory Copilot",
          description: "Multi-turn assistant leveraging tool calls for student matching and resume audit logic.",
          techStack: ["FastAPI", "Python", "Gemini API", "NVIDIA NIM"],
          deliverables: "FastAPI server with streaming responses and verified schema validation.",
        },
      },
      {
        id: "ai-3",
        stepNumber: 3,
        title: "Vector Embeddings & Production RAG Pipelines",
        description: "Build robust Retrieval-Augmented Generation (RAG) systems using chunking strategies, pgvector, and cross-encoder re-ranking.",
        status: "not_started",
        estimatedWeeks: "Weeks 9–12",
        keySkills: ["pgvector", "Embeddings", "RAG", "Chunking", "Re-Ranking"],
        suggestedActivities: [
          "Benchmark recursive character vs markdown header chunking on real technical documentation",
          "Set up pgvector in PostgreSQL with HNSW indexes for sub-10ms similarity queries",
        ],
        project: {
          title: "Technical Documentation QA Engine",
          description: "Hybrid vector search engine answering engineering questions with exact source citations.",
          techStack: ["pgvector", "PostgreSQL", "FastAPI", "Cohere / BGE Re-ranker"],
          deliverables: "Deployed RAG API with verified recall scores and citation links.",
        },
      },
      {
        id: "ai-4",
        stepNumber: 4,
        title: "Agentic Systems & Multi-Step Reasoning",
        description: "Architect autonomous agents using loop planning, error reflection, memory persistence, and multi-agent coordination.",
        status: "not_started",
        estimatedWeeks: "Weeks 13–16",
        keySkills: ["AI Agents", "ReAct Pattern", "Stateful Memory", "LangGraph", "Error Recovery"],
        suggestedActivities: [
          "Implement persistent conversational memory with Redis and short-term windowing",
          "Build multi-agent pipelines where specialized agents peer-review generated code",
        ],
        project: {
          title: "Autonomous Resume & Career Strategist Agent",
          description: "Multi-agent system analyzing candidate backgrounds, discovering alumni mentors, and suggesting roadmap steps.",
          techStack: ["Python", "LangGraph", "FastAPI", "Redis"],
          deliverables: "End-to-end agentic workflow with step-by-step reasoning logs.",
        },
      },
      {
        id: "ai-5",
        stepNumber: 5,
        title: "Model Fine-Tuning & Quantization",
        description: "Parameter-efficient fine-tuning (PEFT, LoRA, QLoRA) on open-source weights (Llama 3, Mistral) and quantization deployment.",
        status: "not_started",
        estimatedWeeks: "Weeks 17–20",
        keySkills: ["LoRA", "QLoRA", "HuggingFace", "Quantization", "Model Evaluation"],
        suggestedActivities: [
          "Curate instruction-tuning datasets and format prompt-response pairs",
          "Fine-tune a lightweight 7B model using QLoRA and evaluate loss curves",
        ],
        project: {
          title: "Domain-Specific Technical Interview Scorer",
          description: "Fine-tuned open-source model trained to grade candidate answers against rigorous rubrics.",
          techStack: ["PyTorch", "Hugging Face", "LoRA", "vLLM"],
          deliverables: "Fine-tuned adapter weights and evaluation report comparing against base model.",
        },
      },
      {
        id: "ai-6",
        stepNumber: 6,
        title: "AI Production Serving, Evals & Guardrails",
        description: "Deploy high-throughput inference with vLLM/Triton, implement guardrails against prompt injection, and run automated evals.",
        status: "not_started",
        estimatedWeeks: "Weeks 21–24",
        keySkills: ["vLLM", "Triton", "Guardrails", "RAGAS", "Latency Optimization"],
        suggestedActivities: [
          "Implement input/output guardrails detecting prompt injection and PII leakage",
          "Run automated regression tests using RAGAS for faithfulness and answer relevance",
        ],
        project: {
          title: "Production AI Gateway with Automated Evals",
          description: "Reverse proxy gateway providing token rate limiting, caching, and automated eval benchmarks.",
          techStack: ["Docker", "FastAPI", "vLLM", "RAGAS"],
          deliverables: "Dockerized gateway with benchmark throughput and eval telemetry.",
        },
      },
    ],
  },

  "Frontend Platform Engineer": {
    role: "Frontend Platform Engineer",
    description: "Design systems, browser performance profiling, web accessibility (a11y), build tooling, micro-frontends, and client-side architecture.",
    category: "Software Engineering",
    benchmarkSkills: [
      { name: "TypeScript & JavaScript", category: "Core Languages", benchmarkLevel: "Expert" },
      { name: "React 19 & Next.js", category: "Core Framework", benchmarkLevel: "Advanced" },
      { name: "Design Systems & Tailwind CSS", category: "UI Architecture", benchmarkLevel: "Advanced" },
      { name: "Web Accessibility (WCAG 2.1)", category: "A11y Rigor", benchmarkLevel: "Advanced" },
      { name: "Chrome DevTools & Web Vitals", category: "Performance", benchmarkLevel: "Advanced" },
      { name: "Vite / Turbopack / Webpack", category: "Build Tooling", benchmarkLevel: "Intermediate" },
      { name: "State Machines & Sync Engines", category: "Client Architecture", benchmarkLevel: "Intermediate" },
      { name: "Automated Testing (Playwright)", category: "Quality Assurance", benchmarkLevel: "Advanced" },
    ],
    skillsToDevelop: [
      {
        skill: "Core Web Vitals & Runtime Profiling",
        priority: "high",
        reason: "Top companies demand sub-second LCP, zero CLS, and minimal INP latency for high-conversion web apps.",
        suggestedNextStep: "Audit and optimize a React app to eliminate unnecessary re-renders using React Profiler.",
        resources: ["web.dev Core Web Vitals", "Chrome DevTools Performance Documentation"],
      },
      {
        skill: "Design System Architecture & Radix/ARIA",
        priority: "high",
        reason: "Creating accessible, headless design component libraries across enterprise organizations.",
        suggestedNextStep: "Build compound component patterns with full keyboard navigation and focus trapping.",
        resources: ["Radix UI Primitives", "WAI-ARIA Authoring Practices Guide"],
      },
    ],
    stages: [
      {
        id: "fe-1",
        stepNumber: 1,
        title: "Advanced JavaScript, TypeScript & DOM Internals",
        description: "Master event loops, microtasks, prototype chains, memory leak debugging, and advanced TypeScript type gymnastics.",
        status: "not_started",
        estimatedWeeks: "Weeks 1–4",
        keySkills: ["TypeScript", "DOM APIs", "Event Loop", "Memory Profiling", "Generics"],
        suggestedActivities: [
          "Implement custom DOM virtualizer handling 100,000 list items without browser lag",
          "Debug heap memory snapshots and detached DOM nodes in Chrome DevTools",
        ],
        project: {
          title: "High-Performance Virtualized Table",
          description: "Zero-dependency virtual scrolling data table supporting 100K rows with sorting and filtering.",
          techStack: ["TypeScript", "DOM Virtualization", "CSS Transforms"],
          deliverables: "Reusable component running at a steady 60fps under fast scroll.",
        },
      },
      {
        id: "fe-2",
        stepNumber: 2,
        title: "Design Systems & Headless UI Components",
        description: "Architect reusable, themeable component libraries with token-based design systems and strict ARIA accessibility.",
        status: "not_started",
        estimatedWeeks: "Weeks 5–8",
        keySkills: ["Design Systems", "Tailwind CSS", "Radix UI", "WCAG 2.1", "ARIA"],
        suggestedActivities: [
          "Build keyboard-accessible dialogs, dropdowns, and comboboxes conforming to WCAG AA",
          "Configure automated accessibility linting and test coverage with axe-core",
        ],
        project: {
          title: "Enterprise Collegiate Design System",
          description: "Comprehensive component library with dark/light mode token support and interactive documentation.",
          techStack: ["React", "TypeScript", "Tailwind CSS", "Storybook"],
          deliverables: "Component package with 100% keyboard accessibility compliance.",
        },
      },
      {
        id: "fe-3",
        stepNumber: 3,
        title: "React Internals, Server Components & Hydration",
        description: "Deep dive into React fiber reconciliation, Server Components (RSC), selective hydration, and streaming SSR.",
        status: "not_started",
        estimatedWeeks: "Weeks 9–12",
        keySkills: ["React 19", "Next.js App Router", "Server Components", "Streaming SSR", "Hydration"],
        suggestedActivities: [
          "Optimize server-client boundary splits to minimize client JavaScript bundle size",
          "Implement streaming Suspense boundaries for non-blocking page loads",
        ],
        project: {
          title: "Streaming Server-Rendered Analytics Portal",
          description: "Data dashboard utilizing streaming server components and partial prerendering.",
          techStack: ["Next.js", "React Server Components", "TypeScript"],
          deliverables: "Live deployment with zero hydration mismatch warnings.",
        },
      },
      {
        id: "fe-4",
        stepNumber: 4,
        title: "Web Performance, Core Web Vitals & Profiling",
        description: "Systematic performance optimization: minimizing INP, eliminating CLS, tree shaking, image compression, and code splitting.",
        status: "not_started",
        estimatedWeeks: "Weeks 13–16",
        keySkills: ["Core Web Vitals", "Lighthouse", "Code Splitting", "Performance Budgets", "Chrome DevTools"],
        suggestedActivities: [
          "Audit bundle size with Webpack Bundle Analyzer and eliminate duplicate dependencies",
          "Implement responsive modern image formats (AVIF/WebP) and critical path CSS inlining",
        ],
        project: {
          title: "Speed-Optimized E-Commerce Showcase",
          description: "Complete storefront scoring 100 on all Google Lighthouse Core Web Vitals audits.",
          techStack: ["Next.js", "Web Workers", "Tailwind CSS", "Lighthouse CI"],
          deliverables: "Lighthouse CI automated report verifying sub-800ms LCP.",
        },
      },
      {
        id: "fe-5",
        stepNumber: 5,
        title: "Testing, End-to-End Automation & CI Pipeline",
        description: "End-to-end testing with Playwright, visual regression tests, unit testing with Vitest, and PR verification workflows.",
        status: "not_started",
        estimatedWeeks: "Weeks 17–20",
        keySkills: ["Playwright", "Vitest", "Visual Regression", "GitHub Actions", "CI/CD"],
        suggestedActivities: [
          "Write multi-browser end-to-end tests covering user sign up and checkout journeys",
          "Set up screenshot visual regression testing preventing unintended layout shifts",
        ],
        project: {
          title: "Automated Frontend QA Matrix",
          description: "Playwright test harness running across Chromium, WebKit, and Firefox on GitHub Actions.",
          techStack: ["Playwright", "Vitest", "GitHub Actions"],
          deliverables: "Green test suite executing parallelized smoke tests on every pull request.",
        },
      },
    ],
  },

  "Cloud Solutions Architect": {
    role: "Cloud Solutions Architect",
    description: "Cloud-native infrastructure, multi-region high availability, Kubernetes orchestration, Infrastructure-as-Code (Terraform), and cloud security.",
    category: "Cloud & Infrastructure",
    benchmarkSkills: [
      { name: "AWS / GCP / Azure", category: "Cloud Provider", benchmarkLevel: "Advanced" },
      { name: "Terraform / OpenTofu", category: "Infrastructure as Code", benchmarkLevel: "Advanced" },
      { name: "Docker & Container Architecture", category: "Containers", benchmarkLevel: "Advanced" },
      { name: "Kubernetes (K8s) & Helm", category: "Orchestration", benchmarkLevel: "Advanced" },
      { name: "Networking (VPC, DNS, Load Balancers)", category: "Network Architecture", benchmarkLevel: "Advanced" },
      { name: "Zero Trust & IAM Governance", category: "Cloud Security", benchmarkLevel: "Advanced" },
      { name: "CI/CD Pipeline Automation", category: "DevOps", benchmarkLevel: "Advanced" },
      { name: "FinOps & Cloud Cost Optimization", category: "Operations", benchmarkLevel: "Intermediate" },
    ],
    skillsToDevelop: [
      {
        skill: "Infrastructure as Code (Terraform Modules)",
        priority: "high",
        reason: "Essential for provisioning multi-environment cloud infrastructure reliably without manual drift.",
        suggestedNextStep: "Write reusable Terraform modules provisioning VPC, private subnets, and RDS database.",
        resources: ["Terraform Best Practices", "HashiCorp Learn Terraform"],
      },
      {
        skill: "Kubernetes Cluster Management & Helm",
        priority: "high",
        reason: "Enterprise gold standard for scheduling, self-healing, and scaling microservice workloads.",
        suggestedNextStep: "Deploy a multi-service app with ingress controllers, secret management, and autoscaling (HPA).",
        resources: ["Kubernetes Up & Running", "Kubernetes Official Tutorials"],
      },
    ],
    stages: [
      {
        id: "csa-1",
        stepNumber: 1,
        title: "Cloud Fundamentals & Linux Networking",
        description: "Master Linux system administration, networking protocols (TCP/IP, DNS, TLS), and cloud provider architecture (AWS/GCP).",
        status: "not_started",
        estimatedWeeks: "Weeks 1–4",
        keySkills: ["Linux", "Networking", "AWS Core", "VPC", "Security Groups"],
        suggestedActivities: [
          "Configure virtual networks, public/private subnets, NAT gateways, and routing tables",
          "Automate Linux server configuration using cloud-init scripts",
        ],
        project: {
          title: "Multi-Tier High-Availability VPC",
          description: "Isolated multi-AZ VPC network hosting web and database instances with zero public DB access.",
          techStack: ["AWS", "VPC", "EC2", "Linux"],
          deliverables: "Network topology diagram and working cloud deployment.",
        },
      },
      {
        id: "csa-2",
        stepNumber: 2,
        title: "Infrastructure as Code with Terraform",
        description: "Author declarative, version-controlled cloud infrastructure with state management, remote backends, and reusable modules.",
        status: "not_started",
        estimatedWeeks: "Weeks 5–8",
        keySkills: ["Terraform", "HCL", "Remote State", "IaC", "AWS S3 / DynamoDB"],
        suggestedActivities: [
          "Establish remote Terraform state locking with S3 and DynamoDB",
          "Author reusable modules for compute clusters and PostgreSQL databases",
        ],
        project: {
          title: "Turnkey Cloud Infrastructure Terraform Blueprint",
          description: "Complete infrastructure codebase provisioning staging and production environments.",
          techStack: ["Terraform", "AWS", "GitHub Actions"],
          deliverables: "Modular Terraform codebase with automated pull request validation.",
        },
      },
      {
        id: "csa-3",
        stepNumber: 3,
        title: "Containerization & Kubernetes (EKS / GKE)",
        description: "Deploy and manage containerized microservices on Kubernetes with Helm charts, Ingress routing, and Horizontal Pod Autoscalers.",
        status: "not_started",
        estimatedWeeks: "Weeks 9–12",
        keySkills: ["Kubernetes", "Helm", "Docker", "Ingress", "Autoscaling (HPA)"],
        suggestedActivities: [
          "Deploy microservices with liveness/readiness probes and rolling deployment strategies",
          "Package complex multi-service applications into clean Helm charts",
        ],
        project: {
          title: "Production Kubernetes EKS Microservices Cluster",
          description: "Managed Kubernetes cluster running containerized backend services with automated ingress TLS.",
          techStack: ["Kubernetes", "AWS EKS", "Helm", "Cert-Manager"],
          deliverables: "Working Helm charts and load testing resilience verification.",
        },
      },
      {
        id: "csa-4",
        stepNumber: 4,
        title: "Cloud Security, IAM & Zero Trust Architecture",
        description: "Enforce least-privilege IAM policies, secrets rotation (AWS Secrets Manager), KMS encryption, and compliance controls.",
        status: "not_started",
        estimatedWeeks: "Weeks 13–16",
        keySkills: ["IAM", "Zero Trust", "KMS Encryption", "Secrets Manager", "Compliance"],
        suggestedActivities: [
          "Audit IAM roles to eliminate wildcard permissions and enforce MFA",
          "Implement envelope encryption with AWS KMS across storage and databases",
        ],
        project: {
          title: "Hardened Zero-Trust Cloud Landing Zone",
          description: "Compliant cloud account setup with GuardDuty, CloudTrail audit logs, and IAM boundaries.",
          techStack: ["AWS IAM", "CloudTrail", "Terraform", "KMS"],
          deliverables: "Security audit compliance checklist and automated configuration scripts.",
        },
      },
      {
        id: "csa-5",
        stepNumber: 5,
        title: "Disaster Recovery, Multi-Region & Cost Engineering",
        description: "Architect business continuity: RPO/RTO targets, cross-region database replication, FinOps cost monitoring, and architectural reviews.",
        status: "not_started",
        estimatedWeeks: "Weeks 17–20",
        keySkills: ["Disaster Recovery", "Multi-Region", "FinOps", "Cost Optimization", "Well-Architected Framework"],
        suggestedActivities: [
          "Design multi-region failover architecture using Route 53 latency routing and health checks",
          "Perform cost optimization audit identifying idle instances and savings plan opportunities",
        ],
        project: {
          title: "Global Multi-Region Disaster Recovery Blueprint",
          description: "Active-passive multi-region cloud deployment capable of failing over under 5 minutes.",
          techStack: ["AWS Route 53", "Aurora Global Database", "Terraform"],
          deliverables: "Disaster recovery runbook with verified simulated failover test logs.",
        },
      },
    ],
  },

  "Software Engineer Intern": {
    role: "Software Engineer Intern",
    description: "Accelerated interview readiness for university students targeting summer software engineering internships at Tier-1 tech firms.",
    category: "Early Career",
    benchmarkSkills: [
      { name: "Python or Java or C++", category: "Core Coding Language", benchmarkLevel: "Advanced" },
      { name: "Data Structures (Trees, Graphs, Maps)", category: "Computer Science", benchmarkLevel: "Advanced" },
      { name: "Algorithms (DP, BFS, DFS, Sorting)", category: "Computer Science", benchmarkLevel: "Advanced" },
      { name: "Git Version Control", category: "Developer Tooling", benchmarkLevel: "Intermediate" },
      { name: "Full-Stack Project Experience", category: "Portfolio", benchmarkLevel: "Intermediate" },
      { name: "Behavioral Communication (STAR)", category: "Interview Skills", benchmarkLevel: "Advanced" },
    ],
    skillsToDevelop: [
      {
        skill: "Timed Algorithmic Problem Solving (LeetCode Medium)",
        priority: "high",
        reason: "Core screening filter for technical phone screens and campus recruitment rounds.",
        suggestedNextStep: "Practice NeetCode 150 topic by topic: Arrays, Two Pointers, Sliding Window, Trees, Dynamic Programming.",
        resources: ["NeetCode.io", "LeetCode 75", "Cracking the Coding Interview"],
      },
      {
        skill: "Standout Full-Stack Portfolio Project",
        priority: "high",
        reason: "Essential for passing initial resume screen without prior corporate experience.",
        suggestedNextStep: "Deploy a non-trivial web application with live users, database, and CI/CD.",
        resources: ["Full Stack Open", "GitHub Student Developer Pack"],
      },
    ],
    stages: [
      {
        id: "intern-1",
        stepNumber: 1,
        title: "Coding Foundations & Language Fluency",
        description: "Master a primary technical interview language (Python, Java, or C++) and idiomatic standard libraries.",
        status: "not_started",
        estimatedWeeks: "Weeks 1–3",
        keySkills: ["Python", "Java", "Standard Library", "Git", "Time Complexity"],
        suggestedActivities: [
          "Solve 30 easy/medium problems focusing on arrays, strings, and hash maps",
          "Master built-in sorting, priority queues, and deque operations",
        ],
        project: {
          title: "Interview Problem Solver Toolkit",
          description: "Tested implementations of fundamental data structures with automated unit tests.",
          techStack: ["Python / Java", "pytest / JUnit", "Git"],
          deliverables: "Clean GitHub repository with automated test passing badges.",
        },
      },
      {
        id: "intern-2",
        stepNumber: 2,
        title: "Core Data Structures & Algorithmic Patterns",
        description: "Deep dive into trees (BST, AVL), graphs (BFS, DFS, Dijkstra), recursion, and dynamic programming.",
        status: "not_started",
        estimatedWeeks: "Weeks 4–7",
        keySkills: ["Binary Trees", "Graph Traversal", "Dynamic Programming", "Recursion", "LeetCode"],
        suggestedActivities: [
          "Complete NeetCode 150 Core Patterns (Two Pointers, Sliding Window, Backtracking)",
          "Practice identifying time/space Big-O constraints under 2 minutes",
        ],
        project: {
          title: "Graph Traversal Maze & Pathfinding Engine",
          description: "Interactive visualizer implementing A*, BFS, and Dijkstra pathfinding on custom grids.",
          techStack: ["JavaScript / Python", "Algorithms", "HTML5 Canvas"],
          deliverables: "Working web visualizer demonstrating shortest path calculations.",
        },
      },
      {
        id: "intern-3",
        stepNumber: 3,
        title: "High-Impact Portfolio Project",
        description: "Build, polish, and deploy an original full-stack project demonstrating database design, APIs, and modern UI.",
        status: "not_started",
        estimatedWeeks: "Weeks 8–11",
        keySkills: ["Full-Stack", "React", "Node.js", "PostgreSQL", "Cloud Deployment"],
        suggestedActivities: [
          "Deploy live application to cloud hosting (Vercel, Render, AWS)",
          "Write a stellar README with architecture diagrams, setup instructions, and demo GIF",
        ],
        project: {
          title: "Campus Resource Exchange Platform",
          description: "Full-stack web app with user authentication, real-time search, and PostgreSQL database.",
          techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
          deliverables: "Live production URL, complete GitHub repository, and demo video.",
        },
      },
      {
        id: "intern-4",
        stepNumber: 4,
        title: "Resume Polish, Alumni Networking & Referrals",
        description: "Format resume to pass ATS filters, conduct mock technical interviews, and connect with university alumni for referrals.",
        status: "not_started",
        estimatedWeeks: "Weeks 12–14",
        keySkills: ["Resume Writing", "ATS Optimization", "Alumni Networking", "Mock Interviews", "STAR Method"],
        suggestedActivities: [
          "Audit resume using AlumniPath AI Resume Review to ensure quantifiable bullet points (XYZ format)",
          "Schedule 2 informational chats with alumni mentors in targeted tech companies",
          "Submit 25 tailored applications across target internship openings",
        ],
        project: {
          title: "Polished Technical Portfolio & Referral Pipeline",
          description: "Comprehensive career package ready for application season.",
          techStack: ["AlumniPath Network", "LinkedIn", "GitHub Portfolio"],
          deliverables: "ATS-optimized PDF resume, active alumni connection requests, and interview schedule.",
        },
      },
    ],
  },
};

export function getCurriculumTrack(role: string): RoleCurriculumTrack {
  const normalized = (role || "").trim().toLowerCase();
  for (const [key, track] of Object.entries(CAREER_TRACKS)) {
    if (key.toLowerCase() === normalized) {
      return track;
    }
  }

  // Exact or close match for the 6 curated tracks:
  if (normalized.includes("full-stack") || normalized.includes("full stack") || normalized.includes("fullstack")) {
    return CAREER_TRACKS["Full-Stack Software Engineer"];
  }
  if (normalized === "backend" || normalized === "backend engineer" || normalized === "backend developer") {
    return CAREER_TRACKS["Backend Developer"];
  }
  if (normalized === "ai" || normalized === "ai engineer" || normalized === "machine learning engineer" || normalized === "ml engineer") {
    return CAREER_TRACKS["AI Engineer"];
  }
  if (normalized === "frontend" || normalized === "frontend engineer" || normalized === "frontend developer") {
    return CAREER_TRACKS["Frontend Platform Engineer"];
  }
  if (normalized === "cloud architect" || normalized === "solutions architect" || normalized === "cloud engineer") {
    return CAREER_TRACKS["Cloud Solutions Architect"];
  }
  if (normalized === "intern" || normalized === "swe intern" || normalized === "software intern") {
    return CAREER_TRACKS["Software Engineer Intern"];
  }

  // Custom role that does not match any pre-curated track:
  // Return empty stages so we do not display a random/unrelated path
  return {
    role: (role || "Custom Role").trim(),
    description: `Custom career track for ${(role || "your chosen role").trim()}. Generate your personalized roadmap to build milestones.`,
    category: "Custom Career Track",
    benchmarkSkills: [],
    skillsToDevelop: [],
    stages: [],
  };
}
