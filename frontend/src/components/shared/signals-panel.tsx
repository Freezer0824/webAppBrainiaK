import { useRuntimeStore } from "@/store/runtime-store";
import { SignalBadge } from "./signal-badge";

export function SignalsPanel() {
  const { signals } = useRuntimeStore();

  if (!signals) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <h4 className="heading-brainiak text-sm mb-3">Signals</h4>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(signals).map(([key, value]) => (
          <SignalBadge key={key} name={key} value={value} />
        ))}
      </div>
    </div>
  );
}