import { useRuntimeStore } from "@/store/runtime-store";

export function MetricsCard() {
  const { totalLatencyMs, toolsUsed, finalStatus } = useRuntimeStore();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <h4 className="heading-brainiak text-sm mb-3">Runtime Metrics</h4>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted">Latency</p>
          <p className="text-sm text-primary">
            {totalLatencyMs ? `${totalLatencyMs} ms` : "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">Tools</p>
          <p className="text-sm text-primary">
            {toolsUsed ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">Status</p>
          <p className="text-sm text-primary">{finalStatus}</p>
        </div>
      </div>
    </div>
  );
}