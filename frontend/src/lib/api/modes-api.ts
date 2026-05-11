import { apiRequest } from "./http-client";

export function getModes() {
  return apiRequest("/v1/modes");
}

export function setModes(payload: unknown) {
  return apiRequest("/v1/modes", {
    method: "POST",
    body: payload,
  });
}

export function activateMode(modeName: string) {
  return apiRequest(`/v1/modes/${encodeURIComponent(modeName)}`, {
    method: "POST",
  });
}

export function deactivateMode(modeName: string) {
  return apiRequest(`/v1/modes/${encodeURIComponent(modeName)}`, {
    method: "DELETE",
  });
}

export function resetModes() {
  return apiRequest("/v1/modes", {
    method: "DELETE",
  });
}