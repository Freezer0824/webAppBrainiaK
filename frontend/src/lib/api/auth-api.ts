import { env } from "@/lib/config/env";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthUserDto = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUserDto;
};

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${env.apiBaseUrl}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Connexion impossible");
  }

  return response.json();
}

export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  const response = await fetch(`${env.apiBaseUrl}/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Création du compte impossible");
  }

  return response.json();
}

export async function getMe(token: string): Promise<AuthUserDto> {
  const response = await fetch(`${env.apiBaseUrl}/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session invalide");
  }

  return response.json();
}