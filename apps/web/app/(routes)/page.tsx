"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus, DashboardSummary } from "@/service/app.interface";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { TaskToolbar } from "@/components/layout/Toolbar";
import { TaskListView } from "@/components/tasks/TaskList";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { apiRoutes } from "@/service/app.api";
import { CheckSquare, Clock, AlertCircle, Circle } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const { loading: authLoading, logout, user } = useAuth();

    const {
        tasks,
        loading: tasksLoading,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        getTasksByStatus,
    } = useTasks();

    const [view, setView] = useState<"list" | "kanban">("kanban");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("TODO");
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/home");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            apiRoutes.dashboard.getSummary()
                .then(setSummary)
                .catch(() => {/* non-critical, fail silently */});
        }
    }, [user]);

    const handleCreateTask = (status?: TaskStatus) => {
        if (status) {
            setDefaultStatus(status);
        } else {
            setDefaultStatus("TODO");
        }
        setIsCreateDialogOpen(true);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const statCards = [
        {
            label: "To Do",
            value: summary?.summary.TODO ?? "—",
            icon: Circle,
            color: "text-ink/70",
            bg: "bg-secondary",
            border: "border-border",
        },
        {
            label: "In Progress",
            value: summary?.summary.IN_PROGRESS ?? "—",
            icon: Clock,
            color: "text-slate",
            bg: "bg-slate/15",
            border: "border-slate/25",
        },
        {
            label: "Done",
            value: summary?.summary.DONE ?? "—",
            icon: CheckSquare,
            color: "text-moss",
            bg: "bg-moss/15",
            border: "border-moss/25",
        },
        {
            label: "Overdue",
            value: summary?.overdue ?? "—",
            icon: AlertCircle,
            color: "text-ochre",
            bg: "bg-ochre/15",
            border: "border-ochre/30",
        },
    ];

    return (
        <div className="flex flex-col h-full min-h-screen w-full bg-background">
            <TaskToolbar
                view={view}
                onViewChange={setView}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onCreateTask={() => handleCreateTask()}
            />

            <main className="flex-1 min-w-0 p-4">
                {tasksLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                            <p className="text-sm text-muted-foreground">
                                Loading tasks...
                            </p>
                        </div>
                    </div>
                ) : view === "list" ? (
                    <div className="max-w-2xl">
                        <TaskListView
                            tasks={tasks}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                        />
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onMove={moveTask}
                        onAddTask={handleCreateTask}
                        getTasksByStatus={getTasksByStatus}
                    />
                )}

                <TaskDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSubmit={addTask}
                    defaultStatus={defaultStatus}
                />
            </main>
        </div>
    );
}
