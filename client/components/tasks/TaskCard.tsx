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

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative",
                isDragging && "opacity-50 shadow-lg",
                task.status === "DONE" && "opacity-70"
            )}
        >
            <div className="p-4">
                {/* Drag Handle & Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity p-1 -ml-1"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>

                    <div className="flex-1 items-center h-full min-w-0">
                        {isEditing ? (
                            <Input
                                ref={titleRef}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSave}
                                className="h-7 text-sm font-medium"
                            />
                        ) : (
                            <h3
                                className={cn(
                                    "text-sm itmes-center font-medium leading-tight cursor-text",
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
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="w-4 h-4" />
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
                        className="text-xs resize-none mb-3"
                        rows={2}
                    />
                ) : task.description ? (
                    <p
                        className="text-xs text-muted-foreground mb-3 line-clamp-2 cursor-text"
                        onClick={() => setIsEditing(true)}
                    >
                        {task.description}
                    </p>
                ) : null}

                {/* Meta Info */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Select
                        value={task.priority}
                        onValueChange={handlePriorityChange}
                    >
                        <SelectTrigger className="h-0 dark:bg-transparent dark:hover:bg-transparent w-auto border-0 p-0 focus:ring-0">
                            <Badge
                                variant={task.priority as any}
                                className="cursor-pointer"
                            >
                                {priorityLabels[task.priority]}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={task.status}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="h-6 w-fit dark:bg-transparent dark:hover:bg-transparent border-0 p-0 focus:ring-0">
                            <Badge
                                variant={task.status as any}
                                className="cursor-pointer"
                            >
                                {statusLabels[task.status]}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                                In Progress
                            </SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>

                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
