import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Shared condition: tasks visible to the current user (created by or assigned to)
const userTaskCondition = (userId: string) => ({
    OR: [
        { userId },
        { assigneeId: userId },
    ],
});

/**
 * GET /api/dashboard/summary
 * Returns task counts grouped by status and overdue tasks count.
 *
 * Response:
 * {
 *   summary: { TODO: number, IN_PROGRESS: number, DONE: number },
 *   overdue: number,
 *   total: number
 * }
 */
router.get('/summary', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const now = new Date();
        const baseCondition = userTaskCondition(user.userId);

        const [todo, inProgress, done, overdue] = await Promise.all([
            prisma.task.count({
                where: { ...baseCondition, status: 'TODO' },
            }),
            prisma.task.count({
                where: { ...baseCondition, status: 'IN_PROGRESS' },
            }),
            prisma.task.count({
                where: { ...baseCondition, status: 'DONE' },
            }),
            prisma.task.count({
                where: {
                    ...baseCondition,
                    dueDate: { lt: now },
                    status: { not: 'DONE' },
                },
            }),
        ]);

        return res.status(200).json({
            summary: {
                TODO: todo,
                IN_PROGRESS: inProgress,
                DONE: done,
            },
            overdue,
            total: todo + inProgress + done,
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/dashboard/assigned
 * Returns all tasks explicitly assigned to the current user (across all projects).
 */
router.get('/assigned', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;

        const tasks = await prisma.task.findMany({
            where: { assigneeId: user.userId },
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
            include: {
                project: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching assigned tasks:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/dashboard/overdue
 * Returns all non-done tasks past their due date for the current user.
 */
router.get('/overdue', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const now = new Date();

        const tasks = await prisma.task.findMany({
            where: {
                ...userTaskCondition(user.userId),
                dueDate: { lt: now },
                status: { not: 'DONE' },
            },
            orderBy: { dueDate: 'asc' },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, email: true } },
            },
        });

        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
