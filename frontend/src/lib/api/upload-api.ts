import { apiRequest } from "./http-client";
import type { UploadResponseDto } from "@/types/api";

export function uploadFiles(files: File[]): Promise<UploadResponseDto> {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  return apiRequest<UploadResponseDto>("/v1/uploads", {
    method: "POST",
    body: formData,
    timeoutMs: 60_000,
  });
}