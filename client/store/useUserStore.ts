import { create } from "zustand";
import { User } from "@/service/app.interface";

interface UserState {
    /** The authenticated user, or null if not logged in */
    user: User | null;
    /** True while the initial profile fetch is in flight */
    loading: boolean;
    /**
     * True once we've attempted at least one profile fetch.
     * Prevents repeated fetches on every component mount.
     */
    hydrated: boolean;

    // ── Actions ──────────────────────────────────────────────────────────────
    setUser: (user: User | null) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()((set) => ({
    user: null,
    loading: true,
    hydrated: false,

    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setLoading: (loading) => set({ loading }),
    setHydrated: (hydrated) => set({ hydrated }),
}));

// ── Standalone selectors (for use outside React, e.g. interceptor) ────────────

export const getUser = () => useUserStore.getState().user;
export const setStoreUser = (user: User | null) =>
    useUserStore.getState().setUser(user);
export const clearStoreUser = () => useUserStore.getState().clearUser();
