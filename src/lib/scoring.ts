// ============================================================
// StartupIQ — AI Scoring Engine
// ============================================================
// Evaluates startups using the framework's per-stage rubrics.
// Uses heuristic/signal-based analysis for deterministic scoring:
//   - Text richness & specificity (length, keyword signals)
//   - Numeric benchmarks (TAM, growth rate, retention, etc.)
//   - Evidence completeness (how many data fields are filled)
// ============================================================

import type { DimensionDef, DimensionScore, SubmissionData, Stage } from "./stages";

// ============================================================
// Helpers
// ============================================================

/** Count how many non-empty text fields are present */
function textCompleteness(fields: (string | undefined | null)[]): number {
  const filled = fields.filter(
    (f) => f && f.trim().length > 0
  ).length;
  return filled / Math.max(fields.length, 1);
}

/** Richness score: analyze specificity and detail of a text */
function textRichness(text: string | undefined | null): number {
  if (!text || text.trim().length === 0) return 0;
  const t = text.trim();
  // Length factor: <50 chars = low, 50-200 = medium, 200-500 = good, >500 = excellent
  let lengthScore = 0;
  if (t.length >= 500) lengthScore = 3;
  else if (t.length >= 200) lengthScore = 2;
  else if (t.length >= 50) lengthScore = 1;

  // Specificity signals
  const specificitySignals = [
    /\d+%/, /\$\d+/, /\d+x/, /percent/, /revenue/, /customer/,
    /validated/, /research/, /interview/, /survey/, /data/,
    /specific/, /measured/, /tracked/, /concrete/, /evidence/,
    /competitor/i, /market/, /growth/, /\b\d+[kKmM]\b/,
  ];
  let signalCount = 0;
  for (const re of specificitySignals) {
    if (re.test(t)) signalCount++;
  }

  return Math.min(10, lengthScore * 2 + signalCount);
}

/** Score based on a numeric value against benchmarks */
function numericScore(
  value: number | undefined | null,
  thresholds: [number, number][]
): number {
  if (value == null || isNaN(value)) return 0;
  // thresholds: pairs of [ceil, score] — find the highest threshold >= value
  // Lower value thresholds come first; each pair is (maxValueForThisBucket, score)
  for (const [ceil, score] of thresholds) {
    if (value <= ceil) return score;
  }
  return thresholds.length > 0 ? thresholds[thresholds.length - 1][1] + 1 : 5;
}

