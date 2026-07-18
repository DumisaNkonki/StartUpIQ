import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Stage, EvaluationResult } from "~/lib/stages";
import { STAGE_LABELS } from "~/lib/stages";

// Import the evaluate server function from the API route
import { evaluate } from "~/routes/api/-evaluate";

export const Route = createFileRoute("/")({
  component: Home,
});

const stageOptions: { value: Stage; label: string }[] = [
  { value: "concept", label: "Concept — Idea stage, no product yet" },
  { value: "prototype", label: "Prototype — Working demo, no users" },
  { value: "mvp", label: "MVP — Live product with real users" },
  { value: "revenue", label: "Revenue-Generating — Making money" },
  { value: "acquisition-ready", label: "Acquisition-Ready — Strategic exit potential" },
];

function Home() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRevenue, setHasRevenue] = useState(false);
  const [hasMVP, setHasMVP] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (key in data) {
        const existing = data[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          data[key] = [existing, value];
        }
      } else {
        data[key] = value;
      }
    });

    // Explicitly set boolean checkbox values from state (checkboxes only appear
    // in FormData when checked; we need to send the actual boolean for unchecked)
    data["hasRevenue"] = hasRevenue ? "true" : "false";
    data["hasMVP"] = hasMVP ? "true" : "false";

    if (stage) {
      data["stage"] = stage;
    }

    try {
      const result: EvaluationResult = await evaluate({ data });
      navigate({ to: "/results", state: { result } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  }

  function handleStageChange(newStage: Stage | "") {
    setStage(newStage);
    setHasRevenue(false);
    setHasMVP(false);
  }

  return (
    <main className="min-h-dvh bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight text-white">
            StartupIQ
          </a>
          <nav className="hidden gap-6 text-sm text-gray-400 sm:flex">
            <a href="#evaluate" className="hover:text-white transition-colors">
              Evaluate
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 text-center sm:py-24">
        <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
          AI-Powered Startup Intelligence
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Get an objective, evidence-based evaluation of your startup — at any stage
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          From napkin sketch to acquisition-ready. StartupIQ evaluates your startup against
          stage-appropriate criteria and shows you exactly how to improve.
        </p>
      </section>

      {/* Form section */}
      <section id="evaluate" className="px-6 pb-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">Evaluate Your Startup</h2>
          <p className="mt-1 text-sm text-gray-400">
            Free evaluation takes ~3 minutes. No signup required.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Basic fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="startupName" className="block text-sm font-medium text-gray-300">
                  Startup Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="startupName"
                  name="startupName"
                  type="text"
                  required
                  placeholder="e.g. Acme Analytics"
                  className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  Describe Your Startup <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  placeholder="What problem are you solving? Who is it for? What's your solution?"
                  className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300">
                  Website URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://yourstartup.com"
                  className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-300">
                  What stage is your startup at? <span className="text-indigo-400">*</span>
                </label>
                <select
                  id="stage"
                  name="stage"
                  required
                  value={stage}
                  onChange={(e) => handleStageChange(e.target.value as Stage | "")}
                  className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select a stage...</option>
                  {stageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stage detection fields */}
            {stage && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">Stage Detection Signals</h3>
                <p className="text-xs text-gray-500">
                  These help us verify your stage and provide a more accurate evaluation.
                </p>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="hasRevenue"
                    checked={hasRevenue}
                    onChange={(e) => setHasRevenue(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">Has revenue (≥$1K MRR or equivalent)</span>
                </label>

                {hasRevenue && (
                  <div>
                    <label htmlFor="revenueAmount" className="block text-sm font-medium text-gray-300">
                      Monthly Revenue ($)
                    </label>
                    <input
                      id="revenueAmount"
                      name="revenueAmount"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="hasMVP"
                    checked={hasMVP}
                    onChange={(e) => setHasMVP(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">Has a live MVP with real users</span>
                </label>

                {hasMVP && (
                  <div>
                    <label htmlFor="userCount" className="block text-sm font-medium text-gray-300">
                      Number of Users
                    </label>
                    <input
                      id="userCount"
                      name="userCount"
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="hasPrototype"
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">Has a working prototype (not yet live)</span>
                </label>
              </div>
            )}

            {/* Concept stage fields */}
            {stage === "concept" && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">Concept Details</h3>
                <p className="text-xs text-gray-500">
                  The more detail you provide, the more accurate your evaluation.
                </p>

                <div>
                  <label htmlFor="problemStatement" className="block text-sm font-medium text-gray-300">
                    Problem Statement
                  </label>
                  <textarea
                    id="problemStatement"
                    name="problemStatement"
                    rows={2}
                    placeholder="What painful, urgent problem are you solving?"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="targetUser" className="block text-sm font-medium text-gray-300">
                    Target User
                  </label>
                  <input
                    id="targetUser"
                    name="targetUser"
                    type="text"
                    placeholder="Who experiences this problem? Be specific."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="uniqueValueProp" className="block text-sm font-medium text-gray-300">
                    Unique Value Proposition
                  </label>
                  <textarea
                    id="uniqueValueProp"
                    name="uniqueValueProp"
                    rows={2}
                    placeholder="How is your solution different from what exists today?"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tamEstimate" className="block text-sm font-medium text-gray-300">
                      TAM Estimate ($)
                    </label>
                    <input
                      id="tamEstimate"
                      name="tamEstimate"
                      type="number"
                      min="0"
                      placeholder="e.g. 500000000"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="marketGrowthRate" className="block text-sm font-medium text-gray-300">
                      Market Growth Rate (% CAGR)
                    </label>
                    <input
                      id="marketGrowthRate"
                      name="marketGrowthRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 15"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="founderBackground" className="block text-sm font-medium text-gray-300">
                    Founder Background
                  </label>
                  <textarea
                    id="founderBackground"
                    name="founderBackground"
                    rows={2}
                    placeholder="Relevant domain experience, skills, and track record."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="founderExperienceYears" className="block text-sm font-medium text-gray-300">
                    Years of Domain Experience
                  </label>
                  <input
                    id="founderExperienceYears"
                    name="founderExperienceYears"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Prototype stage fields */}
            {stage === "prototype" && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">Prototype Details</h3>
                <p className="text-xs text-gray-500">
                  Tell us about what you've built so far.
                </p>

                <div>
                  <label htmlFor="technicalArchitecture" className="block text-sm font-medium text-gray-300">
                    Technical Architecture
                  </label>
                  <textarea
                    id="technicalArchitecture"
                    name="technicalArchitecture"
                    rows={2}
                    placeholder="Tech stack, architecture decisions, key components."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="prototypeDemo" className="block text-sm font-medium text-gray-300">
                    Prototype Demo Link
                  </label>
                  <input
                    id="prototypeDemo"
                    name="prototypeDemo"
                    type="url"
                    placeholder="Link to video, screenshots, or live demo"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="productDesignNotes" className="block text-sm font-medium text-gray-300">
                    Product Design Notes
                  </label>
                  <textarea
                    id="productDesignNotes"
                    name="productDesignNotes"
                    rows={2}
                    placeholder="UX approach, design principles, user workflows."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="innovationThesis" className="block text-sm font-medium text-gray-300">
                    Innovation Thesis
                  </label>
                  <textarea
                    id="innovationThesis"
                    name="innovationThesis"
                    rows={2}
                    placeholder="What's novel about your approach? Why can't incumbents easily copy it?"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="developmentTimeline" className="block text-sm font-medium text-gray-300">
                    Development Timeline
                  </label>
                  <textarea
                    id="developmentTimeline"
                    name="developmentTimeline"
                    rows={2}
                    placeholder="When did you start? Key milestones achieved. Time to MVP."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* MVP stage fields */}
            {stage === "mvp" && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">MVP Metrics</h3>
                <p className="text-xs text-gray-500">
                  Share your key user metrics for a data-driven evaluation.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="mauCount" className="block text-sm font-medium text-gray-300">
                      Monthly Active Users (MAU)
                    </label>
                    <input
                      id="mauCount"
                      name="mauCount"
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="userGrowthRate" className="block text-sm font-medium text-gray-300">
                      User Growth Rate (% MoM)
                    </label>
                    <input
                      id="userGrowthRate"
                      name="userGrowthRate"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g. 15"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="dauMauRatio" className="block text-sm font-medium text-gray-300">
                      DAU/MAU Ratio (%)
                    </label>
                    <input
                      id="dauMauRatio"
                      name="dauMauRatio"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 25"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="day1Retention" className="block text-sm font-medium text-gray-300">
                      Day-1 Retention (%)
                    </label>
                    <input
                      id="day1Retention"
                      name="day1Retention"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 45"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="day30Retention" className="block text-sm font-medium text-gray-300">
                      Day-30 Retention (%)
                    </label>
                    <input
                      id="day30Retention"
                      name="day30Retention"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 20"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="npsScore" className="block text-sm font-medium text-gray-300">
                      NPS Score
                    </label>
                    <input
                      id="npsScore"
                      name="npsScore"
                      type="number"
                      min="-100"
                      max="100"
                      placeholder="e.g. 40"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="feedbackSummary" className="block text-sm font-medium text-gray-300">
                    Customer Feedback Summary
                  </label>
                  <textarea
                    id="feedbackSummary"
                    name="feedbackSummary"
                    rows={2}
                    placeholder="What are users saying? Key themes from feedback, reviews, or interviews."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Revenue stage fields */}
            {stage === "revenue" && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">Revenue & Growth Metrics</h3>
                <p className="text-xs text-gray-500">
                  Financial metrics drive evaluation at this stage.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="mrr" className="block text-sm font-medium text-gray-300">
                      MRR ($)
                    </label>
                    <input
                      id="mrr"
                      name="mrr"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="arr" className="block text-sm font-medium text-gray-300">
                      ARR ($)
                    </label>
                    <input
                      id="arr"
                      name="arr"
                      type="number"
                      min="0"
                      placeholder="e.g. 60000"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="yoyGrowthRate" className="block text-sm font-medium text-gray-300">
                      YoY Growth Rate (%)
                    </label>
                    <input
                      id="yoyGrowthRate"
                      name="yoyGrowthRate"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g. 80"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="grossMargin" className="block text-sm font-medium text-gray-300">
                      Gross Margin (%)
                    </label>
                    <input
                      id="grossMargin"
                      name="grossMargin"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 75"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="revenueComposition" className="block text-sm font-medium text-gray-300">
                    Revenue Composition
                  </label>
                  <textarea
                    id="revenueComposition"
                    name="revenueComposition"
                    rows={2}
                    placeholder="Subscription, usage-based, one-time, services? What % is recurring?"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="ltvCacRatio" className="block text-sm font-medium text-gray-300">
                      LTV:CAC Ratio
                    </label>
                    <input
                      id="ltvCacRatio"
                      name="ltvCacRatio"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g. 3.5"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="logoChurnRate" className="block text-sm font-medium text-gray-300">
                      Logo Churn Rate (%)
                    </label>
                    <input
                      id="logoChurnRate"
                      name="logoChurnRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 3"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="runwayMonths" className="block text-sm font-medium text-gray-300">
                      Cash Runway (months)
                    </label>
                    <input
                      id="runwayMonths"
                      name="runwayMonths"
                      type="number"
                      min="0"
                      placeholder="e.g. 18"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Acquisition-ready fields */}
            {stage === "acquisition-ready" && (
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-200">Acquisition Signals</h3>
                <p className="text-xs text-gray-500">
                  Tell us about your strategic assets and acquisition readiness.
                </p>

                <div>
                  <label htmlFor="acquirerList" className="block text-sm font-medium text-gray-300">
                    Likely Acquirers
                  </label>
                  <textarea
                    id="acquirerList"
                    name="acquirerList"
                    rows={2}
                    placeholder="Which companies would find your startup strategically valuable? Why?"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="patentCount" className="block text-sm font-medium text-gray-300">
                      Number of Patents
                    </label>
                    <input
                      id="patentCount"
                      name="patentCount"
                      type="number"
                      min="0"
                      placeholder="e.g. 3"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="engineeringTeamSize" className="block text-sm font-medium text-gray-300">
                      Engineering Team Size
                    </label>
                    <input
                      id="engineeringTeamSize"
                      name="engineeringTeamSize"
                      type="number"
                      min="0"
                      placeholder="e.g. 8"
                      className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="capTableSummary" className="block text-sm font-medium text-gray-300">
                    Cap Table Summary
                  </label>
                  <textarea
                    id="capTableSummary"
                    name="capTableSummary"
                    rows={2}
                    placeholder="Brief overview: founder ownership, investors, option pool, etc."
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="ipAssignmentStatus" className="block text-sm font-medium text-gray-300">
                    IP Assignment Status
                  </label>
                  <input
                    id="ipAssignmentStatus"
                    name="ipAssignmentStatus"
                    type="text"
                    placeholder="e.g. All IP assigned to company, clean chain of title"
                    className="mt-1.5 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !stage}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating...
                </span>
              ) : (
                "Get Your Free Evaluation"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-gray-800 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Tell us about your startup",
                desc: "Fill out a short form about your idea, product, or business. Takes ~3 minutes.",
              },
              {
                step: "2",
                title: "AI evaluates your startup",
                desc: "Our engine analyzes your submission against stage-appropriate criteria with evidence-based scoring.",
              },
              {
                step: "3",
                title: "Get your StartupIQ Score",
                desc: "Receive your score, strengths, weaknesses, and actionable recommendations to improve.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-gray-800 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Pricing</h2>
          <p className="mt-3 text-gray-400">From free evaluation to institutional-grade due diligence.</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                features: [
                  "StartupIQ Score (0–100)",
                  "Stage classification",
                  "Top 3 strengths",
                  "Top 3 improvement areas",
                  "Peer percentile rank",
                  "Executive summary",
                ],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Professional",
                price: "$299",
                features: [
                  "Everything in Free",
                  "Full dimensional breakdown",
                  "Improvement roadmap",
                  "Risk & opportunity assessment",
                  "Benchmark comparison",
                  "Trajectory indicator",
                  "Investor readiness score",
                ],
                cta: "Get Professional Report",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "$2,500+",
                features: [
                  "Everything in Professional",
                  "Analyst deep-dive review",
                  "Financial analysis",
                  "Acquisition readiness scorecard",
                  "Competitive benchmarking",
                  "Investor package",
                  "Dedicated analyst support",
                ],
                cta: "Contact Us",
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 text-left ${
                  tier.highlight
                    ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/30"
                    : "border-gray-800 bg-gray-900/50"
                }`}
              >
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <p className="mt-2 text-3xl font-bold text-white">{tier.price}</p>
                {tier.name === "Enterprise" && (
                  <p className="text-xs text-gray-500">one-time, starting at</p>
                )}
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="mt-0.5 h-4 w-4 flex-none text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.name === "Enterprise" ? "mailto:hello@startupiq.dev" : "#evaluate"}
                  className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-600">
        <p>StartupIQ — AI-powered startup intelligence. Built with cto.new</p>
      </footer>
    </main>
  );
}
