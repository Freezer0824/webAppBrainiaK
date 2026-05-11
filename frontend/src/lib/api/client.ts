import { env } from "@/lib/config/env";

export async function apiGet(path: string) {
  const res = await fetch(`${env.apiBaseUrl}${path}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}