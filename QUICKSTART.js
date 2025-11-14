#!/usr/bin/env node

/**
 * Quick Start Guide
 * Run this to see setup instructions
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  🛡️  THREAT INTELLIGENCE SYSTEM - MONGODB SETUP             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 STEP 1: INSTALL DEPENDENCIES
─────────────────────────────────────────────────────────────────
  npm install

🔧 STEP 2: CONFIGURE ENVIRONMENT
─────────────────────────────────────────────────────────────────
  1. Copy the example environment file:
     cp .env.example .env
     
  2. Edit .env with your MongoDB connection:
     
     # For Local MongoDB:
     MONGODB_URI=mongodb://localhost:27017/threat_intelligence
     
     # For MongoDB Atlas:
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/threat_intelligence

🗄️  STEP 3: START MONGODB
─────────────────────────────────────────────────────────────────
  Option A - Local MongoDB (Windows):
    net start MongoDB
    
  Option B - MongoDB Atlas:
    Sign up at: https://www.mongodb.com/cloud/atlas
    Create cluster and get connection string

🌱 STEP 4: SEED THE DATABASE
─────────────────────────────────────────────────────────────────
  npm run seed
  
  This will populate sample data:
    • 5 Threat Sources
    • 8 Threat Indicators (IPs, Domains, URLs, Hashes)
    • 5 Threat Actors (APT28, Lazarus, FIN7, etc.)
    • 5 Security Incidents

🚀 STEP 5: START THE SERVER
─────────────────────────────────────────────────────────────────
  Development (with auto-reload):
    npm run mongo:dev
    
  Production:
    npm run mongo:start

✅ STEP 6: TEST THE API
─────────────────────────────────────────────────────────────────
  Open in browser or use curl:
  
  Health Check:
    http://localhost:5000/api/health
    
  Statistics:
    http://localhost:5000/api/stats
    
  Critical Indicators:
    http://localhost:5000/api/indicators/severity/critical
    
  All Threat Actors:
    http://localhost:5000/api/actors

📚 DOCUMENTATION
─────────────────────────────────────────────────────────────────
  Complete guide: MONGODB_README.md
  
  API Endpoints:
    GET  /api/health                    - Health check
    GET  /api/stats                     - Statistics
    GET  /api/sources                   - Threat sources
    GET  /api/indicators                - IOCs
    GET  /api/actors                    - Threat actors
    GET  /api/incidents                 - Security incidents

📂 PROJECT STRUCTURE
─────────────────────────────────────────────────────────────────
  config/
    └── db.js                  # MongoDB connection
  models/
    ├── ThreatSource.js        # Sources schema
    ├── ThreatIndicator.js     # Indicators schema
    ├── ThreatActor.js         # Actors schema
    ├── Incident.js            # Incidents schema
    └── index.js               # Models export
  scripts/
    └── seedData.js            # Database seeding
  server-mongo.js              # Main server

💡 QUICK COMMANDS
─────────────────────────────────────────────────────────────────
  npm install           # Install dependencies
  npm run seed          # Populate database
  npm run mongo:dev     # Start dev server
  npm run mongo:start   # Start production server

🆘 NEED HELP?
─────────────────────────────────────────────────────────────────
  • Connection issues? Check MongoDB is running
  • Module errors? Ensure "type": "module" in package.json
  • Validation errors? Review model schemas in models/ folder
  
  Full documentation: MONGODB_README.md

═══════════════════════════════════════════════════════════════════

Ready to get started?

  $ npm install && npm run seed && npm run mongo:dev

Happy Threat Hunting! 🎯

`);
