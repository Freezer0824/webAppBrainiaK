import { useRuntimeStore } from "@/store/runtime-store";

export function LiveLogConsole() {
  const { logs } = useRuntimeStore();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
      <h4 className="heading-brainiak text-sm mb-3">Live Logs</h4>

      <div className="scrollbar-brainiak max-h-[220px] overflow-y-auto font-mono text-xs text-green-400 space-y-1">
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>
    </div>
  );
}