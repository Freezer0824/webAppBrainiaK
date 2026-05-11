import { env } from "@/lib/config/env";

function buildUrl(path: string): string {
  return `${env.apiBaseUrl}${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path));
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `POST ${path} failed (${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail ?? err.error ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return (await res.json()) as TResponse;
}