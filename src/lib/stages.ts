// ============================================================
// StartupIQ — Stage Definitions, Detection & Data Types
// ============================================================

// --- Stage enum ---
export type Stage =
  | "concept"
  | "prototype"
  | "mvp"
  | "revenue"
  | "acquisition-ready";

export const STAGE_LABELS: Record<Stage, string> = {
  concept: "Concept",
  prototype: "Prototype",
  mvp: "MVP",
  revenue: "Revenue-Generating",
  "acquisition-ready": "Acquisition-Ready",
};

// --- Maturity multipliers (Section 9) ---
export const STAGE_MULTIPLIERS: Record<Stage, number> = {
  concept: 0.85,
  prototype: 0.9,
  mvp: 0.95,
  revenue: 1.0,
  "acquisition-ready": 1.05,
};

// --- Dimension definition ---
export interface DimensionDef {
  id: string;
  name: string;
  weight: number;
  description: string;
}

// --- Dimension score ---
export interface DimensionScore {
  id: string;
  name: string;
  score: number; // 1–10
  weight: number;
  weightedContribution: number; // score * weight * 10
  reasoning: string;
  confidence: "high" | "medium" | "low";
}

// --- Evaluation result ---
export interface EvaluationResult {
  evaluationId?: number;
  submissionId?: number;
  startupName: string;
  detectedStage: Stage;
  selfReportedStage?: Stage;
  stageDiscrepancy: boolean;
  dimensionScores: DimensionScore[];
  stageScore: number; // 0–100
  overallScore: number; // 0–100 (after maturity multiplier)
  scoreLabel: string; // e.g. "Strong"
  percentile: number; // placeholder until we have real data
  topStrengths: { dimension: string; score: number; explanation: string }[];
  topWeaknesses: { dimension: string; score: number; explanation: string; recommendation: string }[];
  summary: string;
  modelVersion: string;
  createdAt: string;
}

// --- Submission data (unified, all stage fields optional) ---
export interface SubmissionData {
  startupName: string;
  founderEmail?: string;
  selfReportedStage?: Stage;
  description?: string;
  url?: string;
  // Stage detection signals
  hasRevenue?: boolean;
  revenueAmount?: number; // monthly USD
  hasMVP?: boolean;
  userCount?: number;
  hasPrototype?: boolean;
  // Concept-stage fields
  problemStatement?: string;
  targetUser?: string;
  problemEvidence?: string;
  currentAlternatives?: string;
  tamEstimate?: number;
  marketGrowthRate?: number;
  marketSources?: string;
  macroTailwinds?: string;
  competitorLandscape?: string;
  uniqueValueProp?: string;
  moatThesis?: string;
  founderBackground?: string;
  founderExperienceYears?: number;
  priorStartups?: string;
  teamComposition?: string;
  commitmentLevel?: string;
  executionPlan?: string;
  milestones?: string;
  resourceRequirements?: string;
  regulatoryEnvironment?: string;
  technologyMaturity?: string;
  customerReadiness?: string;
  // Prototype-stage fields
  technicalArchitecture?: string;
  prototypeDemo?: string;
  productDesignNotes?: string;
  innovationThesis?: string;
  developmentTimeline?: string;
  scalabilityPlan?: string;
  marketAlignmentEvidence?: string;
  // MVP-stage fields
  mauCount?: number;
  userGrowthRate?: number;
  dauMauRatio?: number;
  day1Retention?: number;
  day30Retention?: number;
  pmfSurveyScore?: number;
  npsScore?: number;
  feedbackSummary?: string;
  uptimePercent?: number;
  techDebtAssessment?: string;
  // Revenue-stage fields
  mrr?: number;
  arr?: number;
  revenueComposition?: string;
  topCustomerConcentration?: number;
  grossMargin?: number;
  momGrowthRate?: number;
  yoyGrowthRate?: number;
  cacValue?: number;
  ltvValue?: number;
  ltvCacRatio?: number;
  cacPaybackMonths?: number;
  logoChurnRate?: number;
  revenueChurnRate?: number;
  nrr?: number;
  burnRate?: number;
  runwayMonths?: number;
  contributionMargin?: number;
  marketShare?: number;
  winLossRate?: number;
  // Acquisition-ready fields
  acquirerList?: string;
  patentCount?: number;
  patentDetails?: string;
  customerLogos?: string;
  contractTerms?: string;
  codebaseQuality?: string;
  engineeringTeamSize?: number;
  capTableSummary?: string;
  ipAssignmentStatus?: string;
  dataRoomReadiness?: string;
}

// ============================================================
// Stage detection (Section 3 waterfall)
// ============================================================

