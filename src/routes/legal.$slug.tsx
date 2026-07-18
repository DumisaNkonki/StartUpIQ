import { createFileRoute, Link, useParams } from "@tanstack/react-router";

const SLUG_LABELS: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  "ai-disclaimer": "AI Disclaimer",
  "investment-disclaimer": "Investment / Financial Disclaimer",
  cookies: "Cookie Policy",
  refunds: "Refund Policy",
  "acceptable-use": "Acceptable Use Policy",
};

export const Route = createFileRoute("/legal/$slug")({
  component: LegalPage,
  notFoundComponent: () => (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-2xl font-bold text-white">Policy Not Found</h1>
      <p className="mb-6 text-gray-400">
        The legal page you're looking for doesn't exist.
      </p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
        Back to Home
      </Link>
    </main>
  ),
});

function LegalPage() {
  const { slug } = useParams({ from: "/legal/$slug" });
  const title = SLUG_LABELS[slug] ?? slug.replace(/-/g, " ");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-white">{title}</h1>
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/60 p-8">
        <p className="leading-relaxed text-gray-300">
          This policy page is under review. For questions, contact{" "}
          <a
            href="mailto:legal@startupiq.ai"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            legal@startupiq.ai
          </a>
          .
        </p>
      </div>
      <div className="mt-8">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
