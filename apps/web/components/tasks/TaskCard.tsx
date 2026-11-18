import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
    Calendar,
    GripVertical,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";
import { Task, Priority, TaskStatus } from "@/service/app.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StatusIcon } from "./StatusIcon";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    isDragging?: boolean;
}

const priorityLabels: Record<Priority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
};

const statusLabels: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
};

export function TaskCard({
    task,
    onUpdate,
    onDelete,
    isDragging,
}: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(
        task.description || ""
    );
    const titleRef = useRef<HTMLInputElement>(null);

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        if (isEditing && titleRef.current) {
            titleRef.current.focus();
            titleRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editedTitle.trim()) {
            onUpdate(task.id, {
                title: editedTitle.trim(),
                description: editedDescription.trim() || null,
            });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === "Escape") {
            setEditedTitle(task.title);
            setEditedDescription(task.description || "");
            setIsEditing(false);
        }
    };

    const handlePriorityChange = (priority: Priority) => {
        onUpdate(task.id, { priority });
    };

    const handleStatusChange = (status: TaskStatus) => {
        onUpdate(task.id, { status });
    };

    const priorityDot: Record<Priority, string> = {
        LOW: "bg-moss",
        MEDIUM: "bg-ochre",
        HIGH: "bg-priority-high",
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative gap-0 rounded-lg shadow-xs border-border/70",
                isDragging && "opacity-50 shadow-lg",
                task.status === "DONE" && "opacity-70"
            )}
        >
            <div className="p-3">
                {/* Title, drag handle & actions */}
                <div className="flex items-start justify-between gap-1">
                    <button
                        {...attributes}
                        {...listeners}
                        aria-label="Drag task"
                        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity -ml-1.5 mt-px"
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <Input
                                ref={titleRef}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSave}
                                className="h-7 text-[13px] font-semibold"
                            />
                        ) : (
                            <h3
                                className={cn(
                                    "text-[13px] font-semibold leading-snug text-ink cursor-text",
                                    task.status === "DONE" &&
                                        "line-through text-muted-foreground"
                                )}
                                onClick={() => setIsEditing(true)}
                            >
                                {task.title}
                            </h3>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mr-1 -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(task.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Description */}
                {isEditing ? (
                    <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a description..."
                        className="text-xs resize-none mt-2"
                        rows={2}
                    />
                ) : task.description ? (
                    <p
                        className="text-[11px] leading-relaxed text-muted-foreground mt-2 line-clamp-3 cursor-text"
                        onClick={() => setIsEditing(true)}
                    >
                        {task.description}
                    </p>
                ) : null}

                {/* Meta Info */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                    <Select
                        value={task.status}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger
                            aria-label={`Status: ${statusLabels[task.status]}`}
                            title={statusLabels[task.status]}
                            className="h-auto w-auto border-0 bg-transparent dark:bg-transparent dark:hover:bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg:last-child]:hidden"
                        >
                            <StatusIcon status={task.status} className="w-4 h-4" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                                In Progress
                            </SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={task.priority}
                        onValueChange={handlePriorityChange}
                    >
                        <SelectTrigger className="h-auto w-auto border-0 bg-transparent dark:bg-transparent dark:hover:bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg:last-child]:hidden">
                            <Badge
                                variant="secondary"
                                className="cursor-pointer gap-1.5 text-[11px] font-normal text-muted-foreground"
                            >
                                <span className={cn("size-1.5 rounded-full", priorityDot[task.priority])} />
                                {priorityLabels[task.priority]}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                    </Select>

                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
