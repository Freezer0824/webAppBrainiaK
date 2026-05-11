import type { ToolEvent } from "@/types/chat";
import { ApiActivityPanel } from "./api-activity-panel";
import { ExecutionSummary } from "./execution-summary";
import { ToolTimeline } from "./tool-timeline";
import { MemoryPanel } from "./memory-panel";
import { ObservabilityPanel } from "./observability-panel";

type ToolPanelProps = {
  toolEvents: ToolEvent[];
};

export function ToolPanel({ toolEvents }: ToolPanelProps) {
  const latestEvents = [...toolEvents].slice(0, 5);

  return (
    <aside className="flex h-screen min-h-0 min-w-0 flex-col bg-[var(--surface-1)]">
      <div className="shrink-0 border-b border-[var(--border)] p-5">
        <h3 className="heading-brainiak text-lg">Tool Activity</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Global API activity, orchestration, execution, and memory trace
        </p>
      </div>

      <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <ApiActivityPanel />

          <ExecutionSummary />

          <section>
            <div className="mb-2">
              <h4 className="heading-brainiak text-sm">Execution Timeline</h4>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Ordered pipeline and tool steps
              </p>
            </div>

            <ToolTimeline items={toolEvents} />
          </section>

          <section>
            <div className="mb-2">
              <h4 className="heading-brainiak text-sm">Latest Events</h4>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Most recent activity snapshots
              </p>
            </div>

            <ToolTimeline items={latestEvents} />
          </section>

          <MemoryPanel />

          <ObservabilityPanel />
        </div>
      </div>
    </aside>
  );
}