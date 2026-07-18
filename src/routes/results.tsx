import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { EvaluationResult } from "~/lib/stages";
import { STAGE_LABELS, getScoreLabel } from "~/lib/stages";

export const Route = createFileRoute("/results")({
  component: Results,
});

function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 30) return "text-orange-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";
  if (score >= 70) return "bg-green-500/10 text-green-400 ring-green-500/20";
  if (score >= 50) return "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20";
  if (score >= 30) return "bg-orange-500/10 text-orange-400 ring-orange-500/20";
  return "bg-red-500/10 text-red-400 ring-red-500/20";
}

function getScoreRingColor(score: number): string {
  if (score >= 85) return "stroke-emerald-400";
  if (score >= 70) return "stroke-green-400";
  if (score >= 50) return "stroke-yellow-400";
  if (score >= 30) return "stroke-orange-400";
  return "stroke-red-400";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-800"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className={`absolute text-4xl font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

function Results() {
  const router = useRouter();
  const state = router.state.location.state as { result?: EvaluationResult } | undefined;
  const result: EvaluationResult | undefined = state?.result;

  // Loading state — no result available yet (e.g. direct navigation without state)
  if (!result) {
    return (
      <main className="min-h-dvh bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
          <p className="mt-4 text-gray-400">No evaluation data found.</p>
          <a
            href="/"
            className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            ← Back to evaluation form
          </a>
        </div>
      </main>
    );
  }

  const {
    startupName,
    detectedStage,
    overallScore,
    scoreLabel,
    percentile,
    topStrengths,
    topWeaknesses,
    summary,
    stageScore,
    dimensionScores,
    stageDiscrepancy,
    selfReportedStage,
    founderEmail,
  } = result;

  return (
    <main className="min-h-dvh bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight text-white">
            StartupIQ
          </a>
          <a
            href="/#evaluate"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Evaluate Another
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Score Hero */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {startupName} — {STAGE_LABELS[detectedStage]} Stage
          </p>
          {stageDiscrepancy && selfReportedStage && (
            <p className="mt-2 text-xs text-amber-400/80">
              Note: You self-reported as {STAGE_LABELS[selfReportedStage]}, but our detection
              classified you as {STAGE_LABELS[detectedStage]} based on your data.
            </p>
          )}
          {founderEmail && (
            <p className="mt-3 text-xs text-gray-500">
              A copy of this report has been sent to{" "}
              <span className="text-gray-400">{founderEmail}</span>.
            </p>
          )}
          <div className="mt-8 flex justify-center">
            <ScoreRing score={overallScore} />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            StartupIQ Score: {overallScore}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${getScoreBg(overallScore)}`}
            >
              {scoreLabel}
            </span>
            <span className="text-sm text-gray-500">
              {(() => {
                const ordinal =
                  percentile % 10 === 1 && percentile !== 11
                    ? "st"
                    : percentile % 10 === 2 && percentile !== 12
                      ? "nd"
                      : percentile % 10 === 3 && percentile !== 13
                        ? "rd"
                        : "th";
                return `${percentile}${ordinal} percentile`;
              })()}
            </span>
          </div>
        </div>

        {/* Stage Score */}
        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {STAGE_LABELS[detectedStage]} Stage Score
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{stageScore}/100</p>
          <p className="mt-1 text-xs text-gray-500">
            Weighted average of {dimensionScores.length} dimensions × stage maturity multiplier
          </p>
        </div>

        {/* Summary */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <p className="text-sm leading-relaxed text-gray-300">{summary}</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Strengths */}
          <div>
            <h3 className="text-lg font-semibold text-green-400">Top Strengths</h3>
            <ul className="mt-3 space-y-3">
              {topStrengths.map((s) => (
                <li
                  key={s.dimension}
                  className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{s.dimension}</span>
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-400 ring-1 ring-inset ring-green-500/20">
                      {s.score}/10
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">{s.explanation}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400">Areas to Improve</h3>
            <ul className="mt-3 space-y-3">
              {topWeaknesses.map((w) => (
                <li
                  key={w.dimension}
                  className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{w.dimension}</span>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400 ring-1 ring-inset ring-orange-500/20">
                      {w.score}/10
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">{w.explanation}</p>
                  <p className="mt-1.5 text-xs font-medium text-indigo-400">
                    💡 {w.recommendation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white">Dimension Breakdown</h3>
          <div className="mt-3 space-y-2">
            {dimensionScores.map((dim) => {
              const barColor =
                dim.score >= 7
                  ? "bg-green-500"
                  : dim.score >= 5
                    ? "bg-yellow-500"
                    : "bg-orange-500";
              return (
                <div
                  key={dim.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3"
                >
                  <span className="w-8 text-center text-xs font-mono text-gray-500">{dim.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-200 truncate">{dim.name}</span>
                      <span className="ml-2 text-sm font-semibold text-white">{dim.score}/10</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-800">
                      <div
                        className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${dim.score * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 text-center sm:p-8">
          <h3 className="text-xl font-bold text-white">Want the full picture?</h3>
          <p className="mt-2 text-sm text-gray-400">
            Get a complete dimensional breakdown, improvement roadmap, benchmark comparison,
            trajectory forecast, and investor readiness assessment.
          </p>
          <a
            href="/#pricing"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
          >
            Get Professional Report — $299
          </a>
          <p className="mt-3 text-xs text-gray-600">
            One-time purchase. Delivered as a detailed PDF report.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/#evaluate"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            ← Evaluate another startup
          </a>
          <span className="hidden text-gray-700 sm:inline">|</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Print this report
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-600">
        <p>StartupIQ — Free evaluation powered by AI. Model version {result.modelVersion}.</p>
      </footer>
    </main>
  );
}
