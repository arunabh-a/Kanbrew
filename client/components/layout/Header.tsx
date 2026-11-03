'use client';
import { LogOut, User, LayoutGrid, FolderKanban } from "lucide-react";
import { User as UserType } from "@/service/app.interface";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
    user: UserType;
    onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
    const pathname = usePathname();
    const initials = (user.name ?? "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??";

    return (
        <header className="sticky flex top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-lg h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-ochre" />
                    <span className="text-xl font-bold tracking-tight text-ink">Yohaku</span>
                </Link>
                <nav className="hidden sm:flex items-center gap-1.5">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            pathname === "/"
                                ? "bg-slate text-ivory shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        My Tasks
                    </Link>
                    <Link
                        href="/projects"
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            pathname.startsWith("/projects")
                                ? "bg-slate text-ivory shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                        }`}
                    >
                        <FolderKanban className="w-4 h-4" />
                        Projects
                    </Link>
                </nav>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                    >
                        <Avatar className="h-9 w-9 border border-ochre/40">
                            <AvatarFallback className="bg-ochre/20 text-ink text-sm font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-10 w-10 border border-ochre/40">
                            <AvatarFallback className="bg-ochre/20 text-ink font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5">
                            <p className="text-sm font-medium text-ink">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={onLogout}
                        className="text-destructive focus:text-destructive"
                    >
                        <User className="mr-2 h-4 w-4" />
                        Your Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onLogout}
                        className="text-destructive focus:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
