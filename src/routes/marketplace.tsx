import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
}

const startups = seedStartups as SeedStartup[];

type SortField = "score" | "name" | "stage";
type ScoreRange = "all" | "70+" | "50-69" | "below-50";

const STAGE_ORDER: Record<Stage, number> = {
  concept: 0,
  prototype: 1,
  mvp: 2,
  revenue: 3,
  "acquisition-ready": 4,
};

const STAGE_DISPLAY: Record<Stage, { label: string; color: string }> = {
  concept: { label: "Concept", color: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
  prototype: { label: "Prototype", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  mvp: { label: "MVP", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
  revenue: {
    label: "Revenue",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  "acquisition-ready": {
    label: "Acquisition-Ready",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
};

const ALL_CATEGORIES = Array.from(new Set(startups.map((s) => s.category))).sort();

// ---- Score helpers (dark-theme variants) ----
function getScoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 70) return "bg-green-500/15 text-green-400";
  if (score >= 50) return "bg-yellow-500/15 text-yellow-400";
  if (score >= 30) return "bg-orange-500/15 text-orange-400";
  return "bg-red-500/15 text-red-400";
}

function getScoreRing(score: number): string {
  if (score >= 85) return "stroke-emerald-400";
  if (score >= 70) return "stroke-green-400";
  if (score >= 50) return "stroke-yellow-400";
  if (score >= 30) return "stroke-orange-400";
  return "stroke-red-400";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-800"
        />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 94.2} 94.2`}
          className={getScoreRing(score)}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white">{score}</span>
    </div>
  );
}

// ---- The Page ----
export const Route = createFileRoute("/marketplace")({
  component: Marketplace,
});

function Marketplace() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [scoreRange, setScoreRange] = useState<ScoreRange>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortField>("score");

  const filtered = useMemo(() => {
    let results = [...startups];

    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.startupName.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // stage filter
    if (stageFilter !== "all") {
      results = results.filter((s) => s.detectedStage === stageFilter);
    }

    // score range
    if (scoreRange === "70+") {
      results = results.filter((s) => s.overallScore >= 70);
    } else if (scoreRange === "50-69") {
      results = results.filter((s) => s.overallScore >= 50 && s.overallScore < 70);
    } else if (scoreRange === "below-50") {
      results = results.filter((s) => s.overallScore < 50);
    }

    // category
    if (categoryFilter !== "all") {
      results = results.filter((s) => s.category === categoryFilter);
    }

    // sort
    results.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.startupName.localeCompare(b.startupName);
        case "stage":
          return STAGE_ORDER[a.detectedStage] - STAGE_ORDER[b.detectedStage];
        case "score":
        default:
          return b.overallScore - a.overallScore;
      }
    });

    return results;
  }, [search, stageFilter, scoreRange, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setStageFilter("all");
    setScoreRange("all");
    setCategoryFilter("all");
    setSortBy("score");
  };

  const hasActiveFilters =
    search || stageFilter !== "all" || scoreRange !== "all" || categoryFilter !== "all";

  return (
    <div className="min-h-dvh bg-gray-950">
      {/* Page header */}
      <div className="border-b border-gray-800/60">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Startup Marketplace
              </h1>
              <p className="mt-1 text-gray-400">
                Discover evaluated startups with objective StartupIQ scores.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {filtered.length} of {startups.length} startups
            </p>
          </div>

          {/* Search + Filters */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search startups, industries, tags..."
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as Stage | "all")}
              className="rounded-xl border border-gray-700 bg-gray-900/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
            >
              <option value="all">All Stages</option>
              {(
                Object.keys(STAGE_DISPLAY) as Stage[]
              ).map((s) => (
                <option key={s} value={s}>
                  {STAGE_DISPLAY[s].label}
                </option>
              ))}
            </select>

            {/* Score range */}
            <select
              value={scoreRange}
              onChange={(e) => setScoreRange(e.target.value as ScoreRange)}
              className="rounded-xl border border-gray-700 bg-gray-900/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
            >
              <option value="all">All Scores</option>
              <option value="70+">70+ (Strong/Exceptional)</option>
              <option value="50-69">50–69 (Solid)</option>
              <option value="below-50">Below 50 (Developing)</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-gray-700 bg-gray-900/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="rounded-xl border border-gray-700 bg-gray-900/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
            >
              <option value="score">Sort: Score ↓</option>
              <option value="name">Sort: Name A–Z</option>
              <option value="stage">Sort: Stage</option>
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="mb-4 h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-400">No startups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StartupCard({ startup }: { startup: SeedStartup }) {
  const stageInfo = STAGE_DISPLAY[startup.detectedStage];
  const topStrength = startup.topStrengths[0];

  return (
    <Link
      to="/startup/$id"
      params={{ id: startup.id }}
      className="group relative flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 p-6 transition-all hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Score badge */}
      <div className="absolute top-4 right-4">
        <ScoreBadge score={startup.overallScore} />
      </div>

      {/* Stage badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${stageInfo.color}`}
        >
          {stageInfo.label}
        </span>
      </div>

      {/* Name */}
      <h3 className="mb-1.5 pr-14 text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {startup.startupName}
      </h3>

      {/* Category + Industry */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>{startup.industry}</span>
        <span>·</span>
        <span>{startup.category}</span>
        <span>·</span>
        <span>P{startup.percentile}</span>
      </div>

      {/* Description */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-400">
        {startup.shortDescription}
      </p>

      {/* Top strength */}
      {topStrength && (
        <div className="mt-auto rounded-lg border border-gray-800/60 bg-gray-900/60 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">Top Strength</span>
          <p className="mt-0.5 text-xs text-gray-300 line-clamp-1">
            <span className="font-medium text-green-400">{topStrength.dimension}</span>
            {" — "}
            {topStrength.explanation}
          </p>
        </div>
      )}
    </Link>
  );
}
