import { Router } from "express";
import { hashPassword, verifyPassword } from "../utils/passwordHash.js";
import { signAccessToken } from "../utils/jwt.js";
import { generateVerificationToken, sendVerificationEmail } from "../utils/emailService.js";
import * as crypto from "crypto";
import { prisma } from "../lib/prisma.js";

const router = Router();
// POST /auth/register - Register a new user
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ message: "Email, password, and name are required" });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            // If the user already exists but hasn't verified their email, regenerate
            // the verification token and resend the email instead of returning an error.
            if (!existing.emailVerified) {
                const newVerificationToken = generateVerificationToken();
                if (!newVerificationToken) {
                    throw new Error('Failed to generate verification token');
                }

                await prisma.user.update({
                    where: { email },
                    data: { emailVerificationToken: newVerificationToken },
                });

                try {
                    const emailResult = await sendVerificationEmail(email, existing.name || name, newVerificationToken);
                    if ('fallback' in emailResult && emailResult.fallback) {
                        console.warn('Email service unavailable, using fallback method');
                        console.log(`Verification URL for ${email}: ${emailResult.verificationUrl}`);
                    } else {
                        console.log('Verification email resent successfully:', emailResult.messageId);
                    }
                } catch (error) {
                    console.error('Error resending verification email:', error);
                }

                return res.status(200).json({
                    message: "A new verification email has been sent. Please check your inbox to verify your account.",
                    user: {
                        id: existing.id,
                        email: existing.email,
                        name: existing.name,
                        emailVerified: existing.emailVerified,
                    }
                });
            }

            // User is already verified — let them know without leaking details
            return res.status(409).json({ message: "An account with this email already exists. Please log in." });
        }
        
        const hashedPassword = await hashPassword(password);
        const verificationToken = generateVerificationToken();
        
        if (!verificationToken) {
            throw new Error('Failed to generate verification token');
        }

        
        const newUser = await prisma.user.create({
            data: { 
                email, 
                hashedPassword, 
                name: name?.trim() || null,
                emailVerificationToken: verificationToken 
            },
        });

        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(email, name, verificationToken);
            
            if ('fallback' in emailResult && emailResult.fallback) {
                console.warn('Email service unavailable, using fallback method');
                console.log(`Verification URL for ${email}: ${emailResult.verificationUrl}`);
            } else {
                console.log('Verification email sent successfully:', emailResult.messageId);
            }
        } catch (error) {
            console.error('Error sending verification email:', error);
            console.error('Failed to send verification email, but user was created');
        }

        // Don't generate tokens immediately - user needs to verify email first
        res.status(201).json({ 
            message: "Registration successful! Please check your email to verify your account before logging in.",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                emailVerified: newUser.emailVerified,
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// POST /auth/login - Authenticate a user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Guard: user may have registered via OAuth and has no password set
        if (!user.hashedPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await verifyPassword(user.hashedPassword, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({ 
                message: "Please verify your email address before logging in. Check your email for the verification link.",
                emailVerified: false
            });
        }

        const accessToken = signAccessToken(user.id, 'user'); // Default role since removed from schema
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const refreshExpDays = parseInt(process.env.REFRESH_TOKEN_EXP_DAYS || '30');
        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + (refreshExpDays * 24 * 60 * 60 * 1000)),
                ip: (req.ip || undefined),
                userAgent: (req.headers['user-agent'] || undefined) as string | undefined,
            }
        });

        // Set both access and refresh tokens as httpOnly cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: refreshExpDays * 24 * 60 * 60 * 1000,
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        return res.status(200).json({ 
            accessToken, // Still return for compatibility
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: new Date(),
            }
        });

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// POST /auth/refresh - Rotate refresh token and issue new access token
router.post('/refresh', async (req, res) => {
    try {
        const rt = (req as any).cookies?.refreshToken as string | undefined;
        if (!rt) {
            return res.status(401).json({ message: 'No refresh token' });
        }

        const tokenHash = crypto.createHash('sha256').update(rt).digest('hex');
        const existing = await prisma.refreshToken.findFirst({
            where: { tokenHash, revoked: false },
            include: { user: true },
        });

        if (!existing || !existing.user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (existing.expiresAt.getTime() <= Date.now()) {
            // Expired: revoke and reject
            await prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        // Rotate: revoke old, create new
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        const expDays = parseInt(process.env.REFRESH_TOKEN_EXP_DAYS || '7');

        const result = await prisma.refreshToken.updateMany({
            where: { id: existing.id, tokenHash, revoked: false },
            data: {
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + expDays * 24 * 60 * 60 * 1000),
            ip: (req.ip || undefined),
            userAgent: (req.headers['user-agent'] || undefined) as string | undefined,
            }
        });

        if (result.count === 0) {
            return res.status(401).json({ message: 'Invalid or already rotated refresh token' });
        }

        // Issue new access token
        const accessToken = signAccessToken(existing.user.id, 'user'); // Default role

        // Set both access and refresh token cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: expDays * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /auth/verify - Email verification route
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ 
                message: 'Verification token is required',
                success: false 
            });
        }

        // Find user by verification token
        const user = await prisma.user.findFirst({
            where: { 
                emailVerificationToken: token,
                emailVerified: false 
            }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired verification token',
                success: false 
            });
        }

        // Enforce 24-hour token expiry (token was set at user creation / resend time)
        // We compare against the user's updatedAt timestamp as the token issue time.
        const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
        const tokenIssuedAt = user.updatedAt.getTime();
        if (Date.now() - tokenIssuedAt > TOKEN_EXPIRY_MS) {
            return res.status(400).json({
                message: 'Verification token has expired. Please request a new one.',
                success: false,
                tokenExpired: true,
            });
        }

        // Update user as verified and clear verification token
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                emailVerified: true,
                emailVerificationToken: null 
            }
        });

        // Check if this is an API call or direct browser access
        const acceptHeader = req.headers.accept || '';
        const isApiRequest = acceptHeader.includes('application/json');

        if (isApiRequest) {
            // Return JSON response for API calls
            return res.status(200).json({ 
                message: 'Email verified successfully! You can now log in.',
                success: true 
            });
        } else {
            // Redirect to frontend verification success page for direct browser access
            return res.redirect(`${process.env.CLIENT_URL}/verify-email?success=true`);
        }
        
    } catch (error) {
        console.error('Error verifying email:', error);
        
        // Check if this is an API call or direct browser access
        const acceptHeader = req.headers.accept || '';
        const isApiRequest = acceptHeader.includes('application/json');

        if (isApiRequest) {
            // Return JSON error response for API calls
            return res.status(400).json({ 
                message: 'Email verification failed. The token may be invalid or expired.',
                success: false 
            });
        } else {
            // Redirect to frontend with error for direct browser access
            return res.redirect(`${process.env.CLIENT_URL}/verify-email?success=false`);
        }
    }
});

// Logout 
router.post('/logout', async (req, res) => {
    try {
        const rt = (req as any).cookies?.refreshToken as string | undefined;
        if (rt) {
            const tokenHash = crypto.createHash('sha256').update(rt).digest('hex');
            await prisma.refreshToken.updateMany({
                where: { tokenHash, revoked: false },
                data: { revoked: true }
            });
        }
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;