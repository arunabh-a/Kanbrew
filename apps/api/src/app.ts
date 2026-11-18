import { Hono } from 'hono';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import dashboardRoutes from './routes/dashboard.js';


const routes = new Hono();

routes.route('/api/auth', authRoutes);
routes.route('/api/users', userRoutes);
routes.route('/api/tasks', taskRoutes);
routes.route('/api/projects', projectRoutes);
routes.route('/api/dashboard', dashboardRoutes);

export default routes
