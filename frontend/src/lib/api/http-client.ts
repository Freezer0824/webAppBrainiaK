import { env } from "@/lib/config/env";

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number | null;
  payload: unknown;

  constructor(
    message: string,
    status: number | null = null,
    payload: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getReadableError(payload: unknown, fallback: string) {
  if (!payload) return fallback;

  if (typeof payload === "string") return payload;

  if (typeof payload !== "object") return fallback;

  const data = payload as Record<string, unknown>;

  const candidates = [
    data.detail,
    data.message,
    data.error,
    data.reason,
    data.description,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return fallback;
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${env.apiBaseUrl}${path}`;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers, timeoutMs = 20_000 } = options;

  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        ...(body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await parseResponse(response).catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        getReadableError(payload, `HTTP ${response.status}`),
        response.status,
        payload,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(`Timeout après ${timeoutMs} ms`, null, null);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Erreur réseau inconnue",
      null,
      null,
    );
  } finally {
    window.clearTimeout(timeout);
  }
}