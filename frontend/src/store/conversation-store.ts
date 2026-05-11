import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  ConversationItem,
  StoredConversation,
} from "@/types/chat";

type ConversationState = {
  activeConversationId: string | null;
  conversations: StoredConversation[];
  hydrated: boolean;

  setHydrated: (value: boolean) => void;

  createConversation: (payload: {
    sessionId: string;
    title?: string;
  }) => string;

  setActiveConversation: (id: string | null) => void;

  updateConversationMessages: (
    conversationId: string,
    messages: ChatMessage[],
  ) => void;

  renameConversation: (conversationId: string, title: string) => void;
  archiveConversation: (conversationId: string) => void;
  restoreConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  duplicateConversation: (conversationId: string) => string | null;
  pinConversation: (conversationId: string) => void;
  unpinConversation: (conversationId: string) => void;
  clearConversationMessages: (conversationId: string) => void;

  getActiveConversation: () => StoredConversation | null;
  getConversationItems: () => ConversationItem[];
  searchConversationItems: (query: string) => ConversationItem[];
};

function nowIso() {
  return new Date().toISOString();
}

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return "Nouvelle session";
  }

  const title = firstUserMessage.content.trim();

  if (!title) {
    return "Nouvelle session";
  }

  return title.length > 48 ? `${title.slice(0, 48)}…` : title;
}

function normalizeTitle(title: string) {
  const normalized = title.trim();

  if (!normalized) {
    return "Nouvelle session";
  }

  return normalized.length > 80 ? `${normalized.slice(0, 80)}…` : normalized;
}

function sortConversations(conversations: StoredConversation[]) {
  return [...conversations].sort((a, b) => {
    const pinnedA = a.pinned ? 1 : 0;
    const pinnedB = b.pinned ? 1 : 0;

    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA;
    }

    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
}

function toConversationItem(conversation: StoredConversation): ConversationItem {
  return {
    id: conversation.id,
    title: conversation.title,
    updatedAt: formatUpdatedAt(conversation.updatedAt),
    sessionId: conversation.sessionId,
    preview:
      conversation.messages[conversation.messages.length - 1]?.content ?? "",
    archivedAt: conversation.archivedAt ?? null,
    pinned: conversation.pinned ?? false,
  };
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      activeConversationId: null,
      conversations: [],
      hydrated: false,

      setHydrated: (value) => {
        set({ hydrated: value });
      },

      createConversation: ({ sessionId, title }) => {
        const id = crypto.randomUUID();
        const createdAt = nowIso();

        const conversation: StoredConversation = {
          id,
          sessionId,
          title: normalizeTitle(title ?? "Nouvelle session"),
          createdAt,
          updatedAt: createdAt,
          messages: [],
          archivedAt: null,
          pinned: false,
        };

        set((state) => ({
          activeConversationId: id,
          conversations: sortConversations([
            conversation,
            ...state.conversations,
          ]),
        }));

        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      updateConversationMessages: (conversationId, messages) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    messages,
                    updatedAt: nowIso(),
                    title:
                      conversation.title === "Nouvelle session"
                        ? buildTitle(messages)
                        : conversation.title,
                  }
                : conversation,
            ),
          ),
        }));
      },

      renameConversation: (conversationId, title) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    title: normalizeTitle(title),
                    updatedAt: nowIso(),
                  }
                : conversation,
            ),
          ),
        }));
      },

      archiveConversation: (conversationId) => {
        set((state) => {
          const archivedAt = nowIso();

          const nextConversations = sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    archivedAt,
                    pinned: false,
                    updatedAt: archivedAt,
                  }
                : conversation,
            ),
          );

          const nextActiveConversationId =
            state.activeConversationId === conversationId
              ? nextConversations.find(
                  (conversation) => !conversation.archivedAt,
                )?.id ?? null
              : state.activeConversationId;

          return {
            conversations: nextConversations,
            activeConversationId: nextActiveConversationId,
          };
        });
      },

      restoreConversation: (conversationId) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    archivedAt: null,
                    updatedAt: nowIso(),
                  }
                : conversation,
            ),
          ),
        }));
      },

      deleteConversation: (conversationId) => {
        set((state) => {
          const nextConversations = state.conversations.filter(
            (conversation) => conversation.id !== conversationId,
          );

          const nextActiveConversationId =
            state.activeConversationId === conversationId
              ? nextConversations.find(
                  (conversation) => !conversation.archivedAt,
                )?.id ??
                nextConversations[0]?.id ??
                null
              : state.activeConversationId;

          return {
            conversations: sortConversations(nextConversations),
            activeConversationId: nextActiveConversationId,
          };
        });
      },

      duplicateConversation: (conversationId) => {
        const source = get().conversations.find(
          (conversation) => conversation.id === conversationId,
        );

        if (!source) {
          return null;
        }

        const id = crypto.randomUUID();
        const createdAt = nowIso();

        const duplicatedConversation: StoredConversation = {
          ...source,
          id,
          sessionId: crypto.randomUUID(),
          title: normalizeTitle(`${source.title} — copie`),
          createdAt,
          updatedAt: createdAt,
          archivedAt: null,
          pinned: false,
          messages: source.messages.map((message) => ({
            ...message,
            id: `${message.id}-copy-${crypto.randomUUID()}`,
          })),
        };

        set((state) => ({
          activeConversationId: id,
          conversations: sortConversations([
            duplicatedConversation,
            ...state.conversations,
          ]),
        }));

        return id;
      },

      pinConversation: (conversationId) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    pinned: true,
                    archivedAt: null,
                    updatedAt: nowIso(),
                  }
                : conversation,
            ),
          ),
        }));
      },

      unpinConversation: (conversationId) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    pinned: false,
                    updatedAt: nowIso(),
                  }
                : conversation,
            ),
          ),
        }));
      },

      clearConversationMessages: (conversationId) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    messages: [],
                    title: "Nouvelle session",
                    updatedAt: nowIso(),
                  }
                : conversation,
            ),
          ),
        }));
      },

      getActiveConversation: () => {
        const { activeConversationId, conversations } = get();

        return (
          conversations.find(
            (conversation) => conversation.id === activeConversationId,
          ) ?? null
        );
      },

      getConversationItems: () => {
        return sortConversations(get().conversations).map(toConversationItem);
      },

      searchConversationItems: (query) => {
        const normalized = query.trim().toLowerCase();
        const items = get().getConversationItems();

        if (!normalized) {
          return items;
        }

        return items.filter((item) => {
          const title = item.title.toLowerCase();
          const preview = (item.preview ?? "").toLowerCase();

          return title.includes(normalized) || preview.includes(normalized);
        });
      },
    }),
    {
      name: "brainiak-conversations",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as ConversationState;

        if (!state?.conversations) {
          return persistedState;
        }

        return {
          ...state,
          conversations: state.conversations.map((conversation) => ({
            ...conversation,
            archivedAt: conversation.archivedAt ?? null,
            pinned: conversation.pinned ?? false,
          })),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);