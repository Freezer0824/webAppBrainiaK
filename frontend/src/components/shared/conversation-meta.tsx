type ConversationMetaProps = {
  messageCount: number;
  lastUserPrompt: string | null;
  lastPipelineStatus: string | null;
  recentTools: string[];
};

export function ConversationMeta({
  messageCount,
  lastUserPrompt,
  lastPipelineStatus,
  recentTools,
}: ConversationMetaProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3">
        <h4 className="heading-brainiak text-sm">Conversation Meta</h4>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Live conversation continuity and execution memory
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Message count
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            {messageCount}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Last prompt
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {lastUserPrompt ?? "No prompt yet."}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Last pipeline status
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            {lastPipelineStatus ?? "idle"}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Recent tools
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentTools.length ? (
              recentTools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300"
                >
                  {tool}
                </span>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No tools yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}