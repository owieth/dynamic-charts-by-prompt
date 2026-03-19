'use client';

import type { ChatMessage } from '@/lib/use-dashboards';
import { cn } from '@/lib/utils';
import type { Spec } from '@json-render/core';
import { useEffect, useRef, useState } from 'react';

const EXAMPLE_PROMPTS = [
  'Portfolio overview: total capacity, CapEx, project count, and avg Frigg score as metrics with technology breakdown charts',
  'Show projects by country as a bar chart and by status as a doughnut chart side by side',
  'Renewable energy pipeline: projects by commissioning year, capacity by country, and Frigg score distribution',
];

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: Error | null;
  onSend: (text: string) => void;
  onStop: () => void;
  showExamples: boolean;
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  onSend,
  onStop,
  showExamples,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
  }

  function handleExampleClick(prompt: string) {
    onSend(prompt);
  }

  const hasMessages = messages.length > 0;

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-bg flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border/60">
        <span className="text-xs text-ink-muted uppercase tracking-[0.15em] font-medium">
          Chat
        </span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {showExamples && !hasMessages && !isStreaming ? (
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-sm text-ink-muted text-pretty leading-relaxed">
              Describe a dashboard in plain English and Claude will build it
              from your data.
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-ink-dim uppercase tracking-[0.15em] mb-2">
                Examples
              </p>
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={prompt}
                  onClick={() => handleExampleClick(prompt)}
                  className="group flex items-start gap-3 py-2.5 text-left border-t border-border/60 first:border-t-0 hover:cursor-pointer hover:text-accent transition-colors duration-200 ease-out"
                >
                  <span className="text-accent font-mono text-[10px] tabular-nums mt-0.5 w-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ease-out">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-ink-muted group-hover:text-accent transition-colors duration-200 ease-out leading-relaxed">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const isAssistantStreaming =
                msg.role === 'assistant' && isStreaming && isLast;
              const showBubble = msg.role === 'user' || !!msg.text;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1 max-w-[90%]',
                    msg.role === 'user'
                      ? 'ml-auto items-end'
                      : 'mr-auto items-start'
                  )}
                >
                  {showBubble && (
                    <div
                      className={cn(
                        'px-3 py-2 text-xs leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-surface-hi text-ink rounded-sm'
                          : 'text-ink-muted'
                      )}
                    >
                      {msg.text}
                    </div>
                  )}
                  {isAssistantStreaming && !msg.text && (
                    <div className="flex items-center gap-2 text-xs text-ink-muted py-1">
                      <ThinkingDots />
                      <span>Generating…</span>
                    </div>
                  )}
                  {msg.role === 'assistant' &&
                    msg.spec &&
                    !isAssistantStreaming && (
                      <span className="text-[10px] text-accent/70 px-1">
                        {specSummary(msg.spec)}
                      </span>
                    )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 text-xs text-danger border border-danger/30 bg-danger/5">
          {error.message}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border/60 p-3 flex gap-2"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Describe changes…"
          rows={2}
          className="flex-1 resize-none bg-surface border border-border focus:border-accent focus:outline-none px-3 py-2 text-xs text-ink placeholder-ink-dim transition-colors duration-150 ease-out"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="h-full px-3 py-2 shrink-0 self-end bg-danger/10 text-danger border border-danger/30 font-medium text-xs hover:bg-danger/20 active:translate-y-px transition-all duration-150 ease-out"
            aria-label="Stop generation"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-full px-3 py-2 shrink-0 self-end bg-accent text-bg font-medium text-xs hover:bg-[#f8b060] active:translate-y-px disabled:bg-surface disabled:text-ink-dim disabled:cursor-not-allowed transition-all duration-150 ease-out"
          >
            →
          </button>
        )}
      </form>
    </aside>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  chart: 'chart',
  metric: 'metric',
  layout: 'layout element',
};

function categorize(type: string): string {
  if (type.endsWith('Chart')) return 'chart';
  if (type === 'MetricCard') return 'metric';
  return 'layout';
}

function specSummary(spec: Spec): string {
  const elements = Object.values(spec.elements);
  if (elements.length === 0) return 'Dashboard updated';

  const counts: Record<string, number> = {};
  for (const el of elements) {
    const cat = categorize(el.type);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }

  const parts = Object.entries(counts).map(([cat, n]) => {
    const label = CATEGORY_LABELS[cat] ?? cat;
    return `${n} ${label}${n > 1 ? 's' : ''}`;
  });

  return `Updated ${parts.join(', ')}`;
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block size-1 rounded-full bg-current"
          style={{
            animation: `pulse-dot 1.2s ease-in-out ${i * 180}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}
