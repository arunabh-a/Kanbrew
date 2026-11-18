import { Task } from "@/service/app.interface";
import { TaskCard } from "./TaskCard";

interface TaskListViewProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskListView({ tasks, onUpdate, onDelete }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">No tasks found</h3>
        <p className="text-muted-foreground text-sm">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
