import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize dotenv before any other imports that might use env vars
dotenv.config();

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import dashboardRoutes from './routes/dashboard.js';
import cookieParser from 'cookie-parser'; 
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();
app.use(cors({
    origin: (process.env.CORS_CLIENT_URL || 'http://localhost:3000').split(',').map(o => o.trim()),
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // used to parse cookies from the request headers


app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

// Health check endpoint for keeping the server alive
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);
