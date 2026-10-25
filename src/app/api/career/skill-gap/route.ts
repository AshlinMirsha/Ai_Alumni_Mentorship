import { NextResponse, connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";

interface BenchmarkSkill {
  name: string;
  category: string;
  benchmarkLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  description: string;
}

interface SkillGapItem {
  skill: string;
  category: string;
  priority: "high" | "medium" | "low";
  reason: string;
  suggestedNextStep: string;
  resources: string[];
}

// Role-based industry benchmark databases
const ROLE_BENCHMARKS: Record<string, BenchmarkSkill[]> = {
  "software engineer": [
    { name: "Python", category: "Programming Language", benchmarkLevel: "Advanced", description: "Scripting, algorithmic coding, and service implementation." },
    { name: "JavaScript / TypeScript", category: "Language & Type Safety", benchmarkLevel: "Advanced", description: "Core web languages and strict type annotations." },
    { name: "React / Next.js", category: "Frontend Framework", benchmarkLevel: "Intermediate", description: "Component state architecture and client-server boundaries." },
    { name: "PostgreSQL & SQL", category: "Relational Database", benchmarkLevel: "Intermediate", description: "3NF schemas, transactional queries, and index strategies." },
    { name: "Docker & Containers", category: "DevOps & Cloud", benchmarkLevel: "Intermediate", description: "Reproducible container builds and local microservices." },
    { name: "REST APIs & JSON", category: "API Design", benchmarkLevel: "Advanced", description: "Idempotent HTTP verbs, status codes, and error formats." },
    { name: "Automated Testing", category: "Software Rigor", benchmarkLevel: "Intermediate", description: "Unit and integration tests with pytest, Jest, or Vitest." },
    { name: "Git & Version Control", category: "Collaboration", benchmarkLevel: "Advanced", description: "Branching workflows, interactive rebases, and pull requests." },
  ],
  "full-stack": [
    { name: "TypeScript", category: "Language & Type Safety", benchmarkLevel: "Advanced", description: "Universal typing across frontend components and backend handlers." },
    { name: "React", category: "Frontend Framework", benchmarkLevel: "Advanced", description: "Hooks, component composition, and virtual DOM performance." },
    { name: "Node.js / Express", category: "Backend Runtime", benchmarkLevel: "Advanced", description: "Event loop, asynchronous request streams, and middleware." },
    { name: "PostgreSQL", category: "Database Architecture", benchmarkLevel: "Intermediate", description: "Relational modeling, migration scripts, and indexing." },
    { name: "Redis Caching", category: "In-Memory Systems", benchmarkLevel: "Intermediate", description: "Session stores and cache-aside query acceleration." },
    { name: "Docker", category: "Containerization", benchmarkLevel: "Intermediate", description: "Multi-stage builds and compose environment orchestrations." },
    { name: "CI/CD Pipelines", category: "DevOps", benchmarkLevel: "Intermediate", description: "Automated test runs and continuous deployment workflows." },
  ],
  "backend": [
    { name: "Go / Java / Python", category: "Backend Language", benchmarkLevel: "Advanced", description: "High-performance concurrency, OOP, and memory management." },
    { name: "Microservices & gRPC", category: "System Architecture", benchmarkLevel: "Intermediate", description: "Protobuf serialization and inter-service communication." },
    { name: "PostgreSQL & Query Optimization", category: "Database Storage", benchmarkLevel: "Advanced", description: "EXPLAIN query planning, B-Tree indexes, and connection pooling." },
    { name: "Kafka / Message Queues", category: "Distributed Systems", benchmarkLevel: "Intermediate", description: "Event-driven architectures and pub/sub message brokers." },
    { name: "Docker & Kubernetes", category: "Cloud Infrastructure", benchmarkLevel: "Intermediate", description: "Containerized deployments and pod orchestration." },
  ],
  "ai": [
    { name: "Python", category: "Programming Language", benchmarkLevel: "Expert", description: "Core language for scientific computing and machine learning." },
    { name: "PyTorch / TensorFlow", category: "Deep Learning Framework", benchmarkLevel: "Advanced", description: "Neural network graph execution and model training." },
    { name: "NumPy & Pandas", category: "Data Processing", benchmarkLevel: "Advanced", description: "Vectorized array calculations and tabular data manipulation." },
    { name: "Scikit-Learn", category: "Classical ML", benchmarkLevel: "Advanced", description: "Classification, regression, clustering, and cross-validation." },
    { name: "LLMs & Vector Databases", category: "Modern AI", benchmarkLevel: "Intermediate", description: "Embeddings, RAG architectures, and similarity searches." },
  ],
};

function getRoleBenchmarks(role: string): BenchmarkSkill[] {
  const norm = role.toLowerCase();
  for (const [key, list] of Object.entries(ROLE_BENCHMARKS)) {
    if (norm.includes(key)) return list;
  }
  return ROLE_BENCHMARKS["software engineer"];
}

export async function GET(req: Request) {
  await connection();
  try {
    const { user, profile, error } = await getAuthenticatedUser(req);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const targetRole =
      (profile as any)?.desired_role ||
      (Array.isArray((profile as any)?.career_goals) && (profile as any).career_goals[0]) ||
      "Full-Stack Software Engineer";

    // 1. Retrieve verified skills from profile
    const rawSkills = (profile as any)?.technical_skills || (profile as any)?.skills || [];
    const verifiedSkills: { name: string; level: string }[] = [];
    const normalizedReportedSkillSet = new Set<string>();

    if (Array.isArray(rawSkills)) {
      rawSkills.forEach((s: any) => {
        if (typeof s === "string") {
          verifiedSkills.push({ name: s, level: "Intermediate" });
          normalizedReportedSkillSet.add(s.toLowerCase().trim());
        } else if (s?.name) {
          verifiedSkills.push({ name: s.name, level: s.level || "Intermediate" });
          normalizedReportedSkillSet.add(s.name.toLowerCase().trim());
        }
      });
    }

    // 2. Load industry benchmark requirements for target role
    const benchmarks = getRoleBenchmarks(targetRole);

    // 3. Contrast verified skills with benchmark requirements
    const matchedSkills: { name: string; category: string; studentLevel: string }[] = [];
    const recommendedSkillsToDevelop: SkillGapItem[] = [];

    benchmarks.forEach((benchmark) => {
      const match = verifiedSkills.find(
        (vs) =>
          vs.name.toLowerCase().includes(benchmark.name.toLowerCase()) ||
          benchmark.name.toLowerCase().includes(vs.name.toLowerCase())
      );

      if (match) {
        matchedSkills.push({
          name: benchmark.name,
          category: benchmark.category,
          studentLevel: match.level,
        });
      } else {
        // Suggested skill to develop
        let priority: "high" | "medium" | "low" = "medium";
        if (
          benchmark.name.includes("Docker") ||
          benchmark.name.includes("TypeScript") ||
          benchmark.name.includes("SQL") ||
          benchmark.name.includes("Python")
        ) {
          priority = "high";
        }

        recommendedSkillsToDevelop.push({
          skill: benchmark.name,
          category: benchmark.category,
          priority,
          reason: `Widely requested requirement in industry job listings for ${targetRole}.`,
          suggestedNextStep: `Build a concrete module in your portfolio incorporating ${benchmark.name}.`,
          resources: [
            `${benchmark.name} Official Documentation & Getting Started Guide`,
            `Interactive ${benchmark.name} Tutorials & Code Patterns`,
          ],
        });
      }
    });

    return NextResponse.json({
      success: true,
      targetRole,
      verifiedProfileSkillsCount: verifiedSkills.length,
      verifiedProfileSkills: verifiedSkills,
      matchedBenchmarkSkills: matchedSkills,
      recommendedSkillsToDevelop,
      disclaimer: `This skill-gap analysis contrasts your self-reported profile skills with typical industry hiring criteria for "${targetRole}". If you already possess experience in these technologies, update your Student Profile anytime to reflect them accurately.`,
    });
  } catch (err: any) {
    console.error("[Skill Gap API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to perform skill gap analysis.", details: err?.message },
      { status: 500 }
    );
  }
}
