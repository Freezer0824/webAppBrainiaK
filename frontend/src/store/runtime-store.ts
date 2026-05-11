import { create } from "zustand";

export type RuntimeApiEvent = {
  id: string;
  module: string;
  action: string;
  method: string;
  route: string;
  status: "idle" | "running" | "success" | "error";
  httpStatus?: number | null;
  durationMs?: number | null;
  payloadPreview?: string | null;
  error?: string | null;
  createdAt: string;
};

type RuntimeMetrics = {
  totalLatencyMs: number | null;
  toolsUsed: number | null;
  signals: Record<string, unknown> | null;
  lastError: string | null;
  logs: string[];
};

type MemoryState = {
  activeSessionId: string | null;
  currentContext: string | null;
  lastUserPrompt: string | null;
  messageCount: number;
  lastPipelineStatus: string | null;
  recentTools: string[];
};

type RuntimeState = RuntimeMetrics &
  MemoryState & {
    finalStatus: "idle" | "running" | "done" | "error";
    debugMode: boolean;
    apiEvents: RuntimeApiEvent[];

    setRuntimeMetrics: (payload: Partial<RuntimeMetrics>) => void;
    setMemoryState: (payload: Partial<MemoryState>) => void;

    pushLog: (line: string) => void;
    clearLogs: () => void;

    pushApiEvent: (
      payload: Omit<RuntimeApiEvent, "id" | "createdAt">,
    ) => void;
    clearApiEvents: () => void;

    setDebugMode: (value: boolean) => void;
    setFinalStatus: (status: RuntimeState["finalStatus"]) => void;

    resetRuntimeMetrics: () => void;
    resetMemoryState: () => void;
  };

export const useRuntimeStore = create<RuntimeState>((set) => ({
  totalLatencyMs: null,
  toolsUsed: null,
  signals: null,
  lastError: null,
  logs: [],

  activeSessionId: null,
  currentContext: null,
  lastUserPrompt: null,
  messageCount: 0,
  lastPipelineStatus: null,
  recentTools: [],

  finalStatus: "idle",
  debugMode: false,
  apiEvents: [],

  setRuntimeMetrics: (payload) =>
    set((state) => ({
      totalLatencyMs:
        payload.totalLatencyMs !== undefined
          ? payload.totalLatencyMs
          : state.totalLatencyMs,
      toolsUsed:
        payload.toolsUsed !== undefined ? payload.toolsUsed : state.toolsUsed,
      signals: payload.signals !== undefined ? payload.signals : state.signals,
      lastError:
        payload.lastError !== undefined ? payload.lastError : state.lastError,
      logs: payload.logs !== undefined ? payload.logs : state.logs,
    })),

  setMemoryState: (payload) =>
    set((state) => ({
      activeSessionId:
        payload.activeSessionId !== undefined
          ? payload.activeSessionId
          : state.activeSessionId,
      currentContext:
        payload.currentContext !== undefined
          ? payload.currentContext
          : state.currentContext,
      lastUserPrompt:
        payload.lastUserPrompt !== undefined
          ? payload.lastUserPrompt
          : state.lastUserPrompt,
      messageCount:
        payload.messageCount !== undefined
          ? payload.messageCount
          : state.messageCount,
      lastPipelineStatus:
        payload.lastPipelineStatus !== undefined
          ? payload.lastPipelineStatus
          : state.lastPipelineStatus,
      recentTools:
        payload.recentTools !== undefined
          ? payload.recentTools
          : state.recentTools,
    })),

  pushLog: (line) =>
    set((state) => ({
      logs: [...state.logs.slice(-99), line],
    })),

  clearLogs: () => set({ logs: [] }),

  pushApiEvent: (payload) =>
    set((state) => {
      const createdAt = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const event: RuntimeApiEvent = {
        id: crypto.randomUUID(),
        createdAt,
        ...payload,
      };

      return {
        apiEvents: [event, ...state.apiEvents].slice(0, 50),
        lastError: payload.error ?? state.lastError,
        finalStatus:
          payload.status === "error"
            ? "error"
            : payload.status === "running"
              ? "running"
              : state.finalStatus,
      };
    }),

  clearApiEvents: () => set({ apiEvents: [] }),

  setDebugMode: (debugMode) => set({ debugMode }),

  setFinalStatus: (finalStatus) => set({ finalStatus }),

  resetRuntimeMetrics: () =>
    set({
      totalLatencyMs: null,
      toolsUsed: null,
      signals: null,
      lastError: null,
      finalStatus: "idle",
    }),

  resetMemoryState: () =>
    set({
      activeSessionId: null,
      currentContext: null,
      lastUserPrompt: null,
      messageCount: 0,
      lastPipelineStatus: null,
      recentTools: [],
    }),
}));