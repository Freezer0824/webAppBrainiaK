// src/services/api-client.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  timeoutMs?: number;
  headers?: HeadersInit;
};

const DEFAULT_TIMEOUT_MS = 15_000;

function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "";
}

async function request<TResponse, TPayload = unknown>(
  method: HttpMethod,
  path: string,
  payload?: TPayload,
  options: RequestOptions = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        `Erreur API ${response.status}`,
        response.status,
        data,
      );
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La requête API a expiré", 408);
    }

    throw new ApiError("Impossible de contacter le backend BrainiaK", 0, error);
  } finally {
    window.clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <TResponse>(path: string, options?: RequestOptions) =>
    request<TResponse>("GET", path, undefined, options),

  post: <TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    options?: RequestOptions,
  ) => request<TResponse, TPayload>("POST", path, payload, options),

  put: <TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    options?: RequestOptions,
  ) => request<TResponse, TPayload>("PUT", path, payload, options),

  patch: <TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    options?: RequestOptions,
  ) => request<TResponse, TPayload>("PATCH", path, payload, options),

  delete: <TResponse>(path: string, options?: RequestOptions) =>
    request<TResponse>("DELETE", path, undefined, options),
};