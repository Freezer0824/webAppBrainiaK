import { create } from "zustand";
import type { ChatMessage, ConversationItem, ToolEvent } from "@/types/chat";

type ChatState = {
  sessionId: string;
  conversations: ConversationItem[];
  messages: ChatMessage[];
  toolEvents: ToolEvent[];
  statusLabel: string | null;
  isStreaming: boolean;
  lastUserPrompt: string | null;
  currentRequestId: string | null;
  lastBackendError: string | null;

  setSessionId: (id: string) => void;
  setConversations: (items: ConversationItem[]) => void;
  setMessages: (items: ChatMessage[]) => void;
  pushMessage: (item: ChatMessage) => void;
  replaceStreamingMessage: (content: string) => void;
  finishStreamingMessage: (content: string) => void;
  clearMessages: () => void;

  setToolEvents: (items: ToolEvent[]) => void;
  upsertToolEvent: (item: ToolEvent) => void;

  setStatusLabel: (value: string | null) => void;
  setIsStreaming: (value: boolean) => void;
  setLastUserPrompt: (value: string | null) => void;
  setCurrentRequestId: (value: string | null) => void;
  setLastBackendError: (value: string | null) => void;
};

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: "",
  conversations: [],
  messages: [],
  toolEvents: [],
  statusLabel: null,
  isStreaming: false,
  lastUserPrompt: null,
  currentRequestId: null,
  lastBackendError: null,

  setSessionId: (sessionId) => set({ sessionId }),

  setConversations: (conversations) => set({ conversations }),

  setMessages: (messages) => set({ messages }),

  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  replaceStreamingMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const index = messages.findIndex((message) => message.isStreaming);

      if (index >= 0) {
        messages[index] = {
          ...messages[index],
          content,
        };
      } else {
        messages.push({
          id: `stream-${crypto.randomUUID()}`,
          role: "assistant",
          content,
          isStreaming: true,
          timestamp: nowLabel(),
        });
      }

      return { messages };
    }),

  finishStreamingMessage: (content) =>
    set((state) => {
      const hasStreaming = state.messages.some((message) => message.isStreaming);

      if (!hasStreaming) {
        return {
          messages: [
            ...state.messages,
            {
              id: `assistant-${crypto.randomUUID()}`,
              role: "assistant",
              content,
              isStreaming: false,
              timestamp: nowLabel(),
            },
          ],
        };
      }

      return {
        messages: state.messages.map((message) =>
          message.isStreaming
            ? {
                ...message,
                content,
                isStreaming: false,
              }
            : message,
        ),
      };
    }),

  clearMessages: () =>
    set({
      messages: [],
      lastBackendError: null,
      currentRequestId: null,
    }),

  setToolEvents: (toolEvents) => set({ toolEvents }),

  upsertToolEvent: (item) =>
    set((state) => {
      const index = state.toolEvents.findIndex((event) => event.id === item.id);

      if (index === -1) {
        return {
          toolEvents: [item, ...state.toolEvents],
        };
      }

      const next = [...state.toolEvents];
      next[index] = {
        ...next[index],
        ...item,
      };

      return { toolEvents: next };
    }),

  setStatusLabel: (statusLabel) => set({ statusLabel }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setLastUserPrompt: (lastUserPrompt) => set({ lastUserPrompt }),

  setCurrentRequestId: (currentRequestId) => set({ currentRequestId }),

  setLastBackendError: (lastBackendError) => set({ lastBackendError }),
}));