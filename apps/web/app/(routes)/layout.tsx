"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function PageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/home");
        }
    }, [user, loading, router]);

    // Wait for auth to resolve; once resolved, only render the app shell for a signed-in user.
    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-background">
            <Sidebar user={user} onLogout={logout} />
            <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
    );
}
