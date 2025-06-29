import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Import routes
import admissionsRoutes from './routes/admissions.routes.js'
import registrarRoutes from './routes/registrar.routes.js'
import financeRoutes from './routes/finance.routes.js'
import placementRoutes from './routes/placement.routes.js'
import accountingRoutes from './routes/accounting.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import managementRoutes from './routes/management.routes.js'
import setupRoutes from './routes/setup.routes.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sis_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully')
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error)
  process.exit(1)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/admissions', admissionsRoutes)
app.use('/api/registrar', registrarRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/placement', placementRoutes)
app.use('/api/accounting', accountingRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/management', managementRoutes)
app.use('/api/setup', setupRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error)
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
}) 