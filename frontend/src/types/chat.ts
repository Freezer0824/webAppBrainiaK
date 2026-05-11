export type ChatRole = "user" | "assistant" | "system";

export type ChatAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedId?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  attachments?: ChatAttachment[];
};

export type ConversationItem = {
  id: string;
  title: string;
  updatedAt: string;
  sessionId?: string;
  preview?: string;
  archivedAt?: string | null;
  pinned?: boolean;
};

export type ToolEvent = {
  id: string;
  name: string;
  status: "idle" | "running" | "done" | "error";
  detail?: string;
  turn?: number;
  latencyMs?: number;
  timestamp?: string;
  category?: "phase" | "tool" | "answer";
};

export type StoredConversation = {
  id: string;
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  archivedAt?: string | null;
  pinned?: boolean;
};