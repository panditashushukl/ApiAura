import { create } from "zustand";

interface UIState {
    sidebarOpen: boolean;
    secondarySidebarOpen: boolean;
    mobileSidebarOpen: boolean;
    adminExpanded: boolean;

    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    toggleSecondarySidebar: () => void;
    setSecondarySidebarOpen: (open: boolean) => void;

    toggleMobileSidebar: () => void;
    setMobileSidebarOpen: (open: boolean) => void;

    toggleAdminExpanded: () => void;
    setAdminExpanded: (expanded: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    secondarySidebarOpen: true,
    mobileSidebarOpen: false,
    adminExpanded: true,

    toggleSidebar: () =>
        set((state) => ({
            sidebarOpen: !state.sidebarOpen,
        })),

    setSidebarOpen: (open) =>
        set({
            sidebarOpen: open,
        }),

    toggleSecondarySidebar: () =>
        set((state) => ({
            secondarySidebarOpen: !state.secondarySidebarOpen,
        })),

    setSecondarySidebarOpen: (open) =>
        set({
            secondarySidebarOpen: open,
        }),

    toggleMobileSidebar: () =>
        set((state) => ({
            mobileSidebarOpen: !state.mobileSidebarOpen,
        })),

    setMobileSidebarOpen: (open) =>
        set({
            mobileSidebarOpen: open,
        }),

    toggleAdminExpanded: () =>
        set((state) => ({
            adminExpanded: !state.adminExpanded,
        })),

    setAdminExpanded: (expanded) =>
        set({
            adminExpanded: expanded,
        }),
}));