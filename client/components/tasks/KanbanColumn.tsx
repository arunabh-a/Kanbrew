import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Task, Status } from "@/service/app.interface";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: Status;
  title: string;
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddTask: (status: Status) => void;
}

const statusColors: Record<Status, string> = {
  TODO: "bg-status-todo",
  IN_PROGRESS: "bg-slate",
  DONE: "bg-moss",
};

const statusBadgeStyles: Record<Status, string> = {
  TODO: "bg-secondary text-muted-foreground border-border",
  IN_PROGRESS: "bg-slate/15 text-slate border-slate/30",
  DONE: "bg-moss/15 text-moss border-moss/30",
};

export function KanbanColumn({
  status,
  title,
  tasks,
  onUpdate,
  onDelete,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-[280px] max-w-[360px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[status])} />
          <h3 className="font-semibold text-sm text-ink">{title}</h3>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              statusBadgeStyles[status]
            )}
          >
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-ink"
          onClick={() => onAddTask(status)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "space-y-3 min-h-[240px] p-3 rounded-2xl bg-secondary/45 border border-border/70 transition-colors duration-200",
          isOver && "bg-slate/10 border-slate/40"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center h-32 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm transition-colors",
              isOver && "border-slate bg-slate/10 text-slate"
            )}
          >
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
