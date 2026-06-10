import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityLevel = "info" | "success" | "warning" | "error";

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  level: ActivityLevel;
  createdAt: string;

  relatedEntityId?: string;
  relatedEntityType?: string;
};

type ActivityStore = {
  activities: ActivityItem[];

  addActivity: (activity: Omit<ActivityItem, "id" | "createdAt">) => string;
  removeActivity: (id: string) => void;
  clearActivities: () => void;
};

const MAX_ACTIVITIES = 200;

function nowIso() {
  return new Date().toISOString();
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      activities: [],

      addActivity: (activity) => {
        const id = crypto.randomUUID();

        set((state) => ({
          activities: [
            {
              id,
              createdAt: nowIso(),
              ...activity,
            },
            ...state.activities,
          ].slice(0, MAX_ACTIVITIES),
        }));

        return id;
      },

      removeActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        })),

      clearActivities: () =>
        set({
          activities: [],
        }),
    }),
    {
      name: "brainiak-activities",
      version: 1,
    },
  ),
);