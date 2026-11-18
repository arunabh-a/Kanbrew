import { TaskStatus } from "@/service/app.interface";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status: TaskStatus;
  className?: string;
}

/** Small circular status glyph: dashed (to do), half-filled (in progress), filled check (done). */
export function StatusIcon({ status, className }: StatusIconProps) {
  const base = cn("shrink-0", className);

  if (status === "DONE") {
    return (
      <svg viewBox="0 0 16 16" className={cn(base, "text-moss")} fill="none">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M5 8.2l2 2L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <svg viewBox="0 0 16 16" className={cn(base, "text-ochre")} fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4a4 4 0 010 8z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className={cn(base, "text-muted-foreground")} fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 2.2" />
    </svg>
  );
}
