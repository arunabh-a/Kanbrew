import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { Task, TaskStatus } from "@/service/app.interface";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

interface KanbanBoardProps {
    tasks: Task[];
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    onMove: (taskId: string, newStatus: TaskStatus) => void;
    onAddTask: (status: TaskStatus) => void;
    getTasksByStatus: (status: TaskStatus) => Task[];
}

const columns: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "To Do" },
    { status: "IN_PROGRESS", title: "In Progress" },
    { status: "DONE", title: "Done" },
];

export function KanbanBoard({
    tasks,
    onUpdate,
    onDelete,
    onMove,
    onAddTask,
    getTasksByStatus,
}: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as TaskStatus;

        // Check if dropped on a column (not another task)
        if (columns.some((col) => col.status === newStatus)) {
            const task = tasks.find((t) => t.id === taskId);
            if (task && task.status !== newStatus) {
                onMove(taskId, newStatus);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        status={column.status}
                        title={column.title}
                        tasks={getTasksByStatus(column.status)}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask && (
                    <TaskCard
                        task={activeTask}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        isDragging
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
}
