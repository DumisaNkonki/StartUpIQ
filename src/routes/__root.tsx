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
