const STORAGE_KEY = "brainiak.activeSessionId";

export function createSessionId(): string {
  return `session-${crypto.randomUUID()}`;
}

export function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const next = createSessionId();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function setSessionId(sessionId: string) {
  localStorage.setItem(STORAGE_KEY, sessionId);
}

export function clearSessionId() {
  localStorage.removeItem(STORAGE_KEY);
}