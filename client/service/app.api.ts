import { Task, Priority, TaskStatus, User, Project, ProjectMember, DashboardSummary, MemberRole } from "./app.interface";
import { authFetch, handleAutoLogout } from "@/lib/interceptor";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;



// ============================================
// Authentication Routes
// ============================================

export const authApi = {
    /**
     * Register a new user
     */
    register: async (data: {
        email: string;
        password: string;
        name?: string;
    }): Promise<{
        message: string;
        user: { id: string; email: string; name: string | null; emailVerified: boolean };
    }> => {
        return authFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Verify user email — server expects GET /auth/verify?token=...
     */
    verifyEmail: async (token: string): Promise<{ message: string; success: boolean }> => {
        return authFetch(`/auth/verify?token=${encodeURIComponent(token)}`, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
    },

    /**
     * Login user.
     * The server sets httpOnly cookies (accessToken, refreshToken) directly —
     * we must NOT write them from JS. We just return the response body.
     */
    login: async (data: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: User;
    }> => {
        return authFetch("/auth/login", {
            method: "POST",
            credentials: "include", // send/receive httpOnly cookies
            body: JSON.stringify(data),
        });
    },

    /**
     * Refresh access token.
     * The server reads the refreshToken from its httpOnly cookie — no body needed.
     * New httpOnly cookies are set by the server in the response.
     */
    refreshToken: async (): Promise<{ accessToken: string }> => {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include", // send httpOnly refreshToken cookie
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        return response.json();
    },

    /**
     * Logout user.
     * The server reads the refreshToken from its httpOnly cookie and revokes it.
     * The server also clears the httpOnly cookies in the response.
     */
    logout: async (): Promise<{ message: string }> => {
        try {
            return await authFetch("/auth/logout", {
                method: "POST",
                credentials: "include", // send httpOnly cookies so server can revoke
            });
        } catch (error) {
            console.error("Logout API call failed:", error);
            return { message: "Logged out" };
        }
    },
};

// ============================================
// User Routes
// ============================================

export const userApi = {
    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        return authFetch("/users/me", {
            method: "GET",
        });
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: {
        name?: string;
        bio?: string;
    }): Promise<User> => {
        return authFetch("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
};

// ============================================
// Task Routes
// ============================================

export const taskApi = {
    /**
     * Get all tasks with optional filters
     */
    getTasks: async (filters?: {
        status?: TaskStatus;
        priority?: Priority;
        search?: string;
    }): Promise<Task[]> => {
        const params = new URLSearchParams();

        if (filters?.status) params.append("status", filters.status);
        if (filters?.priority) params.append("priority", filters.priority);
        if (filters?.search) params.append("search", filters.search);

        const queryString = params.toString();
        const endpoint = queryString ? `/tasks?${queryString}` : "/tasks";

        return authFetch(endpoint, {
            method: "GET",
        });
    },

    /**
     * Create a new task
     */
    createTask: async (data: {
        title: string;
        description?: string;
        dueDate?: string;
        priority?: Priority;
        status?: TaskStatus;
    }): Promise<Task> => {
        return authFetch("/tasks", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update an existing task
     */
    updateTask: async (
        taskId: string,
        data: {
            title?: string;
            description?: string;
            dueDate?: string;
            priority?: Priority;
            status?: TaskStatus;
        }
    ): Promise<Task> => {
        return authFetch(`/tasks/${taskId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a task
     */
    deleteTask: async (taskId: string): Promise<{ message: string }> => {
        return authFetch(`/tasks/${taskId}`, {
            method: "DELETE",
        });
    },
};

// ============================================
// Project Routes
// ============================================

export const projectApi = {
    /** List all projects the current user is a member of */
    getProjects: (): Promise<Project[]> =>
        authFetch("/projects", { method: "GET" }),

    /** Create a new project */
    createProject: (data: { name: string; description?: string }): Promise<Project> =>
        authFetch("/projects", { method: "POST", body: JSON.stringify(data) }),

    /** Get single project details */
    getProject: (projectId: string): Promise<Project> =>
        authFetch(`/projects/${projectId}`, { method: "GET" }),

    /** Update project name or description */
    updateProject: (projectId: string, data: { name: string; description?: string }): Promise<Project> =>
        authFetch(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(data) }),

    /** Delete a project */
    deleteProject: (projectId: string): Promise<{ message: string }> =>
        authFetch(`/projects/${projectId}`, { method: "DELETE" }),

    /** List all members of a project */
    getMembers: (projectId: string): Promise<ProjectMember[]> =>
        authFetch(`/projects/${projectId}/members`, { method: "GET" }),

    /** Add a user by email to a project */
    addMember: (projectId: string, email: string, role: MemberRole = "MEMBER"): Promise<ProjectMember> =>
        authFetch(`/projects/${projectId}/members`, {
            method: "POST",
            body: JSON.stringify({ email, role }),
        }),

    /** Change a member's role */
    updateMemberRole: (projectId: string, userId: string, role: MemberRole): Promise<ProjectMember> =>
        authFetch(`/projects/${projectId}/members/${userId}`, {
            method: "PUT",
            body: JSON.stringify({ role }),
        }),

    /** Remove a member from a project */
    removeMember: (projectId: string, userId: string): Promise<{ message: string }> =>
        authFetch(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),
};

// ============================================
// Dashboard Routes
// ============================================

export const dashboardApi = {
    /** Get task counts grouped by status + overdue count */
    getSummary: (): Promise<DashboardSummary> =>
        authFetch("/dashboard/summary", { method: "GET" }),

    /** Get tasks assigned to the current user */
    getAssigned: (): Promise<Task[]> =>
        authFetch("/dashboard/assigned", { method: "GET" }),

    /** Get all overdue tasks for the current user */
    getOverdue: (): Promise<Task[]> =>
        authFetch("/dashboard/overdue", { method: "GET" }),
};

// ============================================
// Combined API Routes Export
// ============================================

export const apiRoutes = {
    auth: authApi,
    user: userApi,
    task: taskApi,
    project: projectApi,
    dashboard: dashboardApi,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a session likely exists by attempting to reach the profile endpoint.
 * Since auth is fully cookie-based (httpOnly), we cannot read tokens from JS.
 * Use useAuth().isAuthenticated (derived from whether user state is populated) instead.
 * @deprecated Use the isAuthenticated value from useAuth() hook.
 */
export const isAuthenticated = (): boolean => {
    // Cannot inspect httpOnly cookies from JS.
    // Return true optimistically — authFetch will trigger a refresh or logout if the session is gone.
    // The real source of truth is the User object in useAuth().
    return true;
};

/**
 * Manual logout helper (clears cookies server-side and redirects)
 */
export const manualLogout = () => {
    handleAutoLogout('Manual logout');
};
