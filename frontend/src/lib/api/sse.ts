import { env } from "@/lib/config/env";
import type { PromptRequest, StreamEvent } from "@/types/api";

type StreamHandlers = {
  onEvent?: (event: StreamEvent) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
};

export async function streamPrompt(
  body: PromptRequest,
  handlers: StreamHandlers = {},
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}/v1/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        ...body,
        stream: true,
      }),
    });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Network error while streaming");
    handlers.onError?.(err);
    throw err;
  }

  if (!response.ok || !response.body) {
    let detail = `Streaming request failed (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail ?? err.error ?? detail;
    } catch {
      // ignore
    }
    const error = new Error(detail);
    handlers.onError?.(error);
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const lines = chunk
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const raw = line.slice(5).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw) as StreamEvent;
            handlers.onEvent?.(event);
          } catch (error) {
            console.warn("Failed to parse SSE event:", raw, error);
          }
        }
      }
    }

    handlers.onDone?.();
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Unknown streaming error");
    handlers.onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }
}