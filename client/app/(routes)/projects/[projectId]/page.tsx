"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Project, ProjectMember, Task, MemberRole } from "@/service/app.interface";
import { apiRoutes } from "@/service/app.api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    UserPlus,
    Loader2,
    ArrowLeft,
    Crown,
    User,
    Trash2,
    CheckCircle2,
    Clock,
    Circle,
} from "lucide-react";
import Link from "next/link";
import { TaskDialog } from "@/components/tasks/TaskDialog";

const STATUS_ICONS: Record<string, React.ElementType> = {
    DONE: CheckCircle2,
    IN_PROGRESS: Clock,
    TODO: Circle,
};
const STATUS_COLORS: Record<string, string> = {
    DONE: "text-green-500",
    IN_PROGRESS: "text-amber-500",
    TODO: "text-muted-foreground",
};
const PRIORITY_COLORS: Record<string, string> = {
    HIGH: "bg-red-500/15 text-red-500",
    MEDIUM: "bg-amber-500/15 text-amber-500",
    LOW: "bg-muted text-muted-foreground",
};

export default function ProjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;
    const { user, loading: authLoading, logout } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState<MemberRole>("MEMBER");
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [memberError, setMemberError] = useState<string | null>(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push("/home");
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && projectId) {
            loadProject();
            loadTasks();
        }
    }, [user, projectId]);

    const loadProject = async () => {
        try {
            const data = await apiRoutes.project.getProject(projectId);
            setProject(data);
        } catch (err: any) {
            if (err.message?.includes("403") || err.message?.includes("not a member")) {
                router.push("/projects");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        try {
            const data = await apiRoutes.task.getTasks({ projectId } as any);
            setTasks(data);
        } catch (err) {
            console.error("Failed to load tasks:", err);
        }
    };

    const myMembership = project?.members.find((m) => m.userId === user?.id);
    const isAdmin = myMembership?.role === "ADMIN";

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberEmail.trim()) return;
        setIsAddingMember(true);
        setMemberError(null);
        try {
            const newMember = await apiRoutes.project.addMember(projectId, memberEmail.trim(), memberRole);
            setProject((prev) =>
                prev ? { ...prev, members: [...prev.members, newMember] } : prev
            );
            setIsAddMemberOpen(false);
            setMemberEmail("");
            setMemberRole("MEMBER");
        } catch (err: any) {
            setMemberError(err.message || "Failed to add member");
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (member: ProjectMember) => {
        if (!confirm(`Remove ${member.user.name || member.user.email} from this project?`)) return;
        try {
            await apiRoutes.project.removeMember(projectId, member.userId);
            setProject((prev) =>
                prev ? { ...prev, members: prev.members.filter((m) => m.userId !== member.userId) } : prev
            );
        } catch (err: any) {
            alert(err.message || "Failed to remove member");
        }
    };

    const handleChangeRole = async (member: ProjectMember, newRole: MemberRole) => {
        try {
            const updated = await apiRoutes.project.updateMemberRole(projectId, member.userId, newRole);
            setProject((prev) =>
                prev
                    ? {
                          ...prev,
                          members: prev.members.map((m) =>
                              m.userId === member.userId ? { ...m, role: updated.role } : m
                          ),
                      }
                    : prev
            );
        } catch (err: any) {
            alert(err.message || "Failed to update role");
        }
    };

    const handleAddTask = async (taskData: any) => {
        try {
            const newTask = await apiRoutes.task.createTask({
                ...taskData,
                projectId,
            });
            setTasks((prev) => [newTask, ...prev]);
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !project) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            <Header user={user} onLogout={logout} />

            <main className="container px-4 md:px-6 py-8 w-full">
                {/* Breadcrumb */}
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All projects
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{project.name}</h1>
                        {project.description && (
                            <p className="text-muted-foreground">{project.description}</p>
                        )}
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsCreateTaskOpen(true)} className="gap-2">
                            + Add Task
                        </Button>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Tasks column */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setIsCreateTaskOpen(true)}
                            >
                                + New task
                            </Button>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                                <p className="text-muted-foreground text-sm">No tasks yet in this project.</p>
                                <Button size="sm" className="mt-4" onClick={() => setIsCreateTaskOpen(true)}>
                                    Create first task
                                </Button>
                            </div>
                        ) : (
                            tasks.map((task) => {
                                const StatusIcon = STATUS_ICONS[task.status] || Circle;
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/30 transition-colors"
                                    >
                                        <StatusIcon
                                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${STATUS_COLORS[task.status]}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}
                                                >
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Due {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {task.assignee && (
                                                    <span className="text-xs text-muted-foreground">
                                                        → {task.assignee.name || task.assignee.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Members sidebar */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Team ({project.members.length})
                            </h2>
                            {isAdmin && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => setIsAddMemberOpen(true)}
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Invite
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {project.members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {member.user.name || member.user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {member.user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {member.role === "ADMIN" ? (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                <Crown className="w-3 h-3" />
                                                Admin
                                            </span>
                                        ) : isAdmin ? (
                                            <Select
                                                value={member.role}
                                                onValueChange={(v) =>
                                                    handleChangeRole(member, v as MemberRole)
                                                }
                                            >
                                                <SelectTrigger className="h-6 text-xs w-24 border-0 bg-secondary">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MEMBER">Member</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Member</span>
                                        )}
                                        {isAdmin && member.userId !== user.id && (
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Member Dialog */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Invite team member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="member-email">Email address *</Label>
                            <Input
                                id="member-email"
                                type="email"
                                placeholder="colleague@company.com"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={memberRole} onValueChange={(v) => setMemberRole(v as MemberRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">Member — can view and create tasks</SelectItem>
                                    <SelectItem value="ADMIN">Admin — full project control</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {memberError && <p className="text-sm text-destructive">{memberError}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isAddingMember || !memberEmail.trim()}>
                                {isAddingMember ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Send invite"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Task Dialog (reuse existing) */}
            <TaskDialog
                open={isCreateTaskOpen}
                onOpenChange={setIsCreateTaskOpen}
                onSubmit={handleAddTask}
                defaultStatus="TODO"
            />
        </div>
    );
}
