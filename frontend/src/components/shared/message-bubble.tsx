import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const canCopy = message.role === "assistant" && message.content.trim().length > 0;

  async function handleCopy() {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  return (
    <div
      className={[
        "group relative rounded-2xl border p-4",
        isUser
          ? "ml-auto max-w-[70%] border-cyan-500/20 bg-cyan-500/10"
          : "max-w-[70%] border-[var(--border)] bg-[var(--surface-2)]",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          <span>{message.role === "user" ? "Vous" : "BrainiaK"}</span>
          {message.timestamp ? <span>{message.timestamp}</span> : null}
        </div>

        {canCopy ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2 py-1 text-xs text-[var(--text-secondary)] opacity-0 transition hover:text-[var(--text-primary)] group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                Copié
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copier
              </>
            )}
          </button>
        ) : null}
      </div>

      {message.attachments && message.attachments.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {message.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-primary)]"
            >
              <span className="max-w-[180px] truncate">{attachment.name}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                joint
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">
        {message.content}
      </div>
    </div>
  );
}