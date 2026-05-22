import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /user - Get user by query id (restricted to own profile)
router.get('/user', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const userId = req.query.userId as string;
        if (!userId) {
            return res.status(400).json({ message: "userId query parameter is required" });
        }
        // Prevent IDOR: users may only fetch their own record via this endpoint
        if (userId !== user.userId) {
            return res.status(403).json({ message: "Forbidden: you may only access your own profile" });
        }
        const foundUser = await prisma.user.findUnique({
            where: { id: userId },
            // select: { id: true, email: true, name: true, bio: true, createdAt: true, updatedAt: true, emailVerified: true }
        });
        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(foundUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /me - Get current user's profile
router.get('/me', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const me = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { 
                id: true, 
                email: true, 
                name: true, 
                bio: true, 
                emailVerified: true, 
                createdAt: true, 
                updatedAt: true, 
                lastLoginAt: true 
            }
        });
        if (!me) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(me);
    } catch (error) {
        console.error('Error fetching current user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /me - Update current user's profile
router.put('/me', requireAuth, async (req, res) => {
    try {
        const { user } = req as any;
        const { name, bio } = req.body;

        // Basic input validation
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
            return res.status(400).json({ message: "Name must be a non-empty string of at most 100 characters" });
        }
        if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
            return res.status(400).json({ message: "Bio must be a string of at most 500 characters" });
        }
        
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { 
                name: name !== undefined ? name.trim() : undefined, 
                bio: bio !== undefined ? bio : undefined 
            },
            select: { 
                id: true, 
                email: true, 
                name: true, 
                bio: true, 
                emailVerified: true, 
                createdAt: true, 
                updatedAt: true, 
                lastLoginAt: true 
            }
        });
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;