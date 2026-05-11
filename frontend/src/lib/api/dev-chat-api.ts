import { apiRequest } from "./http-client";

export function sendDevChat(payload: unknown) {
  return apiRequest("/v0/dev/chat", {
    method: "POST",
    body: payload,
    timeoutMs: 60_000,
  });
}

export function sendDevChatAsync(payload: unknown) {
  return apiRequest("/v0/dev/chat/async", {
    method: "POST",
    body: payload,
    timeoutMs: 60_000,
  });
}

export function getDevChatJobStatus(jobId: string) {
  return apiRequest(
    `/v0/dev/chat/${encodeURIComponent(jobId)}/status`,
  );
}

export function getDevChatJobResult(jobId: string) {
  return apiRequest(
    `/v0/dev/chat/${encodeURIComponent(jobId)}/result`,
    {
      timeoutMs: 60_000,
    },
  );
}

export function getDevSession(sessionId: string) {
  const params = new URLSearchParams();
  params.set("session_id", sessionId);

  return apiRequest(`/v0/dev/session?${params.toString()}`);
}

export function appendDevSessionMessages(sessionId: string, payload: unknown) {
  const params = new URLSearchParams();
  params.set("session_id", sessionId);

  return apiRequest(`/v0/dev/session/messages?${params.toString()}`, {
    method: "POST",
    body: payload,
  });
}

export function clearDevSession(sessionId: string) {
  const params = new URLSearchParams();
  params.set("session_id", sessionId);

  return apiRequest(`/v0/dev/session?${params.toString()}`, {
    method: "DELETE",
  });
}