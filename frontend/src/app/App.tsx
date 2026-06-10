import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { AuthScreen } from "@/components/shared/auth-screen";
import type { AppView } from "@/features/infini/infini-types";
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
  const [activeView, setActiveView] = useState<AppView>("home");

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
      setActiveView("home");
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
        title: "Nouvelle conversation",
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
            name: "BrainiaK",
            status: core.status === "ok" ? "done" : "idle",
            detail:
              core.status === "ok"
                ? "Service principal disponible"
                : "Service principal indisponible",
            category: "tool",
          },
          {
            id: "toolhub-health",
            name: "Connecteurs",
            status:
              (toolhub.status as string | undefined) === "ok" ? "done" : "idle",
            detail:
              (toolhub.status as string | undefined) === "ok"
                ? "Connecteurs prêts"
                : "Connecteurs indisponibles",
            category: "tool",
          },
          {
            id: "tools-list",
            name: "Services disponibles",
            status: "done",
            detail: `${tools.count} connecteurs disponibles`,
            category: "tool",
          },
        ]);

        runtimeBootstrapDone.current = true;
      } catch (error) {
        console.error("Initialisation BrainiaK échouée :", error);
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