function required(name: string, fallback?: string): string {
  const value = import.meta.env[name];

  if (value && String(value).trim()) {
    return String(value);
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing environment variable: ${name}`);
}

export const env = {
  appName: required("VITE_APP_NAME", "Brainiak"),
  apiBaseUrl: required("VITE_API_BASE_URL", "http://192.168.1.213:8080"),
  tenantId: required(
    "VITE_DEFAULT_TENANT_ID",
    "00000000-0000-0000-0000-000000000001",
  ),
  useMockBusinessData: import.meta.env.VITE_USE_MOCK_BUSINESS_DATA !== "false",
  defaultRole: required("VITE_DEFAULT_ROLE", "dev"),
};