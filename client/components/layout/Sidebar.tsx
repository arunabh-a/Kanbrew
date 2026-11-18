"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderKanban, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { User } from "@/service/app.interface";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileDialog } from "@/components/layout/ProfileDialog";

interface SidebarProps {
    user: User;
    onLogout: () => void;
}

const NAV_ITEMS = [
    { href: "/", label: "My Tasks", icon: LayoutGrid, exact: true },
    { href: "/projects", label: "Projects", icon: FolderKanban, exact: false },
];

function getInitials(name?: string | null) {
    return (
        (name ?? "")
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "??"
    );
}

function SidebarContent({
    user,
    onLogout,
    onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
    const pathname = usePathname();
    const [profileOpen, setProfileOpen] = useState(false);
    const initials = getInitials(user.name);

    const footerItemClass =
        "flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-ink hover:bg-secondary/70 transition-colors outline-none";

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 h-12 shrink-0">
                <Link href="/" onClick={onNavigate} className="flex items-center gap-2 pl-1">
                    <span className="w-2 h-2 rounded-full bg-ochre" />
                    <span className="text-sm font-semibold tracking-tight text-ink">Yohaku</span>
                </Link>
            </div>

            <nav className="flex-1 px-2 pt-2 space-y-0.5">
                <p className="px-2.5 pb-1 text-[11px] text-muted-foreground">Workspace</p>
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                                active
                                    ? "bg-secondary text-ink font-medium"
                                    : "text-muted-foreground hover:text-ink hover:bg-secondary/70"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-2 py-3 space-y-0.5 shrink-0">
                <button onClick={() => setProfileOpen(true)} className={footerItemClass}>
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{user.name || user.email}</span>
                </button>
                <button onClick={onLogout} className={footerItemClass}>
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                </button>
            </div>

            <ProfileDialog user={user} open={profileOpen} onOpenChange={setProfileOpen} />
        </div>
    );
}

export function Sidebar({ user, onLogout }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-52 shrink-0 h-screen border-r border-sidebar-border bg-sidebar">
                <SidebarContent user={user} onLogout={onLogout} />
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden flex items-center h-12 px-3 border-b border-border bg-sidebar shrink-0">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-1.5 rounded-md hover:bg-secondary/60"
                    aria-label="Open sidebar"
                >
                    <Menu className="w-5 h-5 text-ink" />
                </button>
                <span className="ml-2 flex items-center gap-2 text-base font-bold tracking-tight text-ink">
                    <span className="w-2 h-2 rounded-full bg-ochre" />
                    Yohaku
                </span>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="relative w-64 h-full bg-sidebar border-r border-sidebar-border">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary/60"
                            aria-label="Close sidebar"
                        >
                            <X className="w-4 h-4 text-ink" />
                        </button>
                        <SidebarContent
                            user={user}
                            onLogout={onLogout}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                    <div className="flex-1 bg-ink/40" onClick={() => setMobileOpen(false)} />
                </div>
            )}
        </>
    );
}

