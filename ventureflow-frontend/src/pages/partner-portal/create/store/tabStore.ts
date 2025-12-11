import { create } from "zustand";

interface TabStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "partner-overview",
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
