import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { TaskStatus } from "@/service/app.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TaskToolbarProps {
    view: "list" | "kanban";
    onViewChange: (view: "list" | "kanban") => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: TaskStatus | "ALL";
    onStatusFilterChange: (status: TaskStatus | "ALL") => void;
    onCreateTask: () => void;
}

export function TaskToolbar({
    view,
    onViewChange,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onCreateTask,
}: TaskToolbarProps) {
    const toggleClass = (active: boolean) =>
        cn(
            "flex items-center justify-center px-2.5 h-6 rounded-full transition-colors",
            active
                ? "bg-card text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
        );

    return (
        <header className="flex flex-wrap items-center gap-3 px-4 min-h-12 py-2 border-b border-border shrink-0">
            <h1 className="text-[13px] font-semibold text-ink mr-auto">My Tasks</h1>

            <div className="relative w-full sm:w-52 order-last sm:order-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-7 pl-8 text-xs rounded-full bg-secondary border-transparent shadow-none"
                />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger
                    size="sm"
                    className="h-7 w-[120px] text-xs bg-secondary border-transparent shadow-none"
                >
                    <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center bg-secondary rounded-full p-0.5">
                <button
                    aria-label="List View"
                    onClick={() => onViewChange("list")}
                    className={toggleClass(view === "list")}
                >
                    <List className="h-3.5 w-3.5" />
                </button>
                <button
                    aria-label="Kanban View"
                    onClick={() => onViewChange("kanban")}
                    className={toggleClass(view === "kanban")}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                </button>
            </div>

            <Button onClick={onCreateTask} size="sm" className="h-7 gap-1.5 rounded-full text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Task</span>
            </Button>
        </header>
    );
}
