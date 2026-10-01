import { create } from "zustand";

interface OrganizationState {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
}

const getInitialOrgId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("apiaura_selected_org_id");
};

export const useOrganizationStore = create<OrganizationState>((set) => ({
  selectedOrganizationId: getInitialOrgId(),

  setSelectedOrganizationId: (id) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("apiaura_selected_org_id", id);
      } else {
        localStorage.removeItem("apiaura_selected_org_id");
      }
    }
    set({ selectedOrganizationId: id });
  },
}));
