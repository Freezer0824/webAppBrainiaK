import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkflowStatus =
  | "pending"
  | "running"
  | "done"
  | "error"
  | "cancelled";

export type WorkflowMetadata = Record<string, unknown>;

export type WorkflowTask = {
  id: string;

  title: string;
  description?: string;

  status: WorkflowStatus;

  startedAt: string;
  completedAt?: string;
  updatedAt?: string;

  result?: string;
  errorMessage?: string;
  metadata?: WorkflowMetadata;

  relatedEntityId?: string;
  relatedEntityType?: string;
};

type StartWorkflowTaskInput = Omit<
  WorkflowTask,
  "id" | "startedAt" | "status" | "completedAt" | "updatedAt"
>;

type WorkflowStore = {
  tasks: WorkflowTask[];

  startTask: (task: StartWorkflowTaskInput) => string;

  completeTask: (
    id: string,
    result?: string,
    metadata?: WorkflowMetadata,
  ) => void;

  failTask: (
    id: string,
    errorMessage?: string,
    metadata?: WorkflowMetadata,
  ) => void;

  cancelTask: (id: string) => void;

  removeTask: (id: string) => void;

  clearTasks: () => void;

  getTaskById: (id: string) => WorkflowTask | undefined;

  getRunningTaskForEntity: (
    relatedEntityType: string,
    relatedEntityId: string,
  ) => WorkflowTask | undefined;

  getLatestDoneTaskForEntity: (
    relatedEntityType: string,
    relatedEntityId: string,
  ) => WorkflowTask | undefined;
};

function nowIso() {
  return new Date().toISOString();
}

function mergeMetadata(
  current?: WorkflowMetadata,
  next?: WorkflowMetadata,
): WorkflowMetadata | undefined {
  if (!current && !next) return undefined;

  return {
    ...(current ?? {}),
    ...(next ?? {}),
  };
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      startTask: (task) => {
        const id = crypto.randomUUID();
        const now = nowIso();

        set((state) => ({
          tasks: [
            {
              id,
              startedAt: now,
              updatedAt: now,
              status: "running",
              ...task,
            },
            ...state.tasks,
          ],
        }));

        return id;
      },

      completeTask: (id, result, metadata) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "done",
                  completedAt: nowIso(),
                  updatedAt: nowIso(),
                  result: result ?? task.result,
                  metadata: mergeMetadata(task.metadata, metadata),
                }
              : task,
          ),
        })),

      failTask: (id, errorMessage, metadata) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "error",
                  completedAt: nowIso(),
                  updatedAt: nowIso(),
                  errorMessage,
                  metadata: mergeMetadata(task.metadata, metadata),
                }
              : task,
          ),
        })),

      cancelTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "cancelled",
                  completedAt: nowIso(),
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      clearTasks: () =>
        set({
          tasks: [],
        }),

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getRunningTaskForEntity: (relatedEntityType, relatedEntityId) => {
        return get().tasks.find(
          (task) =>
            task.relatedEntityType === relatedEntityType &&
            task.relatedEntityId === relatedEntityId &&
            task.status === "running",
        );
      },

      getLatestDoneTaskForEntity: (relatedEntityType, relatedEntityId) => {
        return get().tasks.find(
          (task) =>
            task.relatedEntityType === relatedEntityType &&
            task.relatedEntityId === relatedEntityId &&
            task.status === "done",
        );
      },
    }),
    {
      name: "brainiak-workflow",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<WorkflowStore>;

        if (!state?.tasks) {
          return {
            tasks: [],
          };
        }

        return {
          ...state,
          tasks: state.tasks.map((task) => ({
            ...task,
            updatedAt: task.updatedAt ?? task.completedAt ?? task.startedAt,
            metadata: task.metadata ?? undefined,
            result: task.result ?? undefined,
          })),
        };
      },
    },
  ),
);