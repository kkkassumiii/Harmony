import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import emotionRoutes from './routes/emotions';
import emotionEntriesRoutes from './routes/emotionEntries';
import goalsRoutes from './routes/goals';
import habitsRoutes from './routes/habits';
import profileRoutes from './routes/profile';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app: Express = express();
export const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '8000', 10);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Гармония с собой - API',
      version: '1.0.0',
      description: 'API для веб-приложения психологической поддержки и личного развития',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
// CORS middleware for all requests - MUST be first before helmet
app.use((req, res, next) => {
  console.log('=== CORS Middleware ===');
  console.log('Request Origin header:', req.headers.origin);
  console.log('Method:', req.method);
  
  const origin = req.headers.origin;
  if (origin === 'http://localhost:3000') {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
    console.log('✓ Set CORS to http://localhost:3000');
  } else {
    console.log('Origin does not match http://localhost:3000, origin is:', origin);
  }
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  next();
});

// app.use(helmet({
//   crossOriginResourcePolicy: false,
//   crossOriginEmbedderPolicy: false,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/emotion-entries', emotionEntriesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Final CORS override middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'http://localhost:3000') {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
    console.log('Final CORS override set for localhost:3000');
  }
  next();
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Final CORS override middleware - after all routes and error handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Final CORS middleware - Origin:', origin, 'Current header:', res.get('Access-Control-Allow-Origin'));
  if (origin === 'http://localhost:3000') {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
    console.log('Final CORS override set for localhost:3000');
  }
  next();
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app };
