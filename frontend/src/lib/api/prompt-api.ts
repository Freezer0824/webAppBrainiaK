import { env } from "@/lib/config/env";
import type { PromptRequest, StreamEvent } from "@/types/api";

type StreamHandlers = {
  onEvent?: (event: StreamEvent) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
};

function parseSseChunk(chunk: string, handlers: StreamHandlers) {
  const lines = chunk
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let eventName: string | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  const raw = dataLines.join("\n").trim();

  if (!raw || raw === "[DONE]") {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const event =
      eventName && !("event" in parsed)
        ? ({
            ...parsed,
            event: eventName,
          } as StreamEvent)
        : (parsed as StreamEvent);

    handlers.onEvent?.(event);
  } catch (error) {
    console.warn("Failed to parse SSE event:", raw, error);
  }
}

export async function streamPrompt(
  body: PromptRequest,
  handlers: StreamHandlers = {},
  timeoutMs = 120_000,
): Promise<void> {
  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const response = await fetch(`${env.apiBaseUrl}/v1/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
    signal: controller.signal,
  }).catch((error) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timeout après ${timeoutMs} ms`);
    }

    throw error;
  });

  try {
    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      const error = new Error(
        `Streaming request failed (${response.status})${text ? `: ${text}` : ""}`,
      );
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
          parseSseChunk(chunk, handlers);
        }
      }

      const remaining = buffer.trim();

      if (remaining) {
        parseSseChunk(remaining, handlers);
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
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function controlPrompt(requestId: string, payload: unknown) {
  const response = await fetch(
    `${env.apiBaseUrl}/v1/prompt/control/${encodeURIComponent(requestId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to control prompt (${response.status})${text ? `: ${text}` : ""}`,
    );
  }

  return response.json();
}