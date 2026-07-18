import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

// ---- Server function for form submissions ----
const submitEvaluation = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) => data as {
      startupName: string;
      stage: string;
      description: string;
      url: string;
      email: string;
    }
  )
  .handler(async ({ data }) => {
    // Log the submission (replace with DB write when database is connected)
    console.log("=== StartupIQ Evaluation Submission ===");
    console.log("Startup Name:", data.startupName);
    console.log("Stage:", data.stage);
    console.log("Description:", data.description);
    console.log("URL:", data.url);
    console.log("Email:", data.email);
    console.log("Submitted at:", new Date().toISOString());
    console.log("========================================");

    return { success: true };
  });

export const Route = createFileRoute("/")({
  component: Home,
});

// ---- Section Components ----

function NavBar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-indigo-400">Startup</span>
            <span className="text-white">IQ</span>
          </span>
        </a>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a
            href="#submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors"
          >
            Evaluate Your Startup
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-2/3 left-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Startup Intelligence
        </span>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          The AI Intelligence Platform for{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Evaluating, Discovering, and Connecting
          </span>{" "}
          the World's Startups.
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
          Get an objective, AI-powered evaluation of your startup — from concept
          to acquisition-ready — and connect with investors, acquirers, and
          partners.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#submit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
          >
            Evaluate Your Startup Free
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-lg font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <span>Stage-agnostic evaluation</span>
          <span className="hidden sm:inline">·</span>
          <span>AI-powered scoring</span>
          <span className="hidden sm:inline">·</span>
          <span>Investor-ready reports</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Submit Your Startup",
      description:
        "Share your idea, prototype, MVP, or revenue business. We accept startups at every stage — no funding required.",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI Evaluates Your Startup",
      description:
        "Our AI produces stage-appropriate scoring, market analysis, and identifies strengths and weaknesses with precision.",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Get Your Intelligence Report",
      description:
        "Receive actionable feedback and a strategic improvement roadmap tailored to your startup's stage and goals.",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Connect With Opportunities",
      description:
        "Get matched with relevant investors, acquirers, or strategic partners who are actively looking for startups like yours.",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-400">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From idea to exit — in four steps
          </h2>
          <p className="mt-4 text-gray-400">
            Our AI-powered platform evaluates and connects startups at every stage of growth.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-full hidden h-px w-8 bg-gradient-to-r from-gray-700 to-transparent lg:block" />
              )}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 hover:bg-gray-900/80 transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-700">
                    {step.number}
                  </span>
                  <span className="text-teal-400">{step.icon}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get your startup evaluated and understand where you stand.",
      features: [
        "Basic evaluation & score",
        "Strengths & weaknesses analysis",
        "Stage assessment",
        "Public profile listing",
      ],
      cta: "Get Started Free",
      href: "#submit",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "one-time",
      description:
        "Deep intelligence for founders preparing to raise or sell.",
      features: [
        "Deep intelligence report",
        "Investor readiness score",
        "Acquisition potential score",
        "Technical analysis",
        "Strategic roadmap",
        "Market positioning analysis",
        "Competitive landscape",
      ],
      cta: "Get Professional Report",
      href: "#submit",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$2,500+",
      period: "custom",
      description:
        "Full due diligence for serious transactions and acquisitions.",
      features: [
        "Full due diligence package",
        "Custom analysis & deep dives",
        "Acquisition preparation",
        "Ongoing advisory support",
        "Private investor matching",
        "Term sheet review",
        "Priority concierge support",
      ],
      cta: "Contact Sales",
      href: "#submit",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
            Pricing
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Intelligence for every stage
          </h2>
          <p className="mt-4 text-gray-400">
            From a free first look to full enterprise due diligence.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                  : "border-gray-800 bg-gray-900/30"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-gray-500 text-sm">/{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-gray-400">{tier.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        tier.highlighted ? "text-indigo-400" : "text-teal-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
                    : "border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubmissionForm() {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitEvaluation({
        data: {
          startupName: String(formData.get("startupName") ?? ""),
          stage: String(formData.get("stage") ?? ""),
          description: String(formData.get("description") ?? ""),
          url: String(formData.get("url") ?? ""),
          email: String(formData.get("email") ?? ""),
        },
      });

      if (result.success) {
        setFormState("success");
        form.reset();
      } else {
        setFormState("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch (err) {
      setFormState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const stages = [
    "Concept",
    "Prototype",
    "MVP",
    "Revenue-Generating",
    "Acquisition-Ready",
  ];

  return (
    <section id="submit" className="relative py-24 px-6">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400">
            Get Evaluated
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Submit Your Startup
          </h2>
          <p className="mt-4 text-gray-400">
            Get a free AI-powered evaluation in minutes. No credit card
            required.
          </p>
        </div>

        {formState === "success" ? (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10">
              <svg
                className="h-8 w-8 text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Submission Received!</h3>
            <p className="mt-2 text-gray-400">
              We're evaluating your startup now. You'll receive your
              intelligence report via email shortly.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className="mt-6 rounded-lg border border-gray-700 px-6 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
            >
              Submit Another Startup
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
          >
            <div>
              <label
                htmlFor="startupName"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Startup Name *
              </label>
              <input
                id="startupName"
                name="startupName"
                type="text"
                required
                placeholder="e.g. Acme AI"
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="stage"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Stage *
              </label>
              <select
                id="stage"
                name="stage"
                required
                defaultValue=""
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select your stage
                </option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Short Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                placeholder="What does your startup do?"
                className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Website or GitHub URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {formState === "error" && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Get Your Free Evaluation"
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By submitting, you agree to StartupIQ's evaluation process. We'll
              never share your data without permission.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-indigo-400">Startup</span>
              <span className="text-white">IQ</span>
            </span>
            <span className="text-xs text-gray-600">
              © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#submit" className="hover:text-white transition-colors">
              Get Evaluated
            </a>
          </div>

          <p className="text-xs text-gray-600">
            AI-Powered Startup Intelligence Platform
          </p>
        </div>
      </div>
    </footer>
  );
}

// ---- Main Page Component ----
function Home() {
  return (
    <div className="min-h-dvh">
      <NavBar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <SubmissionForm />
      <Footer />
    </div>
  );
}