export function detectStage(data: SubmissionData): {
  stage: Stage;
  confidence: "high" | "medium" | "low";
  reasoning: string;
} {
  // Check acquisition-ready criteria
  if (
    data.hasRevenue &&
    (data.revenueAmount ?? 0) >= 1000 &&
    (data.arr ?? 0) >= 50000 &&
    (data.acquirerList || data.patentCount !== undefined)
  ) {
    return {
      stage: "acquisition-ready",
      confidence: data.acquirerList ? "high" : "medium",
      reasoning:
        "Startup has meaningful revenue, assets, and acquisition signals (identified acquirers or IP portfolio).",
    };
  }

  // Check revenue
  if (
    data.hasRevenue ||
    (data.revenueAmount ?? 0) >= 1000 ||
    (data.mrr ?? 0) >= 1000
  ) {
    return {
      stage: "revenue",
      confidence: "high",
      reasoning:
        "Startup has meaningful recurring revenue (≥$1K MRR or equivalent).",
    };
  }

  // Check MVP
  if (data.hasMVP || (data.userCount ?? 0) >= 10) {
    return {
      stage: "mvp",
      confidence: (data.userCount ?? 0) >= 50 ? "high" : "medium",
      reasoning:
        "Startup has shipped a working MVP with real users. Pre-revenue or negligible revenue.",
    };
  }

  // Check prototype
  if (data.hasPrototype || data.technicalArchitecture || data.prototypeDemo) {
    return {
      stage: "prototype",
      confidence: data.prototypeDemo ? "high" : "medium",
      reasoning:
        "A functional prototype exists that demonstrates core functionality. Not yet released to users.",
    };
  }

  // Default: concept
  return {
    stage: "concept",
    confidence: "high",
    reasoning:
      "Startup is at the idea stage. No demonstrable product or users.",
  };
}

// ============================================================
// Dimension definitions per stage
// ============================================================

export const STAGE_DIMENSIONS: Record<Stage, DimensionDef[]> = {
  concept: [
    { id: "D1", name: "Problem Severity", weight: 0.25, description: "How painful, urgent, and widespread is the problem being solved?" },
    { id: "D2", name: "Market Opportunity", weight: 0.25, description: "What is the TAM, market growth rate, and macro tailwind strength?" },
    { id: "D3", name: "Competitive Differentiation", weight: 0.2, description: "How unique and defensible is the proposed solution vs. existing alternatives?" },
    { id: "D4", name: "Founder Capability", weight: 0.15, description: "Does the founder have relevant domain expertise, skills, and commitment?" },
    { id: "D5", name: "Execution Feasibility", weight: 0.1, description: "How realistic and well-scoped is the go-to-market plan?" },
    { id: "D6", name: "Market Timing", weight: 0.05, description: "Is now the right moment for this solution to succeed?" },
  ],
  prototype: [
    { id: "D1", name: "Technical Quality", weight: 0.25, description: "Does the prototype work reliably? Is the technical execution sound?" },
    { id: "D2", name: "Product Design", weight: 0.2, description: "Is the UX intuitive? Does the product solve the problem elegantly?" },
    { id: "D3", name: "Innovation Level", weight: 0.15, description: "How novel is the approach? Is this incremental or breakthrough?" },
    { id: "D4", name: "Development Progress", weight: 0.15, description: "How much has been built relative to the vision? Is velocity strong?" },
    { id: "D5", name: "Scalability Potential", weight: 0.15, description: "Can the architecture scale to production loads?" },
    { id: "D6", name: "Market Alignment", weight: 0.1, description: "Does the prototype address the right market need?" },
  ],
  mvp: [
    { id: "D1", name: "User Adoption", weight: 0.25, description: "How many users? How fast is the user base growing?" },
    { id: "D2", name: "Engagement Signals", weight: 0.2, description: "Are users actively using the product? How deeply?" },
    { id: "D3", name: "Retention Indicators", weight: 0.2, description: "Do users come back? What do cohort retention curves look like?" },
    { id: "D4", name: "Product-Market Fit Signals", weight: 0.15, description: "Is there evidence of product-market fit?" },
    { id: "D5", name: "Customer Feedback Quality", weight: 0.1, description: "What are users saying? Is feedback volume and sentiment positive?" },
    { id: "D6", name: "Technical Foundation", weight: 0.1, description: "Is the MVP stable, performant, and built on a solid foundation?" },
  ],
  revenue: [
    { id: "D1", name: "Revenue Quality", weight: 0.25, description: "Recurring vs. one-time revenue, customer concentration, gross margins" },
    { id: "D2", name: "Growth Rate", weight: 0.25, description: "MoM/QoQ/YoY revenue growth, growth consistency" },
    { id: "D3", name: "Customer Acquisition Efficiency", weight: 0.15, description: "CAC, CAC payback period, LTV:CAC ratio" },
    { id: "D4", name: "Retention & Churn", weight: 0.15, description: "Logo churn, revenue churn, net revenue retention" },
    { id: "D5", name: "Profitability Path", weight: 0.1, description: "Burn rate, runway, unit economics, path to breakeven" },
    { id: "D6", name: "Market Position & Moat", weight: 0.1, description: "Competitive position, moat strength, market share trajectory" },
  ],
  "acquisition-ready": [
    { id: "D1", name: "Strategic Acquisition Value", weight: 0.3, description: "How valuable would this startup be to likely acquirers?" },
    { id: "D2", name: "IP & Technology Quality", weight: 0.2, description: "Patents, proprietary tech, defensibility of technology assets" },
    { id: "D3", name: "Customer Base Quality", weight: 0.15, description: "Logo quality, customer concentration, contract strength" },
    { id: "D4", name: "Revenue Quality & Predictability", weight: 0.15, description: "Recurring revenue, growth trajectory, revenue visibility" },
    { id: "D5", name: "Technology Assets", weight: 0.1, description: "Codebase quality, infrastructure, team expertise" },
    { id: "D6", name: "Acquisition Suitability", weight: 0.1, description: "Clean cap table, compliance, integration readiness" },
  ],
};

// Score interpretation bands (Section 9)
export function getScoreLabel(score: number): string {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Solid";
  if (score >= 30) return "Developing";
  return "Needs Significant Work";
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-100 text-emerald-800";
  if (score >= 70) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  if (score >= 30) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}
