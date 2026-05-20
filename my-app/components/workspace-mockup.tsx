"use client";

import { useState } from "react";
import {
  Sparkles,
  GitBranch,
  Search,
  LayoutDashboard,
  User,
  Settings,
  Globe,
  PlusCircle,
  ThumbsUp,
  Cpu,
  BookOpen,
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function WorkspaceMockupCard() {
  const [activeTab, setActiveTab] = useState<"overview" | "ai" | "builds">("overview");

  return (
    <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-mockup overflow-hidden select-none">
      {/* Mock Browser Header / Window Controls */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex max-w-xs items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground w-48 sm:w-64 justify-center">
          <Globe className="h-3 w-3 text-muted-foreground/60" />
          <span className="truncate">buildernetwork.com/ideas/saas-accelerator</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex min-h-[420px] flex-col sm:flex-row">
        {/* Mock Application Sidebar */}
        <aside className="w-full border-r border-border bg-muted/10 p-4 sm:w-56 shrink-0 flex flex-row sm:flex-col justify-between sm:justify-start gap-4">
          <div className="flex sm:flex-col gap-1 sm:gap-2 w-full">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-2 hidden sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                <PlusCircle className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75">
                Builder Shell
              </span>
            </div>
            
            <button className="flex w-full items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-left text-sm font-medium text-primary transition-all">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Discover Ideas</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">My Dashboard</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Public Profile</span>
            </button>
          </div>

          <div className="mt-auto sm:border-t sm:border-border sm:pt-4 w-fit sm:w-full">
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </aside>

        {/* Mock Application Main Panel */}
        <main className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Breadcrumbs & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Ideas</span>
                <span>/</span>
                <span className="text-foreground font-medium">SaaS-Accelerator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                  In Progress
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-[#eefcf2] dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" /> 8.8 Excellent
                </span>
              </div>
            </div>

            {/* Title & Creator */}
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                AI-Powered Micro-SaaS Accelerator
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted by{" "}
                <span className="font-medium text-foreground hover:underline cursor-pointer">
                  @creator_max
                </span>{" "}
                · 2 days ago
              </p>
            </div>

            {/* Interactive Tabs */}
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "ai"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Review Result
              </button>
              <button
                onClick={() => setActiveTab("builds")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "builds"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Active Builds (2)
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[180px] transition-all">
              {activeTab === "overview" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    A lightweight pipeline helper that listens to repository push events and
                    automatically runs developer lint tests, compiles builds, and notifies Slack/Discord. 
                    Unlike heavy CI tools, this requires zero configuration and uses AI to inspect errors automatically.
                  </p>
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75 mb-1.5">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {["Next.js", "AI Integrations", "PostgreSQL", "GitHub API"].map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-md bg-card-tint-lavender px-2 py-0.5 text-xs font-semibold text-brand-purple-800 dark:text-purple-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75 mb-1.5">
                        Difficulty
                      </h4>
                      <span className="inline-flex items-center rounded-md bg-card-tint-peach px-2 py-0.5 text-xs font-semibold text-brand-orange-deep dark:text-orange-300">
                        Intermediate
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3.5 bg-card-tint-yellow-bold/10">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Feasibility Review
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Excellent MVP candidate. Uses standard OAuth hooks. NVIDIA AI API handles logs 
                        processing. Highly feasible.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3.5 bg-card-tint-peach/10">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-red-500" />
                        Market Alternatives
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Similar category: GitHub Actions / Vercel Builds. This differentiates by offering 
                        direct AI-guided debug support inside Discord.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-[#f5f5f5]/30">
                    <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                      Brutal Suggestions
                    </h4>
                    <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                      <li>Do not support arbitrary repository sizes; cap at 100MB for the MVP.</li>
                      <li>Highlight Slack notification webhook settings early during onboard.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "builds" && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="rounded-lg border border-border p-4 bg-background hover:bg-muted/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-semibold text-ink">
                          Rust-based Light Runner
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          In Progress
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lead: <span className="font-medium text-foreground">@sam_dev</span> · 3 builders active
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink hover:bg-muted"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        <span>Repository</span>
                      </a>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 bg-background hover:bg-muted/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-semibold text-ink">
                          Next.js Complete Accel
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.2 text-[10px] font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Built
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lead: <span className="font-medium text-foreground">@julia_codes</span> · 2 builders
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-muted"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="https://vercel.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>Live Demo</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="mt-8 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Click tabs above to see simulated application screens.
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Live Preview</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
