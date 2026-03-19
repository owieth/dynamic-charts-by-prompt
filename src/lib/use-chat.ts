'use client';

import type { Spec } from '@json-render/core';
import { applySpecPatch, createMixedStreamParser } from '@json-render/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from './use-dashboards';

function condensedSpec(spec: Spec): string {
  const entries = Object.entries(spec.elements)
    .map(([, el]) => {
      const props = el.props as Record<string, unknown> | undefined;
      const title = props?.title as string | undefined;
      return title ? `${el.type}("${title}")` : el.type;
    })
    .filter(Boolean);
  return `[Spec: ${entries.join(', ')}]`;
}

function buildApiMessages(
  messages: ChatMessage[],
  newUserText: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history = messages.map(m => ({
    role: m.role,
    content:
      m.role === 'assistant' && m.spec
        ? (m.text ? m.text + '\n\n' : '') + condensedSpec(m.spec)
        : m.text,
  }));
  return [...history, { role: 'user' as const, content: newUserText }];
}

interface UseChatOptions {
  api: string;
  initialMessages?: ChatMessage[];
  onUpdate?: (messages: ChatMessage[], spec: Spec | null) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  spec: Spec | null;
  isStreaming: boolean;
  error: Error | null;
  send: (text: string) => Promise<void>;
  clear: () => void;
  setMessages: (msgs: ChatMessage[]) => void;
}

export function useChat({
  api,
  initialMessages,
  onUpdate,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Derive spec from last assistant message that has one
  const spec =
    [...messages].reverse().find(m => m.role === 'assistant' && m.spec)?.spec ??
    null;

  // Sync initialMessages when dashboard switches
  const initRef = useRef(initialMessages);
  useEffect(() => {
    if (initialMessages !== initRef.current) {
      initRef.current = initialMessages;
      setMessages(initialMessages ?? []);
      setError(null);
    }
  }, [initialMessages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: trimmed,
        spec: null,
      };
      const assistantId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        text: '',
        spec: null,
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      const apiMessages = buildApiMessages(messagesRef.current, trimmed);
      let accumulatedText = '';
      const currentSpec: Spec = { root: '', elements: {} };
      let hasSpec = false;

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, spec }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          let errorMessage = `HTTP error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message ?? errorData.error ?? errorMessage;
          } catch {
            // ignore parse errors
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        const parser = createMixedStreamParser({
          onPatch(patch) {
            hasSpec = true;
            applySpecPatch(currentSpec, patch);
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      spec: {
                        root: currentSpec.root,
                        elements: { ...currentSpec.elements },
                        ...(currentSpec.state
                          ? { state: { ...currentSpec.state } }
                          : {}),
                      },
                    }
                  : m
              )
            );
          },
          onText(line) {
            accumulatedText += (accumulatedText ? '\n' : '') + line;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, text: accumulatedText } : m
              )
            );
          },
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.push(decoder.decode(value, { stream: true }));
        }
        parser.flush();

        const finalSpec = hasSpec
          ? {
              root: currentSpec.root,
              elements: { ...currentSpec.elements },
              ...(currentSpec.state ? { state: { ...currentSpec.state } } : {}),
            }
          : null;

        const finalMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: accumulatedText,
          spec: finalSpec,
        };

        // Update messages with final state
        setMessages(prev => {
          const updated = prev.map(m =>
            m.id === assistantId ? finalMessage : m
          );
          // Notify for persistence
          onUpdateRef.current?.(updated, finalSpec ?? spec);
          return updated;
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const resolved = err instanceof Error ? err : new Error(String(err));
        setError(resolved);
        setMessages(prev =>
          prev.filter(m => m.id !== assistantId || m.text.length > 0)
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [api, spec]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    spec,
    isStreaming,
    error,
    send,
    clear,
    setMessages,
  };
}
