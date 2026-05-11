import type { ToolEvent } from "@/types/chat";
import { ToolStepCard } from "./tool-step-card";

type ToolTimelineProps = {
  items: ToolEvent[];
};

export function ToolTimeline({ items }: ToolTimelineProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          No execution steps yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ToolStepCard key={item.id} item={item} />
      ))}
    </div>
  );
}