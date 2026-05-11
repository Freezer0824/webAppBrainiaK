import { apiRequest } from "./http-client";

export function runSystemCheckup(scale = "standard", category?: string) {
  const params = new URLSearchParams();

  params.set("scale", scale);

  if (category?.trim()) {
    params.set("category", category.trim());
  }

  return apiRequest(`/v1/system/checkup?${params.toString()}`, {
    timeoutMs: 60_000,
  });
}