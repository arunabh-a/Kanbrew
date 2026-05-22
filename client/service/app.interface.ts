// ─── Enums (mirror Prisma schema) ────────────────────────────────────────────

export type Priority   = "LOW" | "MEDIUM" | "HIGH";
/** @deprecated Use TaskStatus — renamed to match Prisma enum */
export type Status     = TaskStatus;
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type MemberRole = "ADMIN" | "MEMBER";

// ─── Lightweight projections (used in relation includes) ──────────────────────

export interface UserBrief {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

// ─── User (full model) ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  // Relations (only present when explicitly included by the API)
  tasks?: Task[];
  assignedTasks?: Task[];
  ownedProjects?: Project[];
  memberships?: ProjectMember[];
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  // Creator
  userId: string;
  user?: UserBrief | null;
  // Assignee
  assigneeId: string | null;
  assignee?: UserBrief | null;
  // Project
  projectId: string | null;
  project?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

// ─── ProjectMember ────────────────────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: UserBrief;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner?: UserBrief | null;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  summary: { TODO: number; IN_PROGRESS: number; DONE: number };
  overdue: number;
  total: number;
}
