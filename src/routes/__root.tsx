import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "StartupIQ — AI-Powered Startup Intelligence & Evaluation Platform",
      },
      {
        name: "description",
        content:
          "Get an objective, AI-powered evaluation of your startup — from concept to acquisition-ready — and connect with investors, acquirers, and partners.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
      },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <SiteNav />
      <Outlet />
      <SiteFooter />
    </RootDocument>
  );
}

function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-indigo-400">Startup</span>
            <span className="text-white">IQ</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors [&.active]:text-white">
            Home
          </Link>
          <Link
            to="/marketplace"
            className="hover:text-white transition-colors [&.active]:text-white"
          >
            Marketplace
          </Link>
          <a href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a
            href="/#submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors"
          >
            Evaluate Your Startup
          </a>
        </div>
      </div>
    </nav>
  );
}

function SiteFooter() {
  const legalLinks = [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "AI Disclaimer", href: "/legal/ai-disclaimer" },
    { label: "Investment/Financial Disclaimer", href: "/legal/investment-disclaimer" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "Refund Policy", href: "/legal/refunds" },
    { label: "Acceptable Use Policy", href: "/legal/acceptable-use" },
  ];

  return (
    <footer className="w-full border-t border-gray-800/60 bg-gray-950 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="hover:text-gray-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} StartupIQ. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-gray-950 text-gray-100 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
