import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import seedStartups from "~/data/seed-startups.json";
import type { Stage } from "~/lib/stages";
import { STAGE_LABELS } from "~/lib/stages";

// ---- Types ----
interface SeedStartup {
  id: string;
  startupName: string;
  shortDescription: string;
  industry: string;
  category: string;
  tags: string[];
  detectedStage: Stage;
  overallScore: number;
  scoreLabel: string;
  percentile: number;
  topStrengths: { dimension: string; score: number; explanation: string }[];
  topWeaknesses: { dimension: string; score: number; explanation: string; recommendation: string }[];
  summary: string;
  dimensionScores: { id: string; name: string; score: number; weight: number; weightedContribution: number; reasoning: string; confidence: string }[];
  stageScore: number;
  stageDiscrepancy: boolean;
  modelVersion: string;
  createdAt: string;
}

const startups = seedStartups as SeedStartup[];

const STAGE_DISPLAY: Record<Stage, { label: string; color: string; ring: string }> = {
  concept: { label: "Concept", color: "bg-violet-500/10 text-violet-400 border-violet-500/30", ring: "ring-violet-500/20" },
  prototype: { label: "Prototype", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", ring: "ring-blue-500/20" },
  mvp: { label: "MVP", color: "bg-teal-500/10 text-teal-400 border-teal-500/30", ring: "ring-teal-500/20" },
  revenue: { label: "Revenue-Generating", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", ring: "ring-amber-500/20" },
  "acquisition-ready": { label: "Acquisition-Ready", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", ring: "ring-emerald-500/20" },
};

// ---- Score helpers ----
function getScoreRing(score: number): string {
  if (score >= 85) return "stroke-emerald-400";
  if (score >= 70) return "stroke-green-400";
  if (score >= 50) return "stroke-yellow-400";
  if (score >= 30) return "stroke-orange-400";
  return "stroke-red-400";
}

function getScoreLabelColor(score: number): string {
  if (score >= 85) return "text-emerald-400 bg-emerald-500/10";
  if (score >= 70) return "text-green-400 bg-green-500/10";
  if (score >= 50) return "text-yellow-400 bg-yellow-500/10";
  if (score >= 30) return "text-orange-400 bg-orange-500/10";
  return "text-red-400 bg-red-500/10";
}

function getDimensionBarColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  if (score >= 3) return "bg-orange-500";
  return "bg-red-500";
}

function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case "high": return "bg-emerald-500/15 text-emerald-400";
    case "medium": return "bg-yellow-500/15 text-yellow-400";
    case "low": return "bg-red-500/15 text-red-400";
    default: return "bg-gray-500/15 text-gray-400";
  }
}

export const Route = createFileRoute("/startup/$id")({
  component: StartupProfile,
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Startup Not Found</h1>
        <p className="text-gray-400">We couldn't find a startup with that ID.</p>
        <Link
          to="/marketplace"
          className="mt-4 inline-block rounded-lg border border-gray-700 px-6 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  ),
});

