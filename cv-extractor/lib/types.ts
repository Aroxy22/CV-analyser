export interface LearningResource {
  name: string;
  provider: string;
  url: string;
  duration: string;
  cost: string;
  type: "course" | "certification" | "project" | "bootcamp" | "cohort" | "community";
}

export interface SkillGap {
  skill: string;
  importance: "Critical" | "Important" | "Good to have";
  current_level: string;
  required_level: string;
  why_it_matters: string;
  time_to_close: string;
  unstructured: LearningResource[];
  structured: LearningResource[];
  communities: LearningResource[];
}

export interface GoalFit {
  level: "Strong" | "Moderate" | "Weak";
  summary: string;
  what_matches: string[];
  what_doesnt: string[];
  recommended_company_type: string;
  recommended_stage: string;
  salary_reality_check: string;
  honest_verdict: string;
}

export interface CvAnalysis {
  overview: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    summary: string;
  };
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
    certifications: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    highlights: string[];
    impact?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year?: string;
    gpa?: string;
    honors?: string;
  }>;
  inferences: {
    career_level: string;
    domain: string;
    trajectory: string;
    salary_range: string;
    strengths: string[];
    personality_traits: string[];
    growth_areas: string[];
  };
  goal_fit: GoalFit;
  gaps: SkillGap[];
}

export interface AnalysisSummary {
  id: string;
  candidate_name: string | null;
  candidate_title: string | null;
  candidate_goal: string | null;
  goal_fit_level: string | null;
  analyzed_at: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  location: string;
  remote: boolean;
  salary: string;
  tags: string[];
  description: string;
  posted: string;
  match_score: number;
  match_reason: string;
  logo?: string | null;
}
