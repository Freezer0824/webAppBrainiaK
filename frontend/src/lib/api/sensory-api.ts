import { env } from "@/lib/config/env";
import { apiRequest } from "./http-client";

export function getSensoryState() {
  return apiRequest("/v1/sensory/state");
}

export function getSensoryConfig() {
  return apiRequest("/v1/sensory/config");
}

export function patchSensoryConfig(payload: unknown) {
  return apiRequest("/v1/sensory/config", {
    method: "PATCH",
    body: payload,
  });
}

export function getSensoryDevices() {
  return apiRequest("/v1/sensory/devices");
}

export function setSensoryDeviceRouting(payload: unknown) {
  return apiRequest("/v1/sensory/devices/routing", {
    method: "PUT",
    body: payload,
  });
}

export function getHeartbeatStatus() {
  return apiRequest("/v1/heartbeat/status");
}

export function getHeartbeatTensions() {
  return apiRequest("/v1/heartbeat/tensions");
}

export function heartbeatStart() {
  return apiRequest("/v1/heartbeat/start", { method: "POST" });
}

export function heartbeatStop() {
  return apiRequest("/v1/heartbeat/stop", { method: "POST" });
}

export function heartbeatPing() {
  return apiRequest("/v1/heartbeat/ping", { method: "POST" });
}

export function heartbeatSleep() {
  return apiRequest("/v1/heartbeat/sleep", { method: "POST" });
}

export function heartbeatWake() {
  return apiRequest("/v1/heartbeat/wake", { method: "POST" });
}

export function setHeartbeatInterval(payload: unknown) {
  return apiRequest("/v1/heartbeat/interval", {
    method: "POST",
    body: payload,
  });
}

export function injectAudio(payload: unknown) {
  return apiRequest("/v1/audio/inject", {
    method: "POST",
    body: payload,
  });
}

export function uploadAudio(file: File, source = "front") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);

  return apiRequest("/v1/audio/upload", {
    method: "POST",
    body: formData,
    timeoutMs: 60_000,
  });
}

export function sendVisionFrame(file: File, source = "front") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);

  return apiRequest("/v1/vision/frame", {
    method: "POST",
    body: formData,
    timeoutMs: 60_000,
  });
}

export function speakVoice(payload: unknown) {
  return apiRequest("/v1/voice/speak", {
    method: "POST",
    body: payload,
    timeoutMs: 60_000,
  });
}

export function getLastVoiceWavUrl() {
  return `${env.apiBaseUrl}/v1/voice/last.wav`;
}

export function setTokenlessMode(payload: unknown) {
  return apiRequest("/v1/tokenless_mode", {
    method: "POST",
    body: payload,
  });
}

export function getProactiveEvents() {
  return apiRequest("/v1/events", {
    timeoutMs: 10_000,
  });
}