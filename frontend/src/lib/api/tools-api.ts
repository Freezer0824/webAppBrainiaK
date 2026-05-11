import { apiRequest } from "./http-client";

export type ToolsListDto = {
  tools?: unknown[];
  count?: number;
  [key: string]: unknown;
};

export function listTools(role = "dev") {
  return apiRequest<ToolsListDto>(
    `/v1/tools/list?role=${encodeURIComponent(role)}`,
  );
}

export function callTool(payload: unknown) {
  return apiRequest("/v1/tools/call", {
    method: "POST",
    body: payload,
    timeoutMs: 60_000,
  });
}