import { apiRequest } from "./http-client";

export function getCrystalsInfo() {
  return apiRequest("/v1/crystals/info");
}

export function lookupCrystal(word: string, includeS5 = false) {
  const params = new URLSearchParams();
  params.set("word", word);
  params.set("include_s5", String(includeS5));

  return apiRequest(`/v1/crystals/lookup?${params.toString()}`);
}

export function lookupCrystalsBatch(payload: unknown) {
  return apiRequest("/v1/crystals/lookup_batch", {
    method: "POST",
    body: payload,
  });
}

export function encodeCrystals(text: string, includeS5 = false) {
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("include_s5", String(includeS5));

  return apiRequest(`/v1/crystals/encode?${params.toString()}`);
}

export function nearestCrystals(payload: unknown) {
  return apiRequest("/v1/crystals/nearest", {
    method: "POST",
    body: payload,
  });
}