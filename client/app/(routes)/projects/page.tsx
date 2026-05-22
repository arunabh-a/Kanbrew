"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/service/app.interface";
import { apiRoutes } from "@/service/app.api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FolderKanban, Plus, Users, CheckSquare, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/home");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) loadProjects();
    }, [user]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await apiRoutes.project.getProjects();
            setProjects(data);
        } catch (err) {
            console.error("Failed to load projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        setIsCreating(true);
        setError(null);
        try {
            const newProject = await apiRoutes.project.createProject({
                name: projectName.trim(),
                description: projectDesc.trim() || undefined,
            });
            setProjects((prev) => [newProject, ...prev]);
            setIsDialogOpen(false);
            setProjectName("");
            setProjectDesc("");
        } catch (err: any) {
            setError(err.message || "Failed to create project");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this project? This cannot be undone.")) return;
        try {
            await apiRoutes.project.deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (err: any) {
            alert(err.message || "Failed to delete project");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">

            <main className="container px-4 md:px-6 py-8 w-full">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Projects</h1>
                        <p className="text-muted-foreground">Manage your teams and projects</p>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Project
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                            <FolderKanban className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Create a project to start collaborating with your team on tasks.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create your first project
                        </Button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => {
                            const myMembership = project.members.find((m) => m.userId === user.id);
                            const isAdmin = myMembership?.role === "ADMIN";
                            return (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="group relative block p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <FolderKanban className="w-5 h-5 text-primary" />
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDeleteProject(project.id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                                title="Delete project"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-base mb-1 truncate">{project.name}</h3>
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {project.members.length} {project.members.length === 1 ? "member" : "members"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckSquare className="w-3.5 h-3.5" />
                                            {project._count?.tasks ?? 0} tasks
                                        </span>
                                        {isAdmin && (
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Create Project Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Create new project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project name *</Label>
                            <Input
                                id="project-name"
                                placeholder="e.g. Mobile App Redesign"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-desc">Description</Label>
                            <Textarea
                                id="project-desc"
                                placeholder="What is this project about?"
                                value={projectDesc}
                                onChange={(e) => setProjectDesc(e.target.value)}
                                rows={3}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating || !projectName.trim()}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create project"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
