<div align="center">
  <img alt="Kanbrew Logo" src="client/public/kanbrew.png" width="120" />
  <h1>Kanbrew (previously TaskBrew)</h1>
  <p>A modern, full-stack task management application with drag-and-drop Kanban boards,<br/>built with Next.js, Express, and Prisma.</p>
</div>

## ✨ Features

- 🔐 **Authentication & Authorization** (Powered by [AuthER](https://github.com/arunabh-a/AuthER))
  - Secure JWT access tokens + httpOnly refresh cookies
  - User registration & login with complete validation
  - Automatic token rotation for enhanced security
  - Email verification system
  - Protected routes and API endpoints
  - Token refresh mechanism with automatic rotation
  - Password hashing with Argon2
  
- 📋 **Task Management**
  - Create, edit, and delete tasks
  - Drag-and-drop Kanban board interface
  - Task prioritization (Low, Medium, High)
  - Task status tracking (Todo, In Progress, Done)
  - Due date management

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: TanStack Query (React Query)
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Custom [AuthER](https://github.com/arunabh-a/AuthER) service
  - JWT access tokens (15-minute expiry)
  - HttpOnly refresh cookies (30-day expiry with rotation)
  - Argon2 password hashing
  - Token refresh mechanism
- **Email Service**: Nodemailer

### Deployment
- **Server**: AWS EC2
- **Reverse Proxy**: Nginx
- **Process Manager**: systemd
- **Database**: PostgreSQL on AWS

## 📁 Project Structure

```
Task-Brew/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   │   ├── home/         # Home page (authenticated)
│   │   ├── login/        # Login page
│   │   └── sign-up/      # Sign-up page
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   ├── tasks/        # Task management components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and constants
│   └── service/          # API service layer
│
└── server/                # Express backend application
    ├── prisma/           # Prisma schema and migrations
    ├── src/
    │   ├── generated/    # Prisma generated client
    │   ├── lib/          # Database connection
    │   ├── middleware/   # Express middleware
    │   ├── routes/       # API routes
    │   └── utils/        # Utility functions
    └── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arunabh-a/Task-Brew.git
   cd Task-Brew
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/kanbrew"
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   CORS_CLIENT_URL="http://localhost:3000"
   
   # Email configuration (optional)
   EMAIL_HOST="smtp.example.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@example.com"
   EMAIL_PASSWORD="your-password"
   EMAIL_FROM="Task-Brew <noreply@kanbrew.com>"
   ```

4. **Run database migrations**
   ```bash
   npm run migrate:dev
   ```

5. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

6. **Configure frontend environment**
   
   Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT tokens
- `POST /api/auth/logout` - Logout and revoke refresh token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email address

### User Endpoints

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### Task Endpoints

- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

For detailed API documentation, import the Postman collection available at:
`server/kanbrew-API.postman_collection.json`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User**: Stores user account information and profile data
- **RefreshToken**: Manages JWT refresh tokens for authentication
- **Task**: Stores task data with status, priority, and due dates

See [server/prisma/schema.prisma](server/prisma/schema.prisma) for the complete schema.

## 🔒 Security Features

The application implements robust security measures powered by **[AuthER](https://github.com/arunabh-a/AuthER)**, a custom authentication service:

### Authentication Security
- **Token Rotation**: Refresh tokens rotated on each use
- **Secure Flags**: Proper cookie security attributes in production
- **JWT Strategy**: Short-lived access tokens (15 min) + long-lived refresh tokens (30 days)
- **Password Hashing**: Argon2 for secure password storage
- **Token Revocation**: Logout clears all cookies and revokes refresh tokens

### Application Security
- **CORS Protection**: Properly configured for frontend access
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Via Prisma ORM
- **Protected Routes**: Middleware-based authentication checks

### Authentication Flow
1. **Registration/Login** → Sets httpOnly access + refresh cookies
2. **API Requests** → Cookies sent automatically by browser
3. **Token Refresh** → Automatic rotation when access token expires
4. **Logout** → Clears all cookies and revokes refresh tokens

> **Note**: The authentication system is based on **[AuthER](https://github.com/arunabh-a/AuthER)**, a custom-built authentication service providing industry-standard security features.

## 🛠️ Development

### Database Commands

```bash
# Create a new migration
npm run migrate:dev

# Reset database and apply all migrations
npm run migrate:reset

# Generate Prisma Client
npm run prisma generate
```

### Build for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

## � Deployment

The application is deployed on **AWS EC2** with Nginx as a reverse proxy and runs as a systemd service for process management.

### Production Infrastructure

- **Hosting**: AWS EC2 Instance
- **Web Server**: Nginx (Reverse Proxy)
- **Process Manager**: systemd
- **Database**: PostgreSQL
- **SSL/TLS**: Let's Encrypt (recommended)

### Deployment Steps

#### 1. Server Setup

**Install dependencies on EC2:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 or use systemd
sudo npm install -g pm2
```

#### 2. Configure Nginx Reverse Proxy

Create Nginx configuration at `/etc/nginx/sites-available/kanbrew`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kanbrew /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. Setup systemd Services

**Backend Service** (`/etc/systemd/system/kanbrew-backend.service`):

```ini
[Unit]
Description=Task-Brew Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Task-Brew/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Frontend Service** (`/etc/systemd/system/kanbrew-frontend.service`):

```ini
[Unit]
Description=Task-Brew Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Task-Brew/client
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start services:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable kanbrew-backend
sudo systemctl enable kanbrew-frontend
sudo systemctl start kanbrew-backend
sudo systemctl start kanbrew-frontend
```

#### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/arunabh-a/Task-Brew.git
cd Task-Brew

# Setup backend
cd server
npm install
npm run build
npm run migrate:dev

# Setup frontend
cd ../client
npm install
npm run build
```

#### 5. Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Managing Services

```bash
# Check service status
sudo systemctl status kanbrew-backend
sudo systemctl status kanbrew-frontend

# View logs
sudo journalctl -u kanbrew-backend -f
sudo journalctl -u kanbrew-frontend -f

# Restart services
sudo systemctl restart kanbrew-backend
sudo systemctl restart kanbrew-frontend

# Stop services
sudo systemctl stop kanbrew-backend
sudo systemctl stop kanbrew-frontend
```

### Environment Variables (Production)

Ensure your production `.env` files are properly configured:

**Server `.env`:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/kanbrew"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"
CORS_CLIENT_URL="https://your-domain.com"
```

**Client `.env.local`:**
```env
NEXT_PUBLIC_API_URL="https://your-domain.com/api"
```


## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/arunabh-a/Task-Brew/issues) on GitHub.

---

**Built with ❤️ and ☕ by [Arunabh](https://github.com/arunabh-a)**
