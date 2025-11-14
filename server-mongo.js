/**
 * MongoDB Server Entry Point
 * Main application file for Threat Intelligence Database System
 * 
 * Run with: node server-mongo.js
 */

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import {
  ThreatSource,
  ThreatIndicator,
  ThreatActor,
  Incident
} from './models/index.js';

// Import authentication routes
import authRouter from './backend/routes/auth.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
await connectDB();

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRouter);

// Root endpoint - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Login and signup routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'signup.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Serve page routes
app.get('/actors', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'actors.html'));
});

app.get('/indicators', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'indicators.html'));
});

app.get('/incidents', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'incidents.html'));
});

app.get('/feeds', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'feeds.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'connected',
    mongodb: {
      connected: true,
      database: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'threat_intelligence'
    }
  });
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [sourcesCount, indicatorsCount, actorsCount, incidentsCount] = await Promise.all([
      ThreatSource.countDocuments(),
      ThreatIndicator.countDocuments(),
      ThreatActor.countDocuments(),
      Incident.countDocuments()
    ]);

    const criticalIncidents = await Incident.countDocuments({ 
      severity: 'critical', 
      status: { $ne: 'closed' } 
    });

    const criticalIndicators = await ThreatIndicator.countDocuments({ 
      severityLevel: 'critical',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalSources: sourcesCount,
        totalIndicators: indicatorsCount,
        totalActors: actorsCount,
        totalIncidents: incidentsCount,
        criticalIncidents,
        criticalIndicators,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// THREAT SOURCES ROUTES
// ============================================

// Get all threat sources
app.get('/api/sources', async (req, res) => {
  try {
    const sources = await ThreatSource.find()
      .sort('-reliabilityScore -lastChecked');
    
    res.json({
      success: true,
      count: sources.length,
      data: sources
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single threat source by ID
app.get('/api/sources/:id', async (req, res) => {
  try {
    const source = await ThreatSource.findById(req.params.id)
      .populate('indicators');
    
    if (!source) {
      return res.status(404).json({ success: false, error: 'Source not found' });
    }
    
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// THREAT INDICATORS ROUTES
// ============================================

// Get all threat indicators
app.get('/api/indicators', async (req, res) => {
  try {
    const { type, severity, limit = 100 } = req.query;
    
    const query = {};
    if (type) query.indicatorType = type;
    if (severity) query.severityLevel = severity;
    
    const indicators = await ThreatIndicator.find(query)
      .populate('source', 'sourceName sourceType')
      .sort('-lastSeen')
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: indicators.length,
      data: indicators
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single indicator by ID
app.get('/api/indicators/:id', async (req, res) => {
  try {
    const indicator = await ThreatIndicator.findById(req.params.id)
      .populate('source');
    
    if (!indicator) {
      return res.status(404).json({ success: false, error: 'Indicator not found' });
    }
    
    res.json({ success: true, data: indicator });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get indicators by severity
app.get('/api/indicators/severity/:level', async (req, res) => {
  try {
    const indicators = await ThreatIndicator.findBySeverity(req.params.level);
    
    res.json({
      success: true,
      count: indicators.length,
      data: indicators
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// THREAT ACTORS ROUTES
// ============================================

// Get all threat actors
app.get('/api/actors', async (req, res) => {
  try {
    const { motivation, limit = 50 } = req.query;
    
    const query = {};
    if (motivation) query.motivation = motivation;
    
    const actors = await ThreatActor.find(query)
      .populate('linkedIndicators', 'indicatorType value severityLevel')
      .sort('-lastActivity')
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: actors.length,
      data: actors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single threat actor by ID
app.get('/api/actors/:id', async (req, res) => {
  try {
    const actor = await ThreatActor.findById(req.params.id)
      .populate('linkedIndicators')
      .populate('incidents');
    
    if (!actor) {
      return res.status(404).json({ success: false, error: 'Actor not found' });
    }
    
    res.json({ success: true, data: actor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// INCIDENTS ROUTES
// ============================================

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const { severity, status, limit = 50 } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    
    const incidents = await Incident.find(query)
      .populate('linkedActors', 'actorName motivation')
      .populate('relatedIndicators', 'indicatorType value severityLevel')
      .sort('-reportedDate')
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single incident by ID
app.get('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('linkedActors')
      .populate('relatedIndicators');
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get critical incidents
app.get('/api/incidents/critical/active', async (req, res) => {
  try {
    const incidents = await Incident.findCritical();
    
    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ERROR HANDLING & 404
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🛡️  THREAT INTELLIGENCE DATABASE SYSTEM                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📍 Available Endpoints:');
  console.log('   GET  /api/health                    - Health check');
  console.log('   GET  /api/stats                     - Database statistics');
  console.log('   GET  /api/sources                   - List all threat sources');
  console.log('   GET  /api/sources/:id               - Get specific source');
  console.log('   GET  /api/indicators                - List threat indicators');
  console.log('   GET  /api/indicators/:id            - Get specific indicator');
  console.log('   GET  /api/indicators/severity/:lvl  - Filter by severity');
  console.log('   GET  /api/actors                    - List threat actors');
  console.log('   GET  /api/actors/:id                - Get specific actor');
  console.log('   GET  /api/incidents                 - List incidents');
  console.log('   GET  /api/incidents/:id             - Get specific incident');
  console.log('   GET  /api/incidents/critical/active - Get critical incidents');
  console.log('\n📝 Query Parameters:');
  console.log('   ?type=IP|Domain|URL|Hash            - Filter indicators by type');
  console.log('   ?severity=low|medium|high|critical  - Filter by severity');
  console.log('   ?status=new|investigating|resolved  - Filter incidents by status');
  console.log('   ?motivation=financial|political     - Filter actors by motivation');
  console.log('   ?limit=50                           - Limit results (default: 50-100)');
  console.log('\n💡 Tips:');
  console.log('   • Test endpoints with: curl http://localhost:' + PORT + '/api/health');
  console.log('   • View stats: curl http://localhost:' + PORT + '/api/stats');
  console.log('   • Seed data: npm run seed');
  console.log('\n═══════════════════════════════════════════════════════════\n');
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