function StartupProfile() {
  const { id } = useParams({ from: "/startup/$id" });
  const startup = startups.find((s) => s.id === id);

  if (!startup) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Startup Not Found</h1>
          <p className="text-gray-400">We couldn't find a startup with ID "{id}".</p>
          <Link
            to="/marketplace"
            className="mt-4 inline-block rounded-lg border border-gray-700 px-6 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const stageInfo = STAGE_DISPLAY[startup.detectedStage];

  return (
    <div className="min-h-dvh bg-gray-950">
      {/* Back nav */}
      <div className="border-b border-gray-800/60">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* ---- Header Section ---- */}
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Score ring */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 40 40">
                <circle
                  cx="20" cy="20" r="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-800"
                />
                <circle
                  cx="20" cy="20" r="17"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(startup.overallScore / 100) * 106.8} 106.8`}
                  className={getScoreRing(startup.overallScore)}
                />
              </svg>
              <span className="absolute text-3xl font-extrabold text-white">
                {startup.overallScore}
              </span>
            </div>
            <span className={`mt-2 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${getScoreLabelColor(startup.overallScore)}`}>
              {startup.scoreLabel}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              {startup.percentile}th percentile
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {startup.startupName}
              </h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
            </div>

            <p className="mb-4 text-lg leading-relaxed text-gray-300">
              {startup.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">{startup.industry}</span>
              <span className="text-gray-700">·</span>
              <span className="text-sm text-gray-500">{startup.category}</span>
              {startup.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-gray-700/50 bg-gray-800/50 px-2 py-0.5 text-xs text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stage info */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Detected Stage</span>
                <p className="font-medium text-white">{STAGE_LABELS[startup.detectedStage]}</p>
              </div>
              {startup.stageDiscrepancy && (
                <div>
                  <span className="text-amber-400">Stage Discrepancy</span>
                  <p className="font-medium text-white">
                    Self-reported: {startup.detectedStage ? STAGE_LABELS[startup.detectedStage] : "N/A"}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Stage Score</span>
                <p className="font-medium text-white">{startup.stageScore}/100</p>
              </div>
              <div>
                <span className="text-gray-500">Model Version</span>
                <p className="font-medium text-white">v{startup.modelVersion}</p>
              </div>
              <div>
                <span className="text-gray-500">Evaluated</span>
                <p className="font-medium text-white">
                  {new Date(startup.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Executive Summary ---- */}
        <div className="mb-10 rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Executive Summary</h2>
          <p className="leading-relaxed text-gray-300">{startup.summary}</p>
        </div>

        {/* ---- Dimension Score Breakdown ---- */}
        <div className="mb-10">
          <h2 className="mb-6 text-lg font-semibold text-white">Stage Score Breakdown</h2>
          <div className="space-y-4">
            {startup.dimensionScores.map((dim) => (
              <div
                key={dim.id}
                className="rounded-xl border border-gray-800 bg-gray-900/30 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{dim.name}</span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getConfidenceColor(dim.confidence)}`}>
                        {dim.confidence}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">Weight: {Math.round(dim.weight * 100)}%</span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">Contribution: {dim.weightedContribution.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getDimensionBarColor(dim.score)}`}
                          style={{ width: `${dim.score * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white tabular-nums w-6 text-right">
                        {dim.score}
                      </span>
                      <span className="text-xs text-gray-500">/10</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{dim.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Strengths & Weaknesses ---- */}
        <div className="grid gap-8 lg:grid-cols-2 mb-10">
          {/* Strengths */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-green-400 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Top Strengths
            </h2>
            <div className="space-y-3">
              {startup.topStrengths.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-green-500/10 bg-green-500/5 p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{s.dimension}</span>
                    <span className="inline-flex items-center rounded-full bg-green-500/15 px-1.5 py-0.5 text-xs font-bold text-green-400">
                      {s.score}/10
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-400">{s.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-amber-400 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Areas for Improvement
            </h2>
            <div className="space-y-3">
              {startup.topWeaknesses.map((w, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{w.dimension}</span>
                    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                      {w.score}/10
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-400 mb-2">{w.explanation}</p>
                  <div className="rounded-lg border border-gray-700/50 bg-gray-900/50 px-3 py-2">
                    <span className="text-xs font-medium text-indigo-400">Recommendation</span>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-300">{w.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Request Introduction CTA ---- */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Interested in {startup.startupName}?</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Request an introduction to the founding team. Our marketplace connects qualified
            investors and acquirers with evaluated startups.
          </p>
          <button
            onClick={() => {
              console.log("Request introduction for:", startup.startupName, startup.id);
              alert(`Introduction request for ${startup.startupName} has been logged. (This is a placeholder — real functionality coming soon.)`);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Request Introduction
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Available to Explorer, Professional, and Enterprise subscribers
          </p>
        </div>
      </div>
    </div>
  );
}
