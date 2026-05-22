"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus, DashboardSummary } from "@/service/app.interface";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { TaskToolbar } from "@/components/layout/Toolbar";
import { TaskListView } from "@/components/tasks/TaskList";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { apiRoutes } from "@/service/app.api";
import { CheckSquare, Clock, AlertCircle, Circle } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const { loading: authLoading, logout } = useAuth();
    const { user } = useAuth();

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

    const handleLogout = async () => {
        await logout();
    };

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
            color: "text-muted-foreground",
            bg: "bg-muted/40",
        },
        {
            label: "In Progress",
            value: summary?.summary.IN_PROGRESS ?? "—",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Done",
            value: summary?.summary.DONE ?? "—",
            icon: CheckSquare,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            label: "Overdue",
            value: summary?.overdue ?? "—",
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-backgrond flex flex-col items-center">

            <main className="container px-4 md:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        My Tasks
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and organize your work efficiently
                    </p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                        >
                            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold leading-none">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <TaskToolbar
                    view={view}
                    onViewChange={setView}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onCreateTask={() => handleCreateTask()}
                />

                {tasksLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">
                                Loading tasks...
                            </p>
                        </div>
                    </div>
                ) : view === "list" ? (
                    <TaskListView
                        tasks={tasks}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                    />
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
