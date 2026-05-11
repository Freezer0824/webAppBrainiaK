import { useRuntimeStore } from "@/store/runtime-store";
import { SessionContextCard } from "./session-context-card";
import { ConversationMeta } from "./conversation-meta";
import { DebugMemoryView } from "./debug-memory-view";

export function MemoryPanel() {
  const {
    activeSessionId,
    currentContext,
    lastUserPrompt,
    messageCount,
    lastPipelineStatus,
    recentTools,
    debugMode,
  } = useRuntimeStore();

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2">
          <h4 className="heading-brainiak text-sm">Visible Memory</h4>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Continuity and context for the active Brainiak session
          </p>
        </div>

        <div className="space-y-4">
          <SessionContextCard
            sessionId={activeSessionId}
            currentContext={currentContext}
          />

          <ConversationMeta
            messageCount={messageCount}
            lastUserPrompt={lastUserPrompt}
            lastPipelineStatus={lastPipelineStatus}
            recentTools={recentTools}
          />

          <DebugMemoryView
            debugMode={debugMode}
            data={{
              sessionId: activeSessionId,
              currentContext,
              lastUserPrompt,
              messageCount,
              lastPipelineStatus,
              recentTools,
            }}
          />
        </div>
      </section>
    </div>
  );
}
