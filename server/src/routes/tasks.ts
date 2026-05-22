import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { Priority, TaskStatus } from "../generated/prisma/enums.js";

const router = Router();

// GET /api/tasks — Get all tasks (created by or assigned to current user)
// Optional query params: status, priority, search, projectId
router.get('/', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const { status, search, priority, projectId } = req.query;

        // Base condition: tasks created by or assigned to the user
        const userCondition: any = {
            OR: [
                { userId: user.userId },
                { assigneeId: user.userId },
            ],
        };

        // Optional project scope
        if (projectId && typeof projectId === 'string') {
            userCondition.projectId = projectId;
        }

        // Filter by status if provided
        if (status && typeof status === 'string') {
            userCondition.status = status as TaskStatus;
        }

        // Filter by priority if provided
        if (priority && typeof priority === 'string') {
            userCondition.priority = priority as Priority;
        }

        // Search by title or description if provided
        if (search && typeof search === 'string') {
            userCondition.AND = [
                {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                },
            ];
        }

        const tasks = await prisma.task.findMany({
            where: userCondition,
            orderBy: { createdAt: 'desc' },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });
        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/tasks — Create a new task
router.post('/', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const { title, description, dueDate, priority, status, projectId, assigneeId } = req.body;

        // Validate required field
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Validate priority if provided
        if (priority && !Object.values(Priority).includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority value. Must be LOW, MEDIUM, or HIGH' });
        }

        // Validate status if provided
        if (status && !Object.values(TaskStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status value. Must be TODO, IN_PROGRESS, or DONE' });
        }

        // If projectId provided, verify user is a member of that project
        if (projectId) {
            const membership = await prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId, userId: user.userId } },
            });
            if (!membership) {
                return res.status(403).json({ message: 'You are not a member of this project' });
            }
        }

        const newTask = await prisma.task.create({
            data: {
                userId: user.userId,
                title: title.trim(),
                description: description?.trim() || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || Priority.LOW,
                status: status || TaskStatus.TODO,
                projectId: projectId || null,
                assigneeId: assigneeId || null,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });
        return res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/tasks/:id — Update an existing task
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const taskId = req.params.id;
        const { title, description, dueDate, priority, status, assigneeId } = req.body;

        // Find the task
        const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization: must be creator, assignee, or a project admin
        const isCreator = existingTask.userId === user.userId;
        const isAssignee = existingTask.assigneeId === user.userId;

        let isProjectAdmin = false;
        if (existingTask.projectId) {
            const membership = await prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId: existingTask.projectId, userId: user.userId } },
            });
            isProjectAdmin = membership?.role === 'ADMIN';
        }

        if (!isCreator && !isAssignee && !isProjectAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        // Validate priority if provided
        if (priority && !Object.values(Priority).includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority value. Must be LOW, MEDIUM, or HIGH' });
        }

        // Validate status if provided
        if (status && !Object.values(TaskStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status value. Must be TODO, IN_PROGRESS, or DONE' });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        // Only project admin or creator can reassign
        if (assigneeId !== undefined && (isCreator || isProjectAdmin)) {
            updateData.assigneeId = assigneeId || null;
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });

        return res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const taskId = req.params.id;

        const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization: must be creator or a project admin
        const isCreator = existingTask.userId === user.userId;
        let isProjectAdmin = false;
        if (existingTask.projectId) {
            const membership = await prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId: existingTask.projectId, userId: user.userId } },
            });
            isProjectAdmin = membership?.role === 'ADMIN';
        }

        if (!isCreator && !isProjectAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        await prisma.task.delete({ where: { id: taskId } });

        return res.status(200).json({ message: 'Task deleted successfully', id: taskId });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;