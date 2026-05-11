import { Bell, Download, PanelRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { useConversationStore } from "@/store/conversation-store";

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function TopBar() {
  const statusLabel = useChatStore((state) => state.statusLabel);

  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId,
  );
  const conversations = useConversationStore((state) => state.conversations);

  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId,
    ) ?? null;

  function handleExportSession() {
    if (!activeConversation) return;

    const safeTitle = activeConversation.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "");

    const filename = `${safeTitle || "brainiak-session"}.json`;

    downloadTextFile(
      filename,
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          conversation: activeConversation,
        },
        null,
        2,
      ),
    );
  }

  return (
    <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
      <div>
        <h2 className="heading-brainiak text-xl">Brainiak Session</h2>
        <p className="text-secondary text-sm">
          {statusLabel
            ? `Pipeline: ${statusLabel}`
            : "Espace de travail de raisonnement structuré"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleExportSession}
          disabled={!activeConversation}
          title="Exporter la session"
          className="text-[var(--text-secondary)] disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Notifications"
          className="text-[var(--text-secondary)]"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Paramètres"
          className="text-[var(--text-secondary)]"
        >
          <Settings2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Panneau latéral"
          className="text-[var(--text-secondary)] lg:hidden"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}