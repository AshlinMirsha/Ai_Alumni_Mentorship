import { NextResponse, connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateAICareerResponse, parseStructuredAIResponse } from "@/lib/ai/provider";
import type { RoadmapStage, RoadmapStageStatus } from "@/types";

function calculateProgress(stages: RoadmapStage[]): number {
  if (!stages || stages.length === 0) return 0;
  const completed = stages.filter((s) => s.status === "completed").length;
  const inProgress = stages.filter((s) => s.status === "in_progress").length;
  return Math.min(100, Math.round(((completed + inProgress * 0.4) / stages.length) * 100));
}

function getDefaultStagesForRole(role: string, userSkills: string[] = []): RoadmapStage[] {
  const normRole = role.toLowerCase();
  const hasSkill = (s: string) => userSkills.some((k) => k.toLowerCase().includes(s.toLowerCase()));

  if (normRole.includes("data") || normRole.includes("ai") || normRole.includes("machine learning")) {
    return [
      {
        id: "stage-1",
        stepNumber: 1,
        title: "Python & Advanced Mathematics",
        description: "Linear algebra, multivariable calculus, probability, statistics, and advanced NumPy/Pandas operations.",
        status: hasSkill("python") ? "completed" : "in_progress",
        estimatedWeeks: "3-4 Weeks",
        keySkills: ["Python", "NumPy", "Pandas", "Linear Algebra", "Probability"],
        suggestedActivities: ["Complete statistical modeling assignments", "Build vector analysis pipelines"],
        project: {
          title: "Exploratory Data Analysis Engine",
          description: "Analyze large-scale real-world datasets with automated hypothesis testing and visualization.",
          techStack: ["Python", "Pandas", "Matplotlib", "Jupyter"],
        },
      },
      {
        id: "stage-2",
        stepNumber: 2,
        title: "Data Engineering & SQL Pipeline",
        description: "PostgreSQL query optimization, ETL data pipelines, database warehousing, and Apache Spark basics.",
        status: hasSkill("sql") || hasSkill("postgres") ? "completed" : "in_progress",
        estimatedWeeks: "4-5 Weeks",
        keySkills: ["PostgreSQL", "SQL Optimization", "ETL Pipelines", "Data Warehousing"],
        suggestedActivities: ["Author complex CTE queries", "Benchmark query indexes with EXPLAIN ANALYZE"],
        project: {
          title: "Streaming ETL Financial Pipeline",
          description: "Ingest live public market data, clean anomalies, and persist into star-schema database tables.",
          techStack: ["Python", "PostgreSQL", "SQLAlchemy", "FastAPI"],
        },
      },
      {
        id: "stage-3",
        stepNumber: 3,
        title: "Machine Learning Modeling & Scikit-Learn",
        description: "Supervised and unsupervised learning, cross-validation, regularization, and feature engineering.",
        status: "not_started",
        estimatedWeeks: "5-6 Weeks",
        keySkills: ["Scikit-Learn", "Feature Engineering", "Model Evaluation", "Cross-Validation"],
        suggestedActivities: ["Build regression and classification models", "Tune hyperparameters via Bayesian optimization"],
      },
      {
        id: "stage-4",
        stepNumber: 4,
        title: "Deep Learning & Neural Networks",
        description: "PyTorch architectures, convolutional neural networks, backpropagation, and transformer models.",
        status: "not_started",
        estimatedWeeks: "6-8 Weeks",
        keySkills: ["PyTorch", "Transformers", "Transfer Learning", "CUDA / GPU Acceleration"],
      },
      {
        id: "stage-5",
        stepNumber: 5,
        title: "Model Deployment & MLOps",
        description: "Model serialization, FastAPI serving, Docker containerization, and monitoring model drift.",
        status: "not_started",
        estimatedWeeks: "4 Weeks",
        keySkills: ["MLOps", "Docker", "FastAPI", "Model Monitoring", "CI/CD"],
      },
      {
        id: "stage-6",
        stepNumber: 6,
        title: "Technical Mock Interviews & Portfolio",
        description: "ML system design interviews, Kaggle competition writeups, and technical problem solving.",
        status: "not_started",
        estimatedWeeks: "3-4 Weeks",
        keySkills: ["ML System Design", "Algorithms", "Technical Presentation"],
      },
    ];
  }

  // Standard Software Engineering / Full-Stack Track
  return [
    {
      id: "stage-1",
      stepNumber: 1,
      title: "Programming Fundamentals & Data Structures",
      description: "Master computational complexity, recursion, hash maps, binary search trees, and graphs.",
      status: hasSkill("python") || hasSkill("java") || hasSkill("c++") ? "completed" : "in_progress",
      estimatedWeeks: "3-4 Weeks",
      keySkills: ["Data Structures", "Algorithms", "Big-O Analysis", "Object-Oriented Programming"],
      suggestedActivities: ["Solve 50 curated LeetCode medium problems", "Implement custom graph traversal algorithms"],
      project: {
        title: "Algorithm Benchmark Suite",
        description: "Benchmarking execution time and memory footprint of fundamental graph traversal algorithms.",
        techStack: ["TypeScript", "Node.js", "Benchmark.js"],
      },
    },
    {
      id: "stage-2",
      stepNumber: 2,
      title: "Backend Frameworks & REST Architecture",
      description: "Build production-grade APIs with structured routing, middleware, validation, and error handling.",
      status: hasSkill("node") || hasSkill("express") || hasSkill("django") ? "completed" : "in_progress",
      estimatedWeeks: "4-5 Weeks",
      keySkills: ["Node.js / Express / Django", "RESTful Design", "Input Validation", "Middleware"],
      suggestedActivities: ["Build stateless CRUD services", "Enforce OpenAPI / Swagger contracts"],
      project: {
        title: "Multi-Tenant Resource Booking API",
        description: "Full CRUD RESTful API with automated pagination, rate limiting, and structured JSON errors.",
        techStack: ["Node.js", "Express", "Zod", "Jest"],
      },
    },
    {
      id: "stage-3",
      stepNumber: 3,
      title: "Databases, Data Modeling & Caching",
      description: "Relational schema design (3NF), query indexing, transaction isolation, and Redis cache-aside patterns.",
      status: hasSkill("sql") || hasSkill("postgres") ? "in_progress" : "not_started",
      estimatedWeeks: "4 Weeks",
      keySkills: ["PostgreSQL", "Query Optimization", "Redis Caching", "Transactions"],
      suggestedActivities: ["Analyze query execution plans with EXPLAIN ANALYZE", "Benchmark Redis caching vs raw DB queries"],
    },
    {
      id: "stage-4",
      stepNumber: 4,
      title: "Authentication, Authorization & Security",
      description: "OAuth 2.0 social sign-in, JWT refresh token rotation, password hashing, and OWASP Top 10 mitigation.",
      status: "not_started",
      estimatedWeeks: "3 Weeks",
      keySkills: ["OAuth 2.0", "JWT Rotation", "RBAC", "OWASP Security"],
    },
    {
      id: "stage-5",
      stepNumber: 5,
      title: "Frontend Engineering & State Management",
      description: "Modern component architectures in React/Next.js, optimistic updates, and server components.",
      status: hasSkill("react") || hasSkill("next") ? "completed" : "not_started",
      estimatedWeeks: "4 Weeks",
      keySkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "State Management"],
    },
    {
      id: "stage-6",
      stepNumber: 6,
      title: "Testing, Containerization & CI/CD",
      description: "Automated unit/integration tests, multi-stage Docker builds, and automated GitHub Actions deployment.",
      status: "not_started",
      estimatedWeeks: "3 Weeks",
      keySkills: ["Docker", "GitHub Actions", "CI/CD", "Automated Testing"],
    },
    {
      id: "stage-7",
      stepNumber: 7,
      title: "Interview Readiness & System Design",
      description: "Distributed system architecture mock sessions, high-concurrency design, and behavioral STAR stories.",
      status: "not_started",
      estimatedWeeks: "4 Weeks",
      keySkills: ["System Design", "Scalability", "Behavioral Interviewing"],
    },
  ];
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

    const supabase = getAdminClient();

    // 1. Attempt to fetch saved roadmap from Supabase
    try {
      const { data: savedRoadmap, error: fetchErr } = await supabase
        .from("student_career_roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .eq("target_role", targetRole)
        .maybeSingle();

      if (!fetchErr && savedRoadmap && Array.isArray(savedRoadmap.stages) && savedRoadmap.stages.length > 0) {
        return NextResponse.json({
          success: true,
          targetRole: savedRoadmap.target_role,
          stages: savedRoadmap.stages,
          completionPercentage: savedRoadmap.completion_percentage || calculateProgress(savedRoadmap.stages),
          isSaved: true,
        });
      }
    } catch {
      // Table check fallback
    }

    // 2. If no saved roadmap, synthesize personalized roadmap from user's verified skills
    const rawSkills = (profile as any)?.technical_skills || (profile as any)?.skills || [];
    const skillsList: string[] = [];
    if (Array.isArray(rawSkills)) {
      rawSkills.forEach((s: any) => {
        if (typeof s === "string") skillsList.push(s);
        else if (s?.name) skillsList.push(s.name);
      });
    }

    const defaultStages = getDefaultStagesForRole(targetRole, skillsList);
    const completionPercentage = calculateProgress(defaultStages);

    // Save initial generated roadmap to DB
    try {
      await supabase.from("student_career_roadmaps").upsert(
        {
          user_id: user.id,
          target_role: targetRole,
          stages: defaultStages,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, target_role" }
      );
    } catch {
      // Ignore if table not yet migrated
    }

    return NextResponse.json({
      success: true,
      targetRole,
      stages: defaultStages,
      completionPercentage,
      isSaved: false,
    });
  } catch (err: any) {
    console.error("[Career Roadmap API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve career roadmap.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(req);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
    }

    const supabase = getAdminClient();
    const targetRole =
      body.targetRole ||
      (profile as any)?.desired_role ||
      (Array.isArray((profile as any)?.career_goals) && (profile as any).career_goals[0]) ||
      "Full-Stack Software Engineer";

    // Scenario A: Regenerate with AI
    if (body.regenerate) {
      const rawSkills = (profile as any)?.technical_skills || (profile as any)?.skills || [];
      const userSkills: string[] = [];
      if (Array.isArray(rawSkills)) {
        rawSkills.forEach((s: any) => {
          if (typeof s === "string") userSkills.push(s);
          else if (s?.name) userSkills.push(s.name);
        });
      }

      // Try AI-augmented stage generation
      const aiPrompt = `Generate a 6-stage engineering career roadmap for a student aiming for the role "${targetRole}".
Their currently reported skills are: ${userSkills.join(", ") || "Beginner / foundational"}.
Respond ONLY with a valid JSON array of objects with the structure:
[
  {
    "id": "stage-1",
    "stepNumber": 1,
    "title": "Stage Title",
    "description": "Comprehensive explanation of what to study",
    "status": "completed" | "in_progress" | "not_started",
    "estimatedWeeks": "3-4 Weeks",
    "keySkills": ["Skill 1", "Skill 2"],
    "suggestedActivities": ["Activity 1", "Activity 2"]
  }
]`;

      const aiRes = await generateAICareerResponse({
        prompt: aiPrompt,
        temperature: 0.3,
        systemPrompt: "You are an automated career curriculum architect. You output only valid JSON without explanation.",
      });

      const parsedStages = parseStructuredAIResponse<RoadmapStage[]>(
        aiRes.text,
        getDefaultStagesForRole(targetRole, userSkills)
      );

      const completionPercentage = calculateProgress(parsedStages);

      try {
        await supabase.from("student_career_roadmaps").upsert(
          {
            user_id: user.id,
            target_role: targetRole,
            stages: parsedStages,
            completion_percentage: completionPercentage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, target_role" }
        );
      } catch (err) {
        console.warn("[Roadmap API] Database upsert warning:", err);
      }

      return NextResponse.json({
        success: true,
        targetRole,
        stages: parsedStages,
        completionPercentage,
        regenerated: true,
      });
    }

    // Scenario B: Update existing stage progress
    if (Array.isArray(body.stages)) {
      const stages: RoadmapStage[] = body.stages;
      const completionPercentage = calculateProgress(stages);

      try {
        await supabase.from("student_career_roadmaps").upsert(
          {
            user_id: user.id,
            target_role: targetRole,
            stages,
            completion_percentage: completionPercentage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, target_role" }
        );
      } catch (err) {
        console.warn("[Roadmap API] Database update warning:", err);
      }

      return NextResponse.json({
        success: true,
        targetRole,
        stages,
        completionPercentage,
      });
    }

    return NextResponse.json({ success: false, error: "Missing valid stages array or regenerate flag." }, { status: 400 });
  } catch (err: any) {
    console.error("[Career Roadmap POST API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update career roadmap.", details: err?.message },
      { status: 500 }
    );
  }
}
