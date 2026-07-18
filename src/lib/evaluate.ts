// ============================================================
// StartupIQ — Evaluation Orchestrator
// ============================================================

import type { EvaluationResult, SubmissionData } from "./stages";
import { STAGE_DIMENSIONS, STAGE_LABELS, detectStage, getScoreLabel } from "./stages";
import { evaluateAllDimensions, calculateStageScore, calculateOverallScore } from "./scoring";
import { saveSubmission, saveEvaluation } from "./db";

export async function evaluateStartup(
  data: SubmissionData
): Promise<EvaluationResult> {
  // Step 1: Detect stage
  const detection = detectStage(data);
  const detectedStage = detection.stage;

  // Step 2: Get dimensions for this stage
  const dims = STAGE_DIMENSIONS[detectedStage];

  // Step 3: Score each dimension
  const dimensionScores = evaluateAllDimensions(detectedStage, dims, data);

  // Step 4: Calculate stage score
  const stageScore = calculateStageScore(dimensionScores);

  // Step 5: Calculate overall StartupIQ score
  const overallScore = calculateOverallScore(stageScore, detectedStage);

  // Step 6: Identify strengths and weaknesses
  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3).map((ds) => ({
    dimension: ds.name,
    score: ds.score,
    explanation: ds.reasoning,
  }));
  const weaknesses = sorted
    .slice(-3)
    .reverse()
    .map((ds) => ({
      dimension: ds.name,
      score: ds.score,
      explanation: ds.reasoning,
      recommendation: generateRecommendation(ds.name, ds.score, detectedStage),
    }));

  // Step 7: Generate summary
  const summary = generateSummary(overallScore, detectedStage, strengths, weaknesses);

  // Step 8: Calculate percentile (placeholder — uses score-based estimation)
  const percentile = estimatePercentile(overallScore);

  // Step 9: Check stage discrepancy
  const stageDiscrepancy =
    data.selfReportedStage != null &&
    data.selfReportedStage !== detectedStage;

  const result: EvaluationResult = {
    startupName: data.startupName,
    detectedStage,
    selfReportedStage: data.selfReportedStage,
    stageDiscrepancy,
    dimensionScores,
    stageScore,
    overallScore,
    scoreLabel: getScoreLabel(overallScore),
    percentile,
    topStrengths: strengths,
    topWeaknesses: weaknesses,
    summary,
    modelVersion: "1.0",
    createdAt: new Date().toISOString(),
  };

  // Step 10: Persist
  try {
    const submissionId = saveSubmission(data);
    const evalId = saveEvaluation(submissionId, result);
    result.submissionId = submissionId;
    result.evaluationId = evalId;
  } catch (err) {
    // If DB fails, still return result (graceful degradation)
    console.error("Failed to persist evaluation:", err);
  }

  return result;
}

function generateRecommendation(
  dimensionName: string,
  score: number,
  stage: string
): string {
  if (score >= 7) return "Maintain and monitor — this is a strength.";

  const recs: Record<string, Record<string, string>> = {
    "Problem Severity": {
      concept:
        "Conduct 10+ customer discovery interviews to validate and deepen your understanding of the problem. Document specific pain points, willingness-to-pay, and current workarounds.",
    },
    "Market Opportunity": {
      concept:
        "Research and cite specific industry reports (Gartner, CB Insights, Statista) to quantify TAM/SAM. Identify 2-3 macro trends supporting your market timing.",
    },
    "Competitive Differentiation": {
      concept:
        "Build a detailed competitive matrix with 5+ competitors. Define your unique value proposition in one sentence that a customer would repeat back to you.",
    },
    "Founder Capability": {
      concept:
        "Identify skill gaps and recruit co-founders or advisors with complementary expertise. Build domain credibility through content, speaking, or advisory roles.",
    },
    "Execution Feasibility": {
      concept:
        "Break your plan into 90-day sprints with specific, measurable milestones. Identify your top 3 risks and create mitigation plans for each.",
    },
    "Market Timing": {
      concept:
        "Research recent market entrants and funding activity in your space. Document why now is the right time — regulatory changes, technology maturity, or behavioral shifts.",
    },
    "User Adoption": {
      mvp: "Invest in organic acquisition channels (content, SEO, community). Identify your top-performing channel and double down on it.",
    },
    "Engagement Signals": {
      mvp: "Implement onboarding improvements: reduce time-to-value, add guided tutorials, and trigger re-engagement emails for inactive users.",
    },
    "Retention Indicators": {
      mvp: "Analyze churn reasons systematically. Implement a win-back campaign for recently churned users and improve your onboarding flow.",
    },
    "Product-Market Fit Signals": {
      mvp: "Run a Sean Ellis PMF survey ('How disappointed would you be if this product went away?'). Target 40%+ 'very disappointed'.",
    },
    "Revenue Quality": {
      revenue:
        "Shift towards recurring revenue models. Reduce customer concentration by diversifying across industries or segments.",
    },
    "Growth Rate": {
      revenue:
        "Identify your highest-ROI growth channel and increase investment. Consider pricing optimization to capture more value.",
    },
  };

  const key = `${dimensionName}:${stage}`;
  const genericRec = `Focus on improving ${dimensionName.toLowerCase()} — gather more data, implement best practices, and track progress with specific metrics.`;

  // Try exact match first, then dimension-only match
  for (const [dim, stageRecs] of Object.entries(recs)) {
    if (dimensionName.includes(dim) || dim.includes(dimensionName)) {
      return stageRecs[stage] ?? Object.values(stageRecs)[0] ?? genericRec;
    }
  }

  return genericRec;
}

function generateSummary(
  overallScore: number,
  stage: string,
  strengths: { dimension: string; score: number }[],
  weaknesses: { dimension: string; score: number }[]
): string {
  const stageLabel = STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage;
  const label = getScoreLabel(overallScore);

  if (overallScore >= 70) {
    return `${label} — Your ${stageLabel}-stage startup demonstrates strong fundamentals, particularly in ${strengths[0]?.dimension.toLowerCase() || "key areas"} and ${strengths[1]?.dimension.toLowerCase() || "core dimensions"}. Your primary opportunity for improvement lies in ${weaknesses[0]?.dimension.toLowerCase() || "a few areas"}. You are well-positioned for the next stage of growth.`;
  } else if (overallScore >= 50) {
    return `${label} — Your ${stageLabel}-stage startup meets expectations with competent execution in ${strengths[0]?.dimension.toLowerCase() || "several areas"}. To strengthen your position, focus on improving ${weaknesses[0]?.dimension.toLowerCase() || "key dimensions"} and ${weaknesses[1]?.dimension.toLowerCase() || "additional areas"}.`;
  } else {
    return `${label} — Your ${stageLabel}-stage startup has significant gaps that need attention, especially in ${weaknesses[0]?.dimension.toLowerCase() || "core areas"} and ${weaknesses[1]?.dimension.toLowerCase() || "key dimensions"}. Focus on addressing these fundamental issues before advancing.`;
  }
}

function estimatePercentile(score: number): number {
  // Placeholder percentile estimation based on a normal distribution
  // centered around 55 with stddev ~15
  // In production, this would use real peer data from the database
  if (score >= 85) return 95;
  if (score >= 75) return 85;
  if (score >= 65) return 70;
  if (score >= 55) return 50;
  if (score >= 45) return 30;
  if (score >= 35) return 15;
  return 5;
}
