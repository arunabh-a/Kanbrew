import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectAdmin, requireProjectMember } from '../middleware/rbac.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// ─── Project CRUD ──────────────────────────────────────────────────────────

/**
 * POST /api/projects
 * Create a new project. The creator is automatically added as ADMIN.
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await prisma.project.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                ownerId: user.userId,
                members: {
                    create: { userId: user.userId, role: 'ADMIN' },
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { tasks: true } },
            },
        });

        return res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/projects
 * List all projects the current user is a member of.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;

        const projects = await prisma.project.findMany({
            where: {
                members: { some: { userId: user.userId } },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/projects/:projectId
 * Get details of a single project including members and task count.
 * Requires membership.
 */
router.get('/:projectId', requireAuth, requireProjectMember, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                    orderBy: { joinedAt: 'asc' },
                },
                _count: { select: { tasks: true } },
            },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PUT /api/projects/:projectId
 * Update project name or description.
 * Requires ADMIN role.
 */
router.put('/:projectId', requireAuth, requireProjectAdmin, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: {
                name: name.trim(),
                description: description?.trim() ?? undefined,
            },
            include: {
                _count: { select: { tasks: true } },
            },
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * DELETE /api/projects/:projectId
 * Delete a project (cascades to tasks and members).
 * Requires ADMIN role.
 */
router.delete('/:projectId', requireAuth, requireProjectAdmin, async (req, res) => {
    try {
        const { projectId } = req.params;

        await prisma.project.delete({ where: { id: projectId } });

        return res.status(200).json({ message: 'Project deleted successfully', id: projectId });
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Member Management ─────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/members
 * List all members of the project with their roles.
 * Requires membership.
 */
router.get('/:projectId/members', requireAuth, requireProjectMember, async (req, res) => {
    try {
        const { projectId } = req.params;

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { joinedAt: 'asc' },
        });

        return res.status(200).json(members);
    } catch (error) {
        console.error('Error fetching project members:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/projects/:projectId/members
 * Add a user to the project by email. Defaults to MEMBER role.
 * Requires ADMIN role.
 *
 * Body: { email: string, role?: 'ADMIN' | 'MEMBER' }
 */
router.post('/:projectId/members', requireAuth, requireProjectAdmin, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { email, role = 'MEMBER' } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: 'Role must be ADMIN or MEMBER' });
        }

        const targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!targetUser) {
            return res.status(404).json({ message: `No user found with email: ${email}` });
        }

        const member = await prisma.projectMember.upsert({
            where: { projectId_userId: { projectId, userId: targetUser.id } },
            update: { role },
            create: { projectId, userId: targetUser.id, role },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return res.status(201).json(member);
    } catch (error) {
        console.error('Error adding project member:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PUT /api/projects/:projectId/members/:userId
 * Change a member's role in the project.
 * Requires ADMIN role. Cannot demote yourself if you're the only admin.
 *
 * Body: { role: 'ADMIN' | 'MEMBER' }
 */
router.put('/:projectId/members/:userId', requireAuth, requireProjectAdmin, async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;
        const { user } = req as any;

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: 'Role must be ADMIN or MEMBER' });
        }

        // Prevent sole admin from demoting themselves
        if (userId === user.userId && role === 'MEMBER') {
            const adminCount = await prisma.projectMember.count({
                where: { projectId, role: 'ADMIN' },
            });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot demote yourself — you are the only admin' });
            }
        }

        const membership = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!membership) {
            return res.status(404).json({ message: 'Member not found in this project' });
        }

        const updated = await prisma.projectMember.update({
            where: { projectId_userId: { projectId, userId } },
            data: { role },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating member role:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * DELETE /api/projects/:projectId/members/:userId
 * Remove a member from the project.
 * Requires ADMIN role. Cannot remove the last admin.
 */
router.delete('/:projectId/members/:userId', requireAuth, requireProjectAdmin, async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const membership = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!membership) {
            return res.status(404).json({ message: 'Member not found in this project' });
        }

        // Prevent removing the last admin
        if (membership.role === 'ADMIN') {
            const adminCount = await prisma.projectMember.count({
                where: { projectId, role: 'ADMIN' },
            });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot remove the last admin from the project' });
            }
        }

        await prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId } },
        });

        return res.status(200).json({ message: 'Member removed successfully', userId });
    } catch (error) {
        console.error('Error removing project member:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
