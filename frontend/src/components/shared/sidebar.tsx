import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import type { ConversationItem } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/store/conversation-store";
import { useChatStore } from "@/store/chat-store";
import { createSessionId } from "@/lib/session/session";
import { useRuntimeStore } from "@/store/runtime-store";
import { UserMenu } from "@/components/shared/user-menu";
import logoBrainiak from "@/assets/logo-brainiak.png";
import type { AppView } from "@/features/infini/infini-types";
import { infiniNavigationItems } from "@/features/infini/infini-navigation";
import { ConversationList } from "@/components/shared/conversation-list";

type SessionFilter = "active" | "archived";

type SidebarProps = {
  conversations: ConversationItem[];
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

function ConnectionStatusItem({
  label,
  status,
}: {
  label: string;
  status: "connected" | "warning" | "disconnected";
}) {
  const statusClass =
    status === "connected"
      ? "bg-emerald-400"
      : status === "warning"
        ? "bg-amber-400"
        : "bg-slate-500";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <span className="truncate text-xs text-[var(--text-secondary)]">
        {label}
      </span>
      <span className={`h-2.5 w-2.5 rounded-full ${statusClass}`} />
    </div>
  );
}

export function Sidebar({
  conversations,
  activeView,
  onViewChange,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("active");

  const createConversation = useConversationStore(
    (state) => state.createConversation,
  );

  const {
    setSessionId,
    clearMessages,
    setToolEvents,
    setStatusLabel,
    setIsStreaming,
  } = useChatStore();

  const { resetRuntimeMetrics, resetMemoryState, clearLogs, setFinalStatus } =
    useRuntimeStore();

  function handleNewSession() {
    const nextSessionId = createSessionId();

    setSessionId(nextSessionId);
    clearMessages();
    setToolEvents([]);
    setStatusLabel(null);
    setIsStreaming(false);

    resetRuntimeMetrics();
    resetMemoryState();
    clearLogs();
    setFinalStatus("idle");

    createConversation({
      sessionId: nextSessionId,
      title: "Nouvelle conversation",
    });

    setSessionFilter("active");
    onViewChange("assistant");
  }

  const activeCount = useMemo(
    () =>
      conversations.filter((conversation) => !conversation.archivedAt).length,
    [conversations],
  );

  const archivedCount = useMemo(
    () =>
      conversations.filter((conversation) => Boolean(conversation.archivedAt))
        .length,
    [conversations],
  );

  function getNavButtonClass(view: AppView) {
    const isActive = activeView === view;

    return [
      "brainiak-hover flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
      isActive
        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-100"
        : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
    ].join(" ");
  }

  function getFilterButtonClass(filter: SessionFilter) {
    const isActive = sessionFilter === filter;

    return [
      "flex-1 rounded-xl px-3 py-2 text-xs font-medium transition",
      isActive
        ? "bg-cyan-500/10 text-cyan-200"
        : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
    ].join(" ");
  }

  return (
    <aside className="flex h-screen min-h-0 min-w-0 flex-col border-r border-[var(--border)] bg-[var(--surface-1)]">
      <div className="shrink-0 border-b border-[var(--border)] p-4">
        <div className="mb-4 flex items-center gap-3">
          <img
            src={logoBrainiak}
            alt="Brainiak"
            className="h-12 w-12 rounded-2xl object-cover"
          />

          <div className="min-w-0">
            <h1 className="heading-brainiak truncate text-lg text-[var(--text-primary)]">
              BrainiaK
            </h1>
            <p className="text-secondary truncate text-sm">
              Espace Infini
            </p>
          </div>
        </div>

        <Button
          onClick={handleNewSession}
          className="w-full justify-start bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto">
        <nav className="border-b border-[var(--border)] p-4">
          <p className="mb-3 px-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Navigation
          </p>

          <div className="space-y-1">
            {infiniNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;

              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => onViewChange(item.view)}
                  className={getNavButtonClass(item.view)}
                  title={item.description}
                >
                  <Icon
                    className={[
                      "h-4 w-4",
                      isActive
                        ? "text-cyan-300"
                        : "text-[var(--text-secondary)]",
                    ].join(" ")}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-b border-[var(--border)] p-4">
          <p className="mb-3 px-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Conversations
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher"
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
            />
          </div>

          <div className="mt-3 flex rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-1">
            <button
              type="button"
              onClick={() => setSessionFilter("active")}
              className={getFilterButtonClass("active")}
            >
              Actives · {activeCount}
            </button>

            <button
              type="button"
              onClick={() => setSessionFilter("archived")}
              className={getFilterButtonClass("archived")}
            >
              Archivées · {archivedCount}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-4">
          <ConversationList
            conversations={conversations
              .filter((conversation) =>
                sessionFilter === "active"
                  ? !conversation.archivedAt
                  : Boolean(conversation.archivedAt),
              )
              .filter((conversation) => {
                if (!query.trim()) return true;

                return (
                  conversation.title
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                  conversation.preview
                    ?.toLowerCase()
                    .includes(query.toLowerCase())
                );
              })}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <div className="mb-4 space-y-2">
          <ConnectionStatusItem label="BrainiaK actif" status="connected" />
          <ConnectionStatusItem label="Mail connecté" status="warning" />
          <ConnectionStatusItem label="COMPLISOFT" status="warning" />
          <ConnectionStatusItem label="Coffre-fort" status="connected" />
        </div>

        <UserMenu />
      </div>
    </aside>
  );
}