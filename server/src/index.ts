import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import taskRoutes from './routes/taskRoutes';
import listRoutes from './routes/listRoutes';
import { setupSocketHandlers } from './utils/socket';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add cookie parser middleware
app.use(cookieParser());

// Add cookie configuration
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = req.protocol === 'https';
  
  // Only set cookie if it doesn't exist
  if (!req.cookies.session) {
    const cookieOptions = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      // In production, require secure and sameSite=none
      // In development, only require secure if using HTTPS
      secure: isProduction || isHttps,
      sameSite: isProduction ? 'none' as const : 'lax' as const
    };

    res.cookie('session', Date.now().toString(), cookieOptions);
  }
  next();
});

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/lists', listRoutes);

// Base route for API
app.get('/api', (_req: Request, res: Response) => {
  res.send('Real-time To-Do List API is running');
});

// Root route for health checks
app.get('/', (_req: Request, res: Response) => {
  res.send('Real-time To-Do List API is online. Use /api for API endpoints.');
});

// Add a health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'unknown'
  });
});

// Set up Socket.IO handlers
setupSocketHandlers(io);

// Serve static files from the 'public' directory in production
// This is used when deploying frontend and backend together
if (process.env.NODE_ENV === 'production') {
  // Check if the public directory exists (for combined deployment)
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));
  
  // Serve index.html for any unmatched routes (for SPA routing)
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
