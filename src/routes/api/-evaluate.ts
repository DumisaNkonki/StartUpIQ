import { createServerFn } from "@tanstack/react-start";
import { evaluateStartup } from "../../lib/evaluate";
import { sendEvaluationEmail } from "../../lib/email";
import type { SubmissionData, Stage } from "../../lib/stages";

// Valid stage values
const VALID_STAGES = new Set<Stage>([
  "concept",
  "prototype",
  "mvp",
  "revenue",
  "acquisition-ready",
]);

function parseSubmission(formData: Record<string, unknown>): SubmissionData {
  const getStr = (key: string): string | undefined => {
    const v = formData[key];
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
  };
  const getNum = (key: string): number | undefined => {
    const v = formData[key];
    if (typeof v === "string" && v.trim().length > 0) {
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    }
    if (typeof v === "number") return v;
    return undefined;
  };
  const getBool = (key: string): boolean | undefined => {
    const v = formData[key];
    if (typeof v === "boolean") return v;
    if (v === "true" || v === "yes") return true;
    if (v === "false" || v === "no") return false;
    return undefined;
  };

  const selfReportedStage = getStr("stage") as Stage | undefined;
  const validStage =
    selfReportedStage && VALID_STAGES.has(selfReportedStage)
      ? selfReportedStage
      : undefined;

  return {
    startupName: (getStr("startupName") ?? getStr("name") ?? "Unnamed Startup"),
    founderEmail: getStr("email"),
    selfReportedStage: validStage,
    description: getStr("description"),
    url: getStr("url"),
    // Stage detection signals
    hasRevenue: getBool("hasRevenue"),
    revenueAmount: getNum("revenueAmount"),
    hasMVP: getBool("hasMVP"),
    userCount: getNum("userCount"),
    hasPrototype: getBool("hasPrototype"),
    // Concept
    problemStatement: getStr("problemStatement"),
    targetUser: getStr("targetUser"),
    problemEvidence: getStr("problemEvidence"),
    currentAlternatives: getStr("currentAlternatives"),
    tamEstimate: getNum("tamEstimate"),
    marketGrowthRate: getNum("marketGrowthRate"),
    marketSources: getStr("marketSources"),
    macroTailwinds: getStr("macroTailwinds"),
    competitorLandscape: getStr("competitorLandscape"),
    uniqueValueProp: getStr("uniqueValueProp"),
    moatThesis: getStr("moatThesis"),
    founderBackground: getStr("founderBackground"),
    founderExperienceYears: getNum("founderExperienceYears"),
    priorStartups: getStr("priorStartups"),
    teamComposition: getStr("teamComposition"),
    commitmentLevel: getStr("commitmentLevel"),
    executionPlan: getStr("executionPlan"),
    milestones: getStr("milestones"),
    resourceRequirements: getStr("resourceRequirements"),
    regulatoryEnvironment: getStr("regulatoryEnvironment"),
    technologyMaturity: getStr("technologyMaturity"),
    customerReadiness: getStr("customerReadiness"),
    // Prototype
    technicalArchitecture: getStr("technicalArchitecture"),
    prototypeDemo: getStr("prototypeDemo"),
    productDesignNotes: getStr("productDesignNotes"),
    innovationThesis: getStr("innovationThesis"),
    developmentTimeline: getStr("developmentTimeline"),
    scalabilityPlan: getStr("scalabilityPlan"),
    marketAlignmentEvidence: getStr("marketAlignmentEvidence"),
    // MVP
    mauCount: getNum("mauCount"),
    userGrowthRate: getNum("userGrowthRate"),
    dauMauRatio: getNum("dauMauRatio"),
    day1Retention: getNum("day1Retention"),
    day30Retention: getNum("day30Retention"),
    pmfSurveyScore: getNum("pmfSurveyScore"),
    npsScore: getNum("npsScore"),
    feedbackSummary: getStr("feedbackSummary"),
    uptimePercent: getNum("uptimePercent"),
    techDebtAssessment: getStr("techDebtAssessment"),
    // Revenue
    mrr: getNum("mrr"),
    arr: getNum("arr"),
    revenueComposition: getStr("revenueComposition"),
    topCustomerConcentration: getNum("topCustomerConcentration"),
    grossMargin: getNum("grossMargin"),
    momGrowthRate: getNum("momGrowthRate"),
    yoyGrowthRate: getNum("yoyGrowthRate"),
    cacValue: getNum("cacValue"),
    ltvValue: getNum("ltvValue"),
    ltvCacRatio: getNum("ltvCacRatio"),
    cacPaybackMonths: getNum("cacPaybackMonths"),
    logoChurnRate: getNum("logoChurnRate"),
    revenueChurnRate: getNum("revenueChurnRate"),
    nrr: getNum("nrr"),
    burnRate: getNum("burnRate"),
    runwayMonths: getNum("runwayMonths"),
    contributionMargin: getNum("contributionMargin"),
    marketShare: getNum("marketShare"),
    winLossRate: getNum("winLossRate"),
    // Acquisition-ready
    acquirerList: getStr("acquirerList"),
    patentCount: getNum("patentCount"),
    patentDetails: getStr("patentDetails"),
    customerLogos: getStr("customerLogos"),
    contractTerms: getStr("contractTerms"),
    codebaseQuality: getStr("codebaseQuality"),
    engineeringTeamSize: getNum("engineeringTeamSize"),
    capTableSummary: getStr("capTableSummary"),
    ipAssignmentStatus: getStr("ipAssignmentStatus"),
    dataRoomReadiness: getStr("dataRoomReadiness"),
  };
}

export const evaluate = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") {
      throw new Error("Request body must be a JSON object");
    }
    return data as Record<string, unknown>;
  })
  .handler(async ({ data }) => {
    const submission = parseSubmission(data);

    if (!submission.startupName || submission.startupName === "Unnamed Startup") {
      // Still allow but note it
    }

    const result = await evaluateStartup(submission);

    // Fire-and-forget: send evaluation email if founder provided an email address
    if (submission.founderEmail) {
      sendEvaluationEmail(submission.founderEmail, result).catch((err) => {
        console.error("Async email send failed:", err);
      });
    }

    return result;
  });
