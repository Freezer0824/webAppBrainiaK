import { apiRequest } from "./http-client";

export function sendFeedback(payload: unknown) {
  return apiRequest("/v1/feedback", {
    method: "POST",
    body: payload,
  });
}

export function sendFeedbackSense(payload: unknown) {
  return apiRequest("/v1/feedback-sense", {
    method: "POST",
    body: payload,
  });
}

export function sendSkinnerFeedback(payload: unknown) {
  return apiRequest("/v1/skinner", {
    method: "POST",
    body: payload,
  });
}

export function teachWord(payload: unknown) {
  return apiRequest("/v1/teach", {
    method: "POST",
    body: payload,
  });
}

export function teachContrastive(payload: unknown) {
  return apiRequest("/v1/teach-contrastive", {
    method: "POST",
    body: payload,
  });
}

export function getTokenlessStatus() {
  return apiRequest("/v1/tokenless");
}

export function toggleTokenless(enabled: boolean) {
  return apiRequest("/v1/tokenless", {
    method: "POST",
    body: { enabled },
  });
}