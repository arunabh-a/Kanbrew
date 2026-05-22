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
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={onStatusFilterChange}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-secondary rounded-lg p-1">
                    <button
                        aria-label="List View"
                        onClick={() => onViewChange("list")}
                        className={cn(
                            "flex items-center justify-center p-2 rounded-md transition-colors",
                            view === "list"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        aria-label="Kanban View"
                        onClick={() => onViewChange("kanban")}
                        className={cn(
                            "flex items-center justify-center p-2 rounded-md transition-colors",
                            view === "kanban"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>

                <Button onClick={onCreateTask} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Task</span>
                </Button>
            </div>
        </div>
    );
}
