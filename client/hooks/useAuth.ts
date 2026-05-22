'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/service/app.api";
import { useUserStore } from "@/store/useUserStore";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { usePathname } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, hydrated, setUser, clearUser, setLoading, setHydrated } =
        useUserStore();

    const globalLogout = () => {
        clearUser();
        router.push("/home");
    };

    useEffect(() => {
        // Only fetch once — subsequent mounts read from the store directly.
        if (hydrated) {
            setLoading(false);
            return;
        }
        loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated]);

    const loadUser = async () => {
        setLoading(true);
        try {
            // if (PUBLIC_ROUTES.includes(pathname)) {
            //     return;
            // } else {

            // }
            const userData = await apiRoutes.user.getProfile();
            setUser(userData);
        } catch (error) {
            console.error("Failed to load user:", error);
            clearUser();
        } finally {
            setLoading(false);
            setHydrated(true);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            await apiRoutes.auth.register({ name, email, password });
            return {
                success: true,
                message:
                    "Registration successful! Please check your email to verify your account.",
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiRoutes.auth.login({ email, password });
            setUser(response.user);
            setHydrated(true);
            router.push("/");
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await apiRoutes.auth.logout();
            await fetch('/api')
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearUser();
            setHydrated(false);
            router.push("/home");
        }
    };

    const updateProfile = async (data: { name?: string; bio?: string }) => {
        try {
            const updatedUser = await apiRoutes.user.updateProfile(data);
            setUser(updatedUser);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    return {
        user,
        loading,
        hydrated,
        globalLogout,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        refreshUser: loadUser,
    };
}
