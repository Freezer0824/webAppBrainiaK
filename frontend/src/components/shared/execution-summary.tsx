import { Activity, CheckCircle2, Clock3, Wrench } from "lucide-react";
import { useRuntimeStore } from "@/store/runtime-store";
import { PipelinePhaseBadge } from "./pipeline-phase-badge";

export function ExecutionSummary() {
  const { totalLatencyMs, toolsUsed, finalStatus } = useRuntimeStore();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="heading-brainiak text-sm">Execution Summary</h4>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Runtime overview of the current Brainiak request
          </p>
        </div>

        <PipelinePhaseBadge status={finalStatus}>
          {finalStatus}
        </PipelinePhaseBadge>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock3 className="h-4 w-4" />
            Latency
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {totalLatencyMs !== null ? `${totalLatencyMs} ms` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Wrench className="h-4 w-4" />
            Tools used
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {toolsUsed !== null ? toolsUsed : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Activity className="h-4 w-4" />
            Runtime
          </div>
          <span className="text-sm font-medium capitalize text-[var(--text-primary)]">
            {finalStatus}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <CheckCircle2 className="h-4 w-4" />
            Result
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {finalStatus === "done" ? "Completed" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}