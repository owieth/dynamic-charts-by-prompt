"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback } from "react";
import { useUIStream } from "@json-render/react";
import type { Spec } from "@json-render/core";

const DashboardRenderer = dynamic(
  () => import("@/components/dashboard-renderer").then((m) => m.DashboardRenderer),
  { ssr: false }
);

const EXAMPLE_PROMPTS = [
  "Portfolio overview: total capacity, CapEx, project count, and avg Frigg score as metrics with technology breakdown charts",
  "Show projects by country as a bar chart and by status as a doughnut chart side by side",
  "Renewable energy pipeline: projects by commissioning year, capacity by country, and Frigg score distribution",
];

function isSpecEmpty(spec: Spec | null): boolean {
  if (!spec) return true;
  return !spec.root || Object.keys(spec.elements).length === 0;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [emptyResult, setEmptyResult] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resetLayoutRef = useRef<(() => void) | null>(null);

  const onComplete = useCallback((finalSpec: Spec) => {
    if (isSpecEmpty(finalSpec)) setEmptyResult(true);
  }, []);

  const { spec, isStreaming, error, send, clear } = useUIStream({
    api: "/api/generate",
    onComplete,
  });

  const hasContent = !isSpecEmpty(spec);
  const displayError = error?.message
    ?? (emptyResult ? "No response received — check your API key and account balance." : null);

  function submitPrompt() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setEmptyResult(false);
    send(trimmed);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitPrompt();
  }

  function handleClear() {
    clear();
    setInput("");
    setEmptyResult(false);
    inputRef.current?.focus();
  }

  function handleExampleClick(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-dvh flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="animate-fade-up border-b border-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <rect x="1"  y="11" width="4" height="8" fill="var(--color-accent)" />
            <rect x="8"  y="6"  width="4" height="13" fill="var(--color-accent)" opacity="0.75" />
            <rect x="15" y="2"  width="4" height="17" fill="var(--color-accent)" opacity="0.5" />
          </svg>
          <span className="font-serif italic text-ink text-base tracking-tight select-none">
            Charts by Prompt
          </span>
        </div>

        {(hasContent || displayError) && (
          <div className="flex items-center gap-2">
            {hasContent && !isStreaming && (
              <button
                onClick={() => resetLayoutRef.current?.()}
                className="text-xs text-ink-muted hover:text-ink px-3 py-1.5 border border-border hover:border-border-hi transition-colors duration-150"
              >
                Reset layout
              </button>
            )}
            <button
              onClick={handleClear}
              className="text-xs text-ink-muted hover:text-ink px-3 py-1.5 border border-border hover:border-border-hi transition-colors duration-150"
            >
              ← New dashboard
            </button>
          </div>
        )}
      </header>

      {/* ── Prompt bar ─────────────────────────────────────── */}
      <div className="animate-fade-up delay-50 border-b border-border/60 px-6 py-5">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitPrompt();
                }
              }}
              placeholder="Describe the dashboard you want to see…"
              rows={2}
              className="
                w-full resize-none
                bg-surface border border-border
                focus:border-accent focus:outline-none
                px-4 py-3 text-sm text-ink placeholder-ink-dim
                transition-colors duration-150
              "
              disabled={isStreaming}
            />
            <div className="
              absolute inset-0 pointer-events-none
              opacity-0 group-focus-within:opacity-100
              transition-opacity duration-200
              shadow-[0_0_0_1px_var(--color-accent),0_0_20px_-4px_var(--color-accent-dim)]
            " />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="
              px-6 py-3 shrink-0
              bg-accent text-bg font-medium text-sm
              hover:bg-[#f8b060] active:translate-y-px
              disabled:bg-surface disabled:text-ink-dim disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {isStreaming ? (
              <span className="flex items-center gap-2.5">
                <ThinkingDots />
                Generating
              </span>
            ) : (
              "Generate →"
            )}
          </button>
        </form>
      </div>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-8 animate-fade-up delay-100">
        <div className="max-w-7xl mx-auto">
          {displayError && (
            <div className="mb-6 px-4 py-3 text-sm text-danger border border-danger/30 bg-danger/5 animate-fade-in">
              {displayError}
            </div>
          )}

          {hasContent ? (
            <div className="animate-fade-in">
              <DashboardRenderer
                spec={spec}
                loading={isStreaming}
                onResetLayout={(reset) => { resetLayoutRef.current = reset; }}
              />
            </div>
          ) : (
            <EmptyState isStreaming={isStreaming} onExampleClick={handleExampleClick} />
          )}
        </div>
      </main>

    </div>
  );
}

function EmptyState({
  isStreaming,
  onExampleClick,
}: {
  isStreaming: boolean;
  onExampleClick: (prompt: string) => void;
}) {
  if (isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-5 animate-fade-in">
        <div className="flex items-end gap-1.5 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-accent rounded-sm"
              style={{
                height: `${12 + Math.sin(i * 1.2) * 10}px`,
                animation: `pulse-dot 1.2s ease-in-out ${i * 120}ms infinite`,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-ink-muted tracking-wide">Building your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-16 pb-20 gap-14">
      <div className="text-center animate-fade-up delay-100">
        <h1 className="font-serif italic text-ink leading-[1.15] text-balance mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
          What would you<br />like to see?
        </h1>
        <p className="text-sm text-ink-muted text-pretty max-w-xs leading-relaxed">
          Describe a dashboard in plain English and Claude will build it from your data — live.
        </p>
      </div>

      <div className="w-full max-w-xl animate-fade-up delay-200">
        <p className="text-[10px] text-ink-dim uppercase tracking-[0.18em] mb-4">Examples</p>
        <div className="flex flex-col">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={prompt}
              onClick={() => onExampleClick(prompt)}
              className="
                group flex items-start gap-4
                border-t border-border first:border-t-0
                py-4 text-left
                hover:text-ink transition-colors duration-100
                animate-fade-up
              "
              style={{ animationDelay: `${250 + i * 60}ms` }}
            >
              <span className="text-accent font-mono text-xs tabular-nums mt-0.5 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-ink-muted group-hover:text-ink transition-colors leading-relaxed">
                {prompt}
              </span>
              <span className="ml-auto text-ink-dim group-hover:text-accent transition-colors text-xs shrink-0 mt-0.5 pl-4">→</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-ink-dim animate-fade-up delay-300 tracking-wide">
        Ctrl+scroll to zoom charts &nbsp;·&nbsp; Drag to pan
      </p>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-1 rounded-full bg-current"
          style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 180}ms infinite` }}
        />
      ))}
    </span>
  );
}
