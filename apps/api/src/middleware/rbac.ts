import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * Requires the authenticated user to be a member (any role) of the project
 * identified by req.params.projectId. Attaches the membership to req.membership.
 */
export const requireProjectMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user } = req as any;
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({ message: 'projectId param is required' });
    }

    try {
        const membership = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: user.userId } },
        });

        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this project' });
        }

        (req as any).membership = membership;
        next();
    } catch (error) {
        console.error('Error checking project membership:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Requires the authenticated user to be an ADMIN of the project
 * identified by req.params.projectId.
 */
export const requireProjectAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user } = req as any;
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({ message: 'projectId param is required' });
    }

    try {
        const membership = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: user.userId } },
        });

        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required for this action' });
        }

        (req as any).membership = membership;
        next();
    } catch (error) {
        console.error('Error checking project admin role:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
