import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
import { Task, Status } from "@/service/app.interface";
import { TaskCard } from "./TaskCard";
import { StatusIcon } from "./StatusIcon";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: Status;
  title: string;
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddTask: (status: Status) => void;
}

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
    <div
      ref={setNodeRef}
      className={cn(
        "w-[300px] shrink-0 rounded-xl bg-secondary p-2 transition-colors duration-200",
        isOver && "bg-slate/15"
      )}
    >
      <div className="flex items-center justify-between h-8 px-2 mb-2">
        <div className="flex items-center gap-2.5">
          <StatusIcon status={status} className="w-3.5 h-3.5" />
          <h3 className="font-semibold text-xs text-ink">{title}</h3>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            aria-label={`Add task to ${title}`}
            className="p-1 rounded hover:bg-card/70 hover:text-ink transition-colors"
            onClick={() => onAddTask(status)}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <MoreHorizontal className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2 min-h-[120px]">
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
              "flex items-center justify-center h-24 border border-dashed border-border rounded-lg text-muted-foreground text-xs transition-colors",
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
