import { create } from "zustand";

interface WorkspaceState {
    selectedWorkspaceId: string | null;
    setSelectedWorkspace: (workspaceId: string) => void;
    clearSelectedWorkspace: () => void;
}

const getInitialWorkspaceId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("apiaura_selected_workspace_id");
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    selectedWorkspaceId: getInitialWorkspaceId(),

    setSelectedWorkspace: (workspaceId) => {
        if (typeof window !== "undefined") {
            if (workspaceId) {
                localStorage.setItem("apiaura_selected_workspace_id", workspaceId);
            } else {
                localStorage.removeItem("apiaura_selected_workspace_id");
            }
        }
        set({ selectedWorkspaceId: workspaceId });
    },

    clearSelectedWorkspace: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("apiaura_selected_workspace_id");
        }
        set({ selectedWorkspaceId: null });
    },
}));