import { useAuthStore } from "@/store/auth-store";

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}