import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { AuthScreen } from "@/components/shared/auth-screen";
import type { AppView } from "@/components/shared/sidebar";
import {
  getCoreHealth,
  getToolhubHealth,
  listTools,
} from "@/lib/api/brainiak-api";
import { getOrCreateSessionId } from "@/lib/session/session";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { useConversationStore } from "@/store/conversation-store";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("assistant");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    sessionId,
    setSessionId,
    messages,
    setMessages,
    toolEvents,
    setToolEvents,
  } = useChatStore();

  const {
    hydrated,
    activeConversationId,
    conversations: storedConversations,
    createConversation,
    setActiveConversation,
    updateConversationMessages,
  } = useConversationStore();

  const initialConversationLoadDone = useRef(false);
  const runtimeBootstrapDone = useRef(false);

  const conversationItems = useMemo(
    () =>
      storedConversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        updatedAt: new Date(conversation.updatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sessionId: conversation.sessionId,
        preview:
          conversation.messages[conversation.messages.length - 1]?.content ?? "",
        archivedAt: conversation.archivedAt ?? null,
        pinned: conversation.pinned ?? false,
      })),
    [storedConversations],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      initialConversationLoadDone.current = false;
      runtimeBootstrapDone.current = false;
      setActiveView("assistant");
      return;
    }

    if (!sessionId) {
      setSessionId(getOrCreateSessionId());
    }
  }, [isAuthenticated, sessionId, setSessionId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hydrated) return;
    if (initialConversationLoadDone.current) return;

    const activeConversations = storedConversations.filter(
      (conversation) => !conversation.archivedAt,
    );

    const fallbackConversation =
      activeConversations[0] ?? storedConversations[0] ?? null;

    if (fallbackConversation) {
      const resolvedActiveId = activeConversationId ?? fallbackConversation.id;

      const activeConversation =
        storedConversations.find(
          (conversation) => conversation.id === resolvedActiveId,
        ) ?? fallbackConversation;

      if (!activeConversationId) {
        setActiveConversation(activeConversation.id);
      }

      setSessionId(activeConversation.sessionId);
      setMessages(activeConversation.messages);
    } else {
      const nextSessionId = sessionId || getOrCreateSessionId();

      if (!sessionId) {
        setSessionId(nextSessionId);
      }

      createConversation({
        sessionId: nextSessionId,
        title: "Nouvelle session",
      });

      setMessages([]);
    }

    initialConversationLoadDone.current = true;
  }, [
    activeConversationId,
    createConversation,
    hydrated,
    isAuthenticated,
    sessionId,
    setActiveConversation,
    setMessages,
    setSessionId,
    storedConversations,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hydrated) return;
    if (!activeConversationId) return;
    if (!initialConversationLoadDone.current) return;

    updateConversationMessages(activeConversationId, messages);
  }, [
    activeConversationId,
    hydrated,
    isAuthenticated,
    messages,
    updateConversationMessages,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (runtimeBootstrapDone.current) return;

    async function bootstrapRuntime() {
      try {
        const [core, toolhub, tools] = await Promise.all([
          getCoreHealth(),
          getToolhubHealth(),
          listTools("dev"),
        ]);

        setToolEvents([
          {
            id: "core-health",
            name: "Core API",
            status: core.status === "ok" ? "done" : "idle",
            detail: core.status,
            category: "tool",
          },
          {
            id: "toolhub-health",
            name: "Tool Hub",
            status:
              (toolhub.status as string | undefined) === "ok" ? "done" : "idle",
            detail: String(toolhub.mode ?? "unknown"),
            category: "tool",
          },
          {
            id: "tools-list",
            name: "Registry",
            status: "done",
            detail: `${tools.count} tools available`,
            category: "tool",
          },
        ]);

        runtimeBootstrapDone.current = true;
      } catch (error) {
        console.error("Runtime bootstrap failed:", error);
      }
    }

    void bootstrapRuntime();
  }, [isAuthenticated, setToolEvents]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <AppShell
      conversations={conversationItems}
      messages={messages}
      toolEvents={toolEvents}
      activeView={activeView}
      onViewChange={setActiveView}
    />
  );
}