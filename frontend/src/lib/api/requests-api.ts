import { apiRequest } from "./http-client";

export function submitRequest(payload: unknown) {
  return apiRequest("/v0/request", {
    method: "POST",
    body: payload,
    timeoutMs: 60_000,
  });
}

export function getRequestStatus(requestId: string) {
  return apiRequest(
    `/v0/request/${encodeURIComponent(requestId)}/status`,
  );
}

export function getRequestResponse(requestId: string) {
  return apiRequest(
    `/v0/request/${encodeURIComponent(requestId)}/response`,
    {
      timeoutMs: 60_000,
    },
  );
}