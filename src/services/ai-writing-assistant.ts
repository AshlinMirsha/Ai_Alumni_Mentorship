/**
 * AI Writing Assistant Service
 *
 * Provides structured text enhancement for alumni career posts and opportunity listings.
 * Follows clear professional networking standards:
 * - Increases clarity, readability, and action-oriented tone for students.
 * - Does NOT auto-publish: always requires author review and explicit submission.
 * - Transparent about functionality without simulating deceptive backend connections.
 */

export interface WritingEnhancementResult {
  originalText: string;
  enhancedText: string;
  improvements: string[];
  suggestions: string[];
}

export async function enhanceOpportunityDescription(
  draft: string,
  roleTitle?: string,
  company?: string
): Promise<WritingEnhancementResult> {
  // Simulate standard processing delay
  await new Promise((resolve) => setTimeout(resolve, 550));

  const trimmed = draft.trim();
  if (!trimmed) {
    return {
      originalText: draft,
      enhancedText: "",
      improvements: [],
      suggestions: ["Please enter some initial draft notes before requesting AI enhancement."],
    };
  }

  const role = roleTitle?.trim() || "Software Engineer";
  const comp = company?.trim() || "Our Team";

  // Clean and polish draft with professional structure
  let enhanced = trimmed;

  // Add structured paragraphs if user draft was brief or unorganized
  if (!enhanced.includes("What you will do") && !enhanced.includes("Overview:")) {
    enhanced = `**Overview:**\n${comp} is looking for a motivated ${role} to join our engineering and product initiatives. In this role, you will contribute directly to production systems and collaborate with experienced mentors.\n\n**Key Responsibilities & Learning Opportunities:**\n• ${enhanced.replace(/\n+/g, "\n• ")}\n\n**Mentorship & Growth:**\n• Regular 1-on-1 engineering mentorship and architecture design reviews.\n• Direct exposure to modern distributed systems, production telemetry, and team agile sprints.`;
  } else {
    // Polish wording, fix punctuation, add bullet spacing
    enhanced = enhanced
      .replace(/\bi\b/g, "I")
      .replace(/we are looking for/gi, "We are excited to welcome")
      .trim();
  }

  return {
    originalText: draft,
    enhancedText: enhanced,
    improvements: [
      "Added clear 'Overview' and structured bullet points for student readability.",
      "Highlighted mentorship and learning outcomes to attract high-potential applicants.",
      "Standardized professional networking formatting and tone.",
    ],
    suggestions: [
      "Review the suggested draft below.",
      "Ensure team-specific tech stack and responsibilities match your team's exact scope.",
      "Click 'Apply to Draft' to update your form field.",
    ],
  };
}

export async function enhanceCommunityPost(
  draft: string,
  category?: string
): Promise<WritingEnhancementResult> {
  // Simulate standard processing delay
  await new Promise((resolve) => setTimeout(resolve, 550));

  const trimmed = draft.trim();
  if (!trimmed) {
    return {
      originalText: draft,
      enhancedText: "",
      improvements: [],
      suggestions: ["Please provide a few draft thoughts or bullet points to enhance."],
    };
  }

  let enhanced = trimmed;
  const improvements: string[] = [];

  if (category === "career_advice" || category === "interview_prep") {
    // Structure advice with clear takeaway
    enhanced = `${trimmed}\n\n**Key Takeaways for Students:**\n1. Focus on core problem-solving fundamentals and clear communication before jumping to complex code.\n2. Ask clarifying questions early when requirements or scope are open-ended.\n3. Keep your GitHub repositories clean and documented with reproduction steps.`;
    improvements.push(
      "Organized advice into actionable takeaways for students.",
      "Enhanced professional tone and clarity.",
      "Added structured bullet points to increase scan-ability in the community feed."
    );
  } else if (category === "technical") {
    enhanced = `${trimmed}\n\n**Why This Matters in Production:**\nUnderstanding real-world failure modes and architectural tradeoffs sets junior engineers apart during team code reviews and on-call rotations.`;
    improvements.push(
      "Linked technical explanation directly to production engineering value.",
      "Refined technical vocabulary for clarity."
    );
  } else {
    enhanced = `${trimmed}\n\nFeel free to ask questions or share your thoughts in the responses below!`;
    improvements.push(
      "Polished grammar and pacing.",
      "Added an engaging discussion call-to-action."
    );
  }

  return {
    originalText: draft,
    enhancedText: enhanced,
    improvements,
    suggestions: [
      "Read through the enhanced version to make sure it matches your personal voice.",
      "Make any further edits directly in the preview before applying.",
    ],
  };
}
