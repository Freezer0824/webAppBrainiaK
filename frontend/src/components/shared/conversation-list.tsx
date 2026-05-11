import { useState } from "react";
import {
  Archive,
  Copy,
  Download,
  Edit3,
  FileJson,
  MoreHorizontal,
  Pin,
  PinOff,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useConversationStore } from "@/store/conversation-store";
import { useChatStore } from "@/store/chat-store";
import type { ConversationItem, StoredConversation } from "@/types/chat";

type ConversationListProps = {
  conversations: ConversationItem[];
};

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function safeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function conversationToMarkdown(conversation: StoredConversation) {
  const lines: string[] = [
    `# ${conversation.title}`,
    "",
    `- Session ID: ${conversation.sessionId}`,
    `- Created at: ${conversation.createdAt}`,
    `- Updated at: ${conversation.updatedAt}`,
    `- Archived at: ${conversation.archivedAt ?? "—"}`,
    `- Pinned: ${conversation.pinned ? "yes" : "no"}`,
    "",
    "## Messages",
    "",
  ];

  if (conversation.messages.length === 0) {
    lines.push("_Aucun message._");
    return lines.join("\n");
  }

  for (const message of conversation.messages) {
    lines.push(`### ${message.role}${message.timestamp ? ` · ${message.timestamp}` : ""}`);
    lines.push("");
    lines.push(message.content || "_Message vide._");
    lines.push("");

    if (message.attachments && message.attachments.length > 0) {
      lines.push("Attachments:");
      for (const attachment of message.attachments) {
        lines.push(`- ${attachment.name} (${attachment.type}, ${attachment.size} bytes)`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function ConversationList({ conversations }: ConversationListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const {
    activeConversationId,
    conversations: storedConversations,
    setActiveConversation,
    renameConversation,
    archiveConversation,
    restoreConversation,
    deleteConversation,
    duplicateConversation,
    pinConversation,
    unpinConversation,
    clearConversationMessages,
  } = useConversationStore();

  const { setMessages, setSessionId } = useChatStore();

  function findStoredConversation(id: string) {
    return storedConversations.find((item) => item.id === id) ?? null;
  }

  function handleOpenConversation(id: string) {
    const conversation = findStoredConversation(id);

    if (!conversation) return;

    setActiveConversation(id);
    setMessages(conversation.messages);
    setSessionId(conversation.sessionId);
    setOpenMenuId(null);
  }

  function startRename(conversation: ConversationItem) {
    setRenamingId(conversation.id);
    setRenameValue(conversation.title);
    setOpenMenuId(null);
  }

  function submitRename(id: string) {
    renameConversation(id, renameValue);
    setRenamingId(null);
    setRenameValue("");
  }

  function handleArchive(id: string) {
    const confirmed = window.confirm(
      "Archiver cette session ? Elle sera déplacée dans les sessions archivées.",
    );

    if (!confirmed) return;

    archiveConversation(id);
    setOpenMenuId(null);
  }

  function handleRestore(id: string) {
    restoreConversation(id);
    setOpenMenuId(null);
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Supprimer définitivement cette session ? Cette action est irréversible.",
    );

    if (!confirmed) return;

    deleteConversation(id);
    setOpenMenuId(null);
  }

  function handleDuplicate(id: string) {
    const duplicatedId = duplicateConversation(id);

    if (duplicatedId) {
      handleOpenConversation(duplicatedId);
    }

    setOpenMenuId(null);
  }

  function handlePin(conversation: ConversationItem) {
    if (conversation.pinned) {
      unpinConversation(conversation.id);
    } else {
      pinConversation(conversation.id);
    }

    setOpenMenuId(null);
  }

  function handleClearMessages(id: string) {
    const confirmed = window.confirm(
      "Effacer l’historique de cette session ? Les messages seront supprimés.",
    );

    if (!confirmed) return;

    clearConversationMessages(id);

    const conversation = findStoredConversation(id);

    if (conversation && activeConversationId === id) {
      setMessages([]);
      setSessionId(conversation.sessionId);
    }

    setOpenMenuId(null);
  }

  function handleExportJson(id: string) {
    const conversation = findStoredConversation(id);

    if (!conversation) return;

    const filename = `${safeFilename(conversation.title) || "session"}.json`;

    downloadTextFile(
      filename,
      JSON.stringify(conversation, null, 2),
      "application/json;charset=utf-8",
    );

    setOpenMenuId(null);
  }

  function handleExportMarkdown(id: string) {
    const conversation = findStoredConversation(id);

    if (!conversation) return;

    const filename = `${safeFilename(conversation.title) || "session"}.md`;

    downloadTextFile(
      filename,
      conversationToMarkdown(conversation),
      "text/markdown;charset=utf-8",
    );

    setOpenMenuId(null);
  }

  if (conversations.length === 0) {
    return (
      <div className="scrollbar-brainiak h-full overflow-y-auto p-4">
        <div className="mb-3">
          <p className="text-secondary text-xs uppercase tracking-[0.18em]">
            Sessions
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
          Aucune session à afficher.
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-brainiak h-full overflow-y-auto p-4">
      <div className="mb-3">
        <p className="text-secondary text-xs uppercase tracking-[0.18em]">
          Sessions
        </p>
      </div>

      <div className="space-y-2">
        {conversations.map((conversation) => {
          const isActive = activeConversationId === conversation.id;
          const isRenaming = renamingId === conversation.id;
          const isArchived = Boolean(conversation.archivedAt);

          return (
            <div
              key={conversation.id}
              className={[
                "relative rounded-xl border bg-[var(--surface-2)] transition",
                isActive
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-[var(--border)] hover:border-cyan-500/30",
                isArchived ? "opacity-75" : "",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => handleOpenConversation(conversation.id)}
                className="brainiak-hover block w-full rounded-xl px-4 py-3 pr-11 text-left"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {conversation.pinned ? (
                    <Pin className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  ) : null}

                  {isArchived ? (
                    <Archive className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                  ) : null}

                  {isRenaming ? (
                    <input
                      value={renameValue}
                      autoFocus
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          submitRename(conversation.id);
                        }

                        if (event.key === "Escape") {
                          setRenamingId(null);
                          setRenameValue("");
                        }
                      }}
                      onBlur={() => submitRename(conversation.id)}
                      className="w-full rounded-lg border border-cyan-500/30 bg-[var(--surface-1)] px-2 py-1 text-sm text-[var(--text-primary)] outline-none"
                    />
                  ) : (
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {conversation.title}
                    </p>
                  )}
                </div>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {conversation.updatedAt}
                </p>

                {conversation.preview ? (
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--text-muted)]">
                    {conversation.preview}
                  </p>
                ) : null}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId((current) =>
                    current === conversation.id ? null : conversation.id,
                  );
                }}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {openMenuId === conversation.id ? (
                <div className="absolute right-2 top-10 z-30 w-60 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => startRename(conversation)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <Edit3 className="h-4 w-4" />
                    Renommer
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePin(conversation)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    {conversation.pinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                    {conversation.pinned ? "Désépingler" : "Épingler"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(conversation.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <Copy className="h-4 w-4" />
                    Dupliquer
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportJson(conversation.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <FileJson className="h-4 w-4" />
                    Exporter JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportMarkdown(conversation.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <Download className="h-4 w-4" />
                    Exporter Markdown
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearMessages(conversation.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <XCircle className="h-4 w-4" />
                    Effacer l’historique
                  </button>

                  <div className="my-2 border-t border-[var(--border)]" />

                  {isArchived ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(conversation.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleArchive(conversation.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-amber-300 hover:bg-amber-500/10"
                    >
                      <Archive className="h-4 w-4" />
                      Archiver
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(conversation.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}