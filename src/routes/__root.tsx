import {
  HeadContent,
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
      { title: "StartupIQ — AI-Powered Startup Intelligence" },
      {
        name: "description",
        content:
          "Get an objective, evidence-based evaluation of your startup at any stage — from concept to acquisition-ready.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950 text-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-4 text-gray-400">Page not found.</p>
        <a
          href="/"
          className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          ← Back to StartupIQ
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
