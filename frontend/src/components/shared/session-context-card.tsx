type SessionContextCardProps = {
  sessionId: string | null;
  currentContext: string | null;
};

export function SessionContextCard({
  sessionId,
  currentContext,
}: SessionContextCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3">
        <h4 className="heading-brainiak text-sm">Session Context</h4>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Active memory scope for the current conversation
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Session ID
          </p>
          <p className="mt-1 break-all text-sm text-[var(--text-primary)]">
            {sessionId ?? "No active session"}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Current context
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {currentContext ?? "No contextual summary yet."}
          </p>
        </div>
      </div>
    </div>
  );
}