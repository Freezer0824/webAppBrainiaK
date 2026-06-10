import { env } from "@/lib/config/env";
import type { ChatRole } from "@/types/chat";

export type DevChatMessage = {
  role: ChatRole;
  content: string;
};

export type DevChatRequest = {
  messages: DevChatMessage[];
  enable_thinking?: boolean;
  max_tokens?: number;
  max_turns?: number;
  mode?: string;
};

export type DevChatResponse = {
  response?: string;
  final_answer?: string;
  answer?: string;
  content?: string;
  message?: string;
  error?: string;
  detail?: string;
  tools_used?: number;
};

export type DevChatAsyncResponse = {
  job_id?: string;
  id?: string;
};

export type DevChatJobStatus = {
  status?: string;
  job_id?: string;
  id?: string;
  result?: unknown;
};

const DEFAULT_DEV_CHAT_PAYLOAD = {
  enable_thinking: false,
  max_tokens: 16000,
  max_turns: 12,
  mode: "normal",
};

function extractDevChatText(payload: DevChatResponse): string {
  return (
    payload.final_answer ??
    payload.response ??
    payload.answer ??
    payload.content ??
    payload.message ??
    ""
  ).trim();
}

function normalizeDevChatRequest(payload: unknown): DevChatRequest {
  if (
    payload &&
    typeof payload === "object" &&
    "messages" in payload &&
    Array.isArray((payload as DevChatRequest).messages)
  ) {
    const request = payload as DevChatRequest;

    return {
      ...DEFAULT_DEV_CHAT_PAYLOAD,
      ...request,
      messages: request.messages,
    };
  }

  return {
    ...DEFAULT_DEV_CHAT_PAYLOAD,
    messages: [
      {
        role: "user",
        content: String(payload ?? ""),
      },
    ],
  };
}

async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 180_000,
): Promise<T> {
  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const url = `${env.apiBaseUrl}${path}`;

  try {
    console.log("BrainiaK fetch:", url);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      throw new Error(
        `BrainiaK request failed (${response.status})${
          text ? `: ${text}` : ""
        }`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");

      throw new Error(
        `Réponse BrainiaK non JSON${text ? `: ${text.slice(0, 300)}` : ""}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timeout après ${timeoutMs} ms`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function sendDevChatMessage(
  body: DevChatRequest,
  timeoutMs = 180_000,
): Promise<string> {
  const requestBody = normalizeDevChatRequest(body);

  console.log("DevChat body:", requestBody);

  const payload = await fetchJson<DevChatResponse>(
    "/v0/dev/chat",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
    timeoutMs,
  );

  console.log("DevChat payload:", payload);

  const text = extractDevChatText(payload);

  if (!text) {
    throw new Error(
      payload.error ??
        payload.detail ??
        "BrainiaK a répondu sans contenu exploitable.",
    );
  }

  return text;
}

export async function sendDevChat(body: unknown) {
  return fetchJson<DevChatResponse>("/v0/dev/chat", {
    method: "POST",
    body: JSON.stringify(normalizeDevChatRequest(body)),
  });
}

export async function sendDevChatAsync(body: unknown) {
  return fetchJson<DevChatAsyncResponse>("/v0/dev/chat/async", {
    method: "POST",
    body: JSON.stringify(normalizeDevChatRequest(body)),
  });
}

export async function getDevChatJobStatus(jobId: string) {
  return fetchJson<DevChatJobStatus>(
    `/v0/dev/chat/${encodeURIComponent(jobId)}/status`,
  );
}

export async function getDevChatJobResult(jobId: string) {
  return fetchJson<unknown>(
    `/v0/dev/chat/${encodeURIComponent(jobId)}/result`,
  );
}

export async function getDevSession(sessionId?: string) {
  const suffix = sessionId ? `/${encodeURIComponent(sessionId)}` : "";

  return fetchJson<unknown>(`/v0/dev/session${suffix}`);
}

export async function appendDevSessionMessages(
  sessionIdOrMessages: string | DevChatMessage[] | unknown,
  maybeMessages?: DevChatMessage[] | unknown,
) {
  const hasSessionId = typeof sessionIdOrMessages === "string";
  const sessionId = hasSessionId ? sessionIdOrMessages : undefined;
  const messages = hasSessionId ? maybeMessages : sessionIdOrMessages;

  const suffix = sessionId
    ? `/${encodeURIComponent(sessionId)}/messages`
    : "/messages";

  return fetchJson<unknown>(`/v0/dev/session${suffix}`, {
    method: "POST",
    body: JSON.stringify(
      normalizeDevChatRequest({
        messages,
      }),
    ),
  });
}

export async function clearDevSession(sessionId?: string) {
  const suffix = sessionId ? `/${encodeURIComponent(sessionId)}` : "";

  return fetchJson<unknown>(`/v0/dev/session${suffix}`, {
    method: "DELETE",
  });
}