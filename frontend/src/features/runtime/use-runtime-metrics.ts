import { useRuntimeStore } from "@/store/runtime-store";

export function useRuntimeMetrics() {
  const totalLatencyMs = useRuntimeStore((state) => state.totalLatencyMs);
  const toolsUsed = useRuntimeStore((state) => state.toolsUsed);
  const signals = useRuntimeStore((state) => state.signals);
  const lastError = useRuntimeStore((state) => state.lastError);
  const logs = useRuntimeStore((state) => state.logs);
  const finalStatus = useRuntimeStore((state) => state.finalStatus);

  return {
    totalLatencyMs,
    toolsUsed,
    signals,
    lastError,
    logs,
    finalStatus,
  };
}