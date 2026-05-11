import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Wrench,
  Workflow,
} from "lucide-react";
import type { ToolEvent } from "@/types/chat";
import { PipelinePhaseBadge } from "./pipeline-phase-badge";

type ToolStepCardProps = {
  item: ToolEvent;
};

export function ToolStepCard({ item }: ToolStepCardProps) {
  function getIcon() {
    if (item.status === "running") {
      return <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />;
    }

    if (item.status === "done") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }

    if (item.status === "error") {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }

    if (item.category === "phase") {
      return <Workflow className="h-4 w-4 text-[var(--text-secondary)]" />;
    }

    return <Wrench className="h-4 w-4 text-[var(--text-secondary)]" />;
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-2 flex items-center gap-2">
        {getIcon()}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {item.name}
          </p>
          {item.turn ? (
            <p className="text-xs text-[var(--text-muted)]">Turn {item.turn}</p>
          ) : null}
        </div>

        <PipelinePhaseBadge status={item.status}>
          {item.status}
        </PipelinePhaseBadge>
      </div>

      <div className="space-y-1">
        {item.detail ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {item.detail}
          </p>
        ) : null}

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {item.category ? <span>{item.category}</span> : null}
          {item.latencyMs ? <span>{item.latencyMs} ms</span> : null}
          {item.timestamp ? <span>{item.timestamp}</span> : null}
        </div>
      </div>
    </div>
  );
}