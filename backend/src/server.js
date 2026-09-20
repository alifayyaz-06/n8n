/**
 * Multi-Tenant Express + Supabase Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import riderRoutes from './routes/riderRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { testSupabaseConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS middleware setup
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json());

// Health check endpoint (Public)
app.get('/api/health', async (req, res) => {
  const dbConnected = await testSupabaseConnection();
  res.status(200).json({
    status: 'UP',
    database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
    service: 'Multi-Tenant Restaurant Order Portal API',
  });
});

// Mount Public Auth Routes (login, check-phone, master key, register)
app.use('/api/auth', authRoutes);

// Authenticated user profile & tenant info endpoint
app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
      restaurant: req.restaurant,
      role: req.role,
    },
  });
});

// Mount Authenticated & Tenant Isolated API routes
app.use('/api/orders', requireAuth, orderRoutes);
app.use('/api/riders', requireAuth, riderRoutes);

// Mount Integration API routes (n8n → Express → Supabase)
// Uses its own n8nAuthMiddleware (API key auth, not user JWT)
app.use('/api/integrations', integrationRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found.`,
    error: 'NOT_FOUND',
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: 'SERVER_ERROR',
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Multi-Tenant Restaurant Backend API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: ${FRONTEND_URL}`);
  await testSupabaseConnection();
});
