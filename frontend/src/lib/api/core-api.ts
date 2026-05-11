import { apiRequest } from "./http-client";

export type CoreHealthDto = {
  status?: string;
  [key: string]: unknown;
};

export type ToolhubHealthDto = {
  status?: string;
  mode?: string;
  [key: string]: unknown;
};

export function getCoreHealth() {
  return apiRequest<CoreHealthDto>("/health");
}

export function getToolhubHealth() {
  return apiRequest<ToolhubHealthDto>("/toolhub/health");
}