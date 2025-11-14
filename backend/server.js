import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import actorsRouter from './routes/actors.js';
import indicatorsRouter from './routes/indicators.js';
import incidentsRouter from './routes/incidents.js';
import feedsRouter from './routes/feeds.js';

// Import middleware
import corsMiddleware from './middleware/corsMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/actors', actorsRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/feeds', feedsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.get('/actors', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/actors.html'));
});

app.get('/indicators', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/indicators.html'));
});

app.get('/incidents', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/incidents.html'));
});

app.get('/feeds', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/feeds.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested resource ${req.originalUrl} was not found on this server.`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Threat Intelligence Dashboard Server running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;