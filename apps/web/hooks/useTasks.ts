import { useState, useEffect } from "react";
import { Task, TaskStatus, Priority } from "@/service/app.interface";
import { apiRoutes } from "@/service/app.api";

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

    // Load tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await apiRoutes.task.getTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks based on search query and status filter
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            searchQuery === "" ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const matchesStatus =
            statusFilter === "ALL" || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const addTask = async (
        taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
        try {
            const newTask = await apiRoutes.task.createTask({
                title: taskData.title,
                description: taskData.description ?? undefined,
                dueDate: taskData.dueDate ?? undefined,
                priority: taskData.priority,
                status: taskData.status,
            });
            setTasks((prev) => [newTask, ...prev]);
            return { success: true };
        } catch (error: any) {
            console.error("Failed to create task:", error);
            return { success: false, message: error.message };
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const updatedTask = await apiRoutes.task.updateTask(id, {
                title: updates.title,
                description: updates.description ?? undefined,
                dueDate: updates.dueDate ?? undefined,
                priority: updates.priority,
                status: updates.status,
            });
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === id ? { ...task, ...updatedTask } : task
                )
            );
            return { success: true };
        } catch (error: any) {
            console.error("Failed to update task:", error);
            return { success: false, message: error.message };
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await apiRoutes.task.deleteTask(id);
            setTasks((prev) => prev.filter((task) => task.id !== id));
            return { success: true };
        } catch (error: any) {
            console.error("Failed to delete task:", error);
            return { success: false, message: error.message };
        }
    };

    const moveTask = async (taskId: string, newStatus: TaskStatus) => {
        return updateTask(taskId, { status: newStatus });
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return filteredTasks.filter((task) => task.status === status);
    };

    return {
        tasks: filteredTasks,
        loading,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        getTasksByStatus,
        refreshTasks: loadTasks,
    };
}
