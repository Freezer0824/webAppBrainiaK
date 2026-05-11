type DebugMemoryViewProps = {
  debugMode: boolean;
  data: {
    sessionId: string | null;
    currentContext: string | null;
    lastUserPrompt: string | null;
    messageCount: number;
    lastPipelineStatus: string | null;
    recentTools: string[];
  };
};

export function DebugMemoryView({ debugMode, data }: DebugMemoryViewProps) {
  if (!debugMode) return null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="mb-3">
        <h4 className="heading-brainiak text-sm text-amber-200">Debug Memory View</h4>
        <p className="mt-1 text-xs text-amber-100/70">
          Frontend-visible memory and session snapshot
        </p>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-amber-100/80">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}