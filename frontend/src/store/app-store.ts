import { create } from "zustand";

export const useAppStore = create<{
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));