/** Clamp score to 1–10 integer */
function clamp(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

/** Confidence based on data completeness */
function confidenceFromCompleteness(ratio: number): "high" | "medium" | "low" {
  if (ratio >= 0.7) return "high";
  if (ratio >= 0.3) return "medium";
  return "low";
}

// ============================================================
// Stage-specific scorers
// ============================================================

function scoreConceptDimension(
  dim: DimensionDef,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  switch (dim.id) {
    case "D1": return scoreD1Concept(data);
    case "D2": return scoreD2Concept(data);
    case "D3": return scoreD3Concept(data);
    case "D4": return scoreD4Concept(data);
    case "D5": return scoreD5Concept(data);
    case "D6": return scoreD6Concept(data);
    default: return { score: 5, reasoning: "No specific evaluator for this dimension.", confidence: "low" };
  }
}

function scoreD1Concept(data: SubmissionData) {
  const fields = [data.problemStatement, data.targetUser, data.problemEvidence, data.currentAlternatives];
  const completeness = textCompleteness(fields);
  const problemRichness = textRichness(data.problemStatement);
  const evidenceRichness = textRichness(data.problemEvidence) + textRichness(data.currentAlternatives);

  // Problem Severity: score based on specificity + evidence presence
  const baseScore = Math.round((problemRichness * 0.5 + evidenceRichness * 0.3 + completeness * 2));
  const score = clamp(baseScore);

  let reasoning = "";
  if (!data.problemStatement || data.problemStatement.trim().length < 20) {
    reasoning = "Problem statement is vague or missing. No evidence of validated pain.";
  } else if (score >= 7) {
    reasoning = "Acute, well-articulated problem with demonstrated urgency. Multiple evidence sources present.";
  } else if (score >= 5) {
    reasoning = "Clear problem affecting a definable audience. Some validation evidence present.";
  } else {
    reasoning = "Problem is real but minor or insufficiently validated. Limited evidence of urgency.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

function scoreD2Concept(data: SubmissionData) {
  const fields = [data.marketSources, data.macroTailwinds];
  const completeness = textCompleteness([data.tamEstimate?.toString(), ...fields]);
  const tam = data.tamEstimate ?? 0;

  // Market Opportunity: TAM-based + richness of market description
  let tamScore = 5;
  if (tam >= 5_000_000_000) tamScore = 10;
  else if (tam >= 500_000_000) tamScore = 8;
  else if (tam >= 50_000_000) tamScore = 6;
  else if (tam >= 10_000_000) tamScore = 4;
  else if (tam > 0) tamScore = 3;

  const growthRate = (data.marketGrowthRate ?? 0);
  let growthBonus = 0;
  if (growthRate >= 20) growthBonus = 2;
  else if (growthRate >= 10) growthBonus = 1;

  const marketTextRichness = textRichness(data.marketSources) + textRichness(data.macroTailwinds);
  const score = clamp(tamScore + growthBonus + Math.floor(marketTextRichness / 3));

  let reasoning = "";
  if (tam === 0) {
    reasoning = "No TAM estimate provided. Market size unclear.";
  } else if (score >= 7) {
    reasoning = `Large market opportunity (TAM $${(tam / 1e9).toFixed(1)}B) with strong growth tailwinds.`;
  } else if (score >= 5) {
    reasoning = `Meaningful market (TAM $${(tam / 1e6).toFixed(0)}M) with reasonable growth.`;
  } else {
    reasoning = "Small or unclear market opportunity. Limited growth potential evidenced.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

function scoreD3Concept(data: SubmissionData) {
  const uvpRichness = textRichness(data.uniqueValueProp);
  const competitorRichness = textRichness(data.competitorLandscape);
  const moatRichness = textRichness(data.moatThesis);
  const completeness = textCompleteness([data.uniqueValueProp, data.competitorLandscape, data.moatThesis]);

  const baseScore = Math.round((uvpRichness * 0.4 + competitorRichness * 0.3 + moatRichness * 0.2 + completeness * 1));
  const score = clamp(baseScore);

  let reasoning = "";
  if (!data.uniqueValueProp) {
    reasoning = "No unique value proposition provided. Differentiation is unclear.";
  } else if (score >= 7) {
    reasoning = "Strong, multi-dimensional differentiation with clear moat potential. Competitor landscape well understood.";
  } else if (score >= 5) {
    reasoning = "Identifiable differentiation on key dimensions. Competitor awareness present but not deeply analyzed.";
  } else {
    reasoning = "Limited differentiation. Competitive analysis is thin or missing.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

function scoreD4Concept(data: SubmissionData) {
  const bgRichness = textRichness(data.founderBackground);
  const experience = data.founderExperienceYears ?? 0;
  const hasPriorStartups = data.priorStartups && data.priorStartups.trim().length > 0;
  const commitment = data.commitmentLevel ?? "";

  let expScore = 5;
  if (experience >= 10) expScore = 10;
  else if (experience >= 5) expScore = 8;
  else if (experience >= 2) expScore = 6;
  else if (experience > 0) expScore = 4;

  const priorBonus = hasPriorStartups ? 1 : 0;
  const commitmentBonus = commitment.toLowerCase().includes("full") ? 1 : 0;
  const bgBonus = Math.floor(bgRichness / 3);

  const score = clamp(expScore + priorBonus + commitmentBonus + bgBonus);
  const completeness = textCompleteness([data.founderBackground, data.priorStartups, data.commitmentLevel]);

  let reasoning = "";
  if (!data.founderBackground) {
    reasoning = "No founder background provided. Capability cannot be assessed.";
  } else if (score >= 7) {
    reasoning = `Strong founder-market fit with ${experience}+ years domain experience${hasPriorStartups ? " and prior startup experience" : ""}.`;
  } else if (score >= 5) {
    reasoning = `Relevant domain experience (${experience} years). Adequate founding capability for concept stage.`;
  } else {
    reasoning = "Limited domain experience or background. Founder capability gaps exist.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

function scoreD5Concept(data: SubmissionData) {
  const planRichness = textRichness(data.executionPlan);
  const milestoneRichness = textRichness(data.milestones);
  const resourceRichness = textRichness(data.resourceRequirements);
  const completeness = textCompleteness([data.executionPlan, data.milestones, data.resourceRequirements]);

  const score = clamp(Math.round(planRichness * 0.4 + milestoneRichness * 0.3 + resourceRichness * 0.2 + completeness * 1));

  let reasoning = "";
  if (!data.executionPlan) {
    reasoning = "No execution plan provided. Feasibility cannot be assessed.";
  } else if (score >= 7) {
    reasoning = "Detailed, phased execution plan with clear milestones and realistic resource requirements.";
  } else if (score >= 5) {
    reasoning = "Reasonable plan with key milestones identified. Resource needs understood.";
  } else {
    reasoning = "Plan is high-level or missing critical details. Resource requirements may be underestimated.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

function scoreD6Concept(data: SubmissionData) {
  const regRichness = textRichness(data.regulatoryEnvironment);
  const techRichness = textRichness(data.technologyMaturity);
  const custRichness = textRichness(data.customerReadiness);
  const completeness = textCompleteness([data.regulatoryEnvironment, data.technologyMaturity, data.customerReadiness]);

  const score = clamp(Math.round(regRichness * 0.3 + techRichness * 0.3 + custRichness * 0.3 + completeness * 1));

  let reasoning = "";
  if (completeness < 0.3) {
    reasoning = "Limited timing analysis provided. Market timing unclear.";
  } else if (score >= 7) {
    reasoning = "Favorable timing. Market is growing, technology is mature, and customer readiness is strong.";
  } else if (score >= 5) {
    reasoning = "Reasonable timing. No obvious timing risks identified.";
  } else {
    reasoning = "Timing concerns exist. Market may not be ready or technology may be immature.";
  }

  return { score, reasoning, confidence: confidenceFromCompleteness(completeness) };
}

// ============================================================
// Prototype stage scorers
// ============================================================

function scorePrototypeDimension(
  dim: DimensionDef,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  const description = data.description ?? "";
  const descRichness = textRichness(description);

  switch (dim.id) {
    case "D1": {
      const archRichness = textRichness(data.technicalArchitecture);
      const completeness = textCompleteness([data.technicalArchitecture, data.prototypeDemo]);
      const score = clamp(Math.round(archRichness * 0.6 + descRichness * 0.2 + completeness * 2));
      return { score, reasoning: score >= 7 ? "Well-built prototype with sound technical execution." : score >= 5 ? "Functional prototype demonstrating core use case." : "Prototype quality unclear or unstable.", confidence: confidenceFromCompleteness(completeness) };
    }
    case "D2": {
      const designRichness = textRichness(data.productDesignNotes);
      const completeness = textCompleteness([data.productDesignNotes]);
      const score = clamp(Math.round(designRichness * 0.7 + descRichness * 0.2 + completeness * 1));
      return { score, reasoning: score >= 7 ? "Strong product design with intuitive UX." : score >= 5 ? "Competent design — users can accomplish core tasks." : "Design quality unclear or rough.", confidence: confidenceFromCompleteness(completeness) };
    }
    case "D3": {
      const innovRichness = textRichness(data.innovationThesis);
      const completeness = textCompleteness([data.innovationThesis]);
      const score = clamp(Math.round(innovRichness * 0.6 + descRichness * 0.3 + completeness * 1));
      return { score, reasoning: score >= 7 ? "Significant innovation with a novel approach." : score >= 5 ? "Genuine innovation on key dimensions." : "Mostly derivative with limited differentiation.", confidence: confidenceFromCompleteness(completeness) };
    }
    case "D4": {
      const timelineRichness = textRichness(data.developmentTimeline);
      const completeness = textCompleteness([data.developmentTimeline]);
      const score = clamp(Math.round(timelineRichness * 0.6 + descRichness * 0.3 + completeness * 1));
      return { score, reasoning: score >= 7 ? "Strong development velocity with clear path to MVP." : score >= 5 ? "Steady progress with reasonable timeline." : "Slow or unclear development progress.", confidence: confidenceFromCompleteness(completeness) };
    }
    case "D5": {
      const scaleRichness = textRichness(data.scalabilityPlan);
      const completeness = textCompleteness([data.scalabilityPlan, data.technicalArchitecture]);
      const score = clamp(Math.round(scaleRichness * 0.6 + descRichness * 0.2 + completeness * 2));
      return { score, reasoning: score >= 7 ? "Architecture designed for scale with sound technology choices." : score >= 5 ? "Reasonable technology choices — can scale with effort." : "Scalability concerns present.", confidence: confidenceFromCompleteness(completeness) };
    }
    case "D6": {
      const alignRichness = textRichness(data.marketAlignmentEvidence);
      const completeness = textCompleteness([data.marketAlignmentEvidence]);
      const score = clamp(Math.round(alignRichness * 0.7 + descRichness * 0.2 + completeness * 1));
      return { score, reasoning: score >= 7 ? "Strong market alignment validated by customer input." : score >= 5 ? "Reasonable market alignment — directionally correct." : "Weak market alignment or unvalidated direction.", confidence: confidenceFromCompleteness(completeness) };
    }
    default:
      return { score: 5, reasoning: "No specific evaluator.", confidence: "low" };
  }
}

// ============================================================
// MVP stage scorers
// ============================================================

function scoreMVPDimension(
  dim: DimensionDef,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  switch (dim.id) {
    case "D1": {
      const users = data.userCount ?? 0;
      const growth = data.userGrowthRate ?? 0;
      let score = 5;
      if (users >= 5000) score = 10;
      else if (users >= 500) score = 8;
      else if (users >= 50) score = 6;
      else if (users >= 10) score = 4;
      else score = 2;
      if (growth >= 25) score = Math.min(10, score + 1);
      const conf = users > 0 ? "high" : "low";
      return { score, reasoning: score >= 7 ? `${users}+ users with strong organic growth.` : score >= 5 ? `${users}+ users with steady growth.` : "User base is small with limited growth.", confidence: conf };
    }
    case "D2": {
      const dau = data.dauMauRatio ?? 0;
      const score = dau >= 50 ? 9 : dau >= 30 ? 7 : dau >= 15 ? 6 : dau >= 5 ? 4 : 2;
      const conf = data.dauMauRatio != null ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Strong engagement — product is part of regular workflow." : score >= 5 ? "Moderate engagement — users derive some value." : "Low engagement — users sign up and don't return.", confidence: conf };
    }
    case "D3": {
      const d1 = data.day1Retention ?? 0;
      const d30 = data.day30Retention ?? 0;
      let score = 5;
      if (d1 >= 70) score = 9;
      else if (d1 >= 50) score = 7;
      else if (d1 >= 30) score = 5;
      else if (d1 >= 20) score = 3;
      else if (d1 > 0) score = 2;
      if (d30 >= 40) score = Math.min(10, score + 1);
      const conf = d1 > 0 ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Strong retention with healthy cohort curves." : score >= 5 ? "Acceptable retention — cohorts show potential." : "Poor retention — users don't come back.", confidence: conf };
    }
    case "D4": {
      const pmf = data.pmfSurveyScore ?? 0;
      const score = pmf >= 40 ? 9 : pmf >= 30 ? 7 : pmf >= 20 ? 5 : pmf > 0 ? 3 : 2;
      const conf = pmf > 0 ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Strong PMF signals — users would be very disappointed without the product." : score >= 5 ? "Emerging PMF — a clear user segment finds real value." : "Limited PMF evidence.", confidence: conf };
    }
    case "D5": {
      const fbRichness = textRichness(data.feedbackSummary);
      const nps = data.npsScore ?? 0;
      const npsBonus = nps >= 50 ? 2 : nps >= 30 ? 1 : 0;
      const score = clamp(Math.round(fbRichness * 0.6 + npsBonus + 2));
      const conf = data.feedbackSummary ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Strong feedback culture with predominantly positive sentiment." : score >= 5 ? "Regular feedback collected with mixed-to-positive sentiment." : "Minimal feedback collection.", confidence: conf };
    }
    case "D6": {
      const uptime = data.uptimePercent ?? 0;
      const techText = textRichness(data.techDebtAssessment);
      const score = uptime >= 99.9 ? 9 : uptime >= 99.5 ? 7 : uptime >= 99 ? 5 : uptime > 0 ? 3 : Math.max(2, Math.round(techText / 2) + 2);
      const conf = uptime > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Solid technical foundation with high uptime." : score >= 5 ? "Stable product with manageable tech debt." : "Stability concerns or significant tech debt.", confidence: conf };
    }
    default:
      return { score: 5, reasoning: "No specific evaluator.", confidence: "low" };
  }
}

// ============================================================
// Revenue stage scorers
// ============================================================

function scoreRevenueDimension(
  dim: DimensionDef,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  switch (dim.id) {
    case "D1": {
      const recurring = data.revenueComposition?.toLowerCase().includes("recurring") ? 1 : 0;
      const conc = data.topCustomerConcentration ?? 100;
      const gm = data.grossMargin ?? 0;
      let score = 5;
      if (gm >= 85 && conc < 15) score = 9;
      else if (gm >= 70 && conc < 30) score = 7;
      else if (gm >= 50 && conc < 50) score = 5;
      else score = 3;
      const conf = gm > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Predominantly recurring revenue with low concentration and strong margins." : score >= 5 ? "Acceptable revenue quality with moderate metrics." : "Revenue quality concerns — high concentration or low margins.", confidence: conf };
    }
    case "D2": {
      const yoy = data.yoyGrowthRate ?? 0;
      const mom = data.momGrowthRate ?? 0;
      const arr = data.arr ?? 0;
      let score = 5;
      if (yoy >= 200) score = 10;
      else if (yoy >= 100) score = 8;
      else if (yoy >= 50) score = 6;
      else if (yoy >= 20) score = 4;
      else if (yoy > 0) score = 3;
      else score = 2;
      // Scale-adjusted bonus
      if (arr >= 5_000_000) score = Math.min(10, score + 1);
      const conf = yoy > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? `Strong growth (${yoy}% YoY) — above market rate.` : score >= 5 ? `Solid growth (${yoy}% YoY) in line with expectations.` : "Slow or negative growth.", confidence: conf };
    }
    case "D3": {
      const ltvCac = data.ltvCacRatio ?? 0;
      const payback = data.cacPaybackMonths ?? 99;
      let score = 5;
      if (ltvCac >= 5 && payback < 6) score = 9;
      else if (ltvCac >= 3 && payback < 12) score = 7;
      else if (ltvCac >= 2 && payback < 24) score = 5;
      else if (ltvCac > 0) score = 3;
      else score = 2;
      const conf = ltvCac > 0 ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Exceptional acquisition efficiency with quick payback." : score >= 5 ? "Acceptable customer acquisition economics." : "High CAC relative to LTV — efficiency concerns.", confidence: conf };
    }
    case "D4": {
      const logoChurn = data.logoChurnRate ?? 100;
      const nrr = data.nrr ?? 0;
      let score = 5;
      if (logoChurn < 1 && nrr >= 120) score = 10;
      else if (logoChurn < 2 && nrr >= 100) score = 8;
      else if (logoChurn < 5 && nrr >= 90) score = 6;
      else if (logoChurn < 10) score = 4;
      else score = 2;
      const conf = data.logoChurnRate != null ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Excellent retention with net revenue expansion." : score >= 5 ? "Acceptable retention metrics." : "High churn — customers leaving faster than joining.", confidence: conf };
    }
    case "D5": {
      const runway = data.runwayMonths ?? 0;
      const cm = data.contributionMargin ?? 0;
      let score = 5;
      if (cm > 0 && (runway >= 18 || runway === 0)) score = 8;
      else if (runway >= 18) score = 7;
      else if (runway >= 6) score = 5;
      else if (runway >= 3) score = 3;
      else score = 2;
      if (cm > 50) score = Math.min(10, score + 1);
      const conf = runway > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Clear path to profitability with strong unit economics." : score >= 5 ? "Credible path to profitability with adequate runway." : "Unclear path to profitability — runway concerns.", confidence: conf };
    }
    case "D6": {
      const ms = data.marketShare ?? 0;
      const wl = data.winLossRate ?? 0;
      const moatText = textRichness(data.moatThesis);
      let score = 5;
      if (ms >= 20) score = 9;
      else if (ms >= 10) score = 7;
      else if (ms >= 5) score = 5;
      else if (ms > 0) score = 3;
      if (wl >= 70) score = Math.min(10, score + 1);
      score = Math.max(2, score + Math.floor(moatText / 4));
      const conf = ms > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Strong competitive position with growing market share and defensible moat." : score >= 5 ? "Developing moat with respectable market position." : "Weak competitive position in a commoditized market.", confidence: conf };
    }
    default:
      return { score: 5, reasoning: "No specific evaluator.", confidence: "low" };
  }
}

// ============================================================
// Acquisition-Ready stage scorers
// ============================================================

function scoreAcquisitionDimension(
  dim: DimensionDef,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  switch (dim.id) {
    case "D1": {
      const acqRichness = textRichness(data.acquirerList);
      const score = clamp(Math.round(acqRichness * 0.7 + 3));
      const conf = data.acquirerList ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Strong strategic value — multiple likely acquirers identified." : score >= 5 ? "Clear strategic value with identifiable acquirer universe." : "Limited strategic acquisition value.", confidence: conf };
    }
    case "D2": {
      const patents = data.patentCount ?? 0;
      const ipRichness = textRichness(data.patentDetails);
      const score = patents >= 10 ? 9 : patents >= 5 ? 7 : patents >= 1 ? 5 : Math.max(2, Math.round(ipRichness / 2) + 2);
      const conf = patents > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Strong IP portfolio with granted patents and proprietary technology." : score >= 5 ? "Meaningful IP with defensible technology assets." : "Limited IP protection.", confidence: conf };
    }
    case "D3": {
      const logoRichness = textRichness(data.customerLogos);
      const contractRichness = textRichness(data.contractTerms);
      const score = clamp(Math.round(logoRichness * 0.5 + contractRichness * 0.4 + 2));
      const conf = data.customerLogos ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Strong customer base with enterprise logos and long-term contracts." : score >= 5 ? "Solid customer base with reasonable retention." : "Weak customer base.", confidence: conf };
    }
    case "D4": {
      const recurring = data.revenueComposition?.toLowerCase().includes("recurring") ? 1 : 0;
      const yoy = data.yoyGrowthRate ?? 0;
      let score = 5;
      if (recurring && yoy >= 100) score = 9;
      else if (recurring && yoy >= 50) score = 7;
      else if (recurring) score = 6;
      else score = 3;
      const conf = "medium";
      return { score, reasoning: score >= 7 ? "Highly recurring revenue with strong growth and visibility." : score >= 5 ? "Mostly recurring revenue with predictable forward trajectory." : "Unpredictable revenue with limited visibility.", confidence: conf };
    }
    case "D5": {
      const codeRichness = textRichness(data.codebaseQuality);
      const teamSize = data.engineeringTeamSize ?? 0;
      let score = 5;
      if (teamSize >= 10) score = 8;
      else if (teamSize >= 3) score = 6;
      else if (teamSize > 0) score = 4;
      score = clamp(score + Math.floor(codeRichness / 3));
      const conf = teamSize > 0 ? "high" : "medium";
      return { score, reasoning: score >= 7 ? "Strong technology assets with clean codebase and capable team." : score >= 5 ? "Reasonable technology assets." : "Technology assets are a liability.", confidence: conf };
    }
    case "D6": {
      const capRichness = textRichness(data.capTableSummary);
      const ipAssign = data.ipAssignmentStatus?.toLowerCase().includes("assigned") ? 1 : 0;
      const dataRoom = data.dataRoomReadiness?.toLowerCase().includes("ready") ? 1 : 0;
      const score = clamp(Math.round(capRichness * 0.5 + ipAssign * 2 + dataRoom * 2 + 2));
      const conf = data.capTableSummary ? "high" : "low";
      return { score, reasoning: score >= 7 ? "Exceptionally well-prepared for acquisition — clean cap table, IP assigned, data room ready." : score >= 5 ? "Generally acquisition-ready with manageable issues." : "Not acquisition-ready — significant cleanup needed.", confidence: conf };
    }
    default:
      return { score: 5, reasoning: "No specific evaluator.", confidence: "low" };
  }
}

// ============================================================
// Main scoring dispatcher
// ============================================================

export function scoreDimension(
  dim: DimensionDef,
  stage: Stage,
  data: SubmissionData
): { score: number; reasoning: string; confidence: "high" | "medium" | "low" } {
  switch (stage) {
    case "concept":
      return scoreConceptDimension(dim, data);
    case "prototype":
      return scorePrototypeDimension(dim, data);
    case "mvp":
      return scoreMVPDimension(dim, data);
    case "revenue":
      return scoreRevenueDimension(dim, data);
    case "acquisition-ready":
      return scoreAcquisitionDimension(dim, data);
    default:
      return { score: 5, reasoning: "Unknown stage.", confidence: "low" };
  }
}

// ============================================================
// Full evaluation across all dimensions for a stage
// ============================================================

export function evaluateAllDimensions(
  stage: Stage,
  dims: DimensionDef[],
  data: SubmissionData
): DimensionScore[] {
  return dims.map((dim) => {
    const result = scoreDimension(dim, stage, data);
    return {
      id: dim.id,
      name: dim.name,
      score: result.score,
      weight: dim.weight,
      weightedContribution: result.score * dim.weight * 10,
      reasoning: result.reasoning,
      confidence: result.confidence,
    };
  });
}

// ============================================================
// Stage score calculation (Section 2 formula)
// ============================================================

export function calculateStageScore(dimensionScores: DimensionScore[]): number {
  const total = dimensionScores.reduce(
    (sum, ds) => sum + ds.score * ds.weight * 10,
    0
  );
  return Math.round(total);
}

// ============================================================
// Overall StartupIQ Score (Section 9)
// ============================================================

export function calculateOverallScore(
  stageScore: number,
  stage: Stage
): number {
  const multiplier =
    {
      concept: 0.85,
      prototype: 0.9,
      mvp: 0.95,
      revenue: 1.0,
      "acquisition-ready": 1.05,
    }[stage] ?? 1.0;
  return Math.min(100, Math.round(stageScore * multiplier));
}
