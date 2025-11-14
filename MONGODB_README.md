# 🛡️ Threat Intelligence System - MongoDB Setup

Complete MongoDB database implementation for a Cyber Threat Intelligence System web application. This setup provides production-ready database structure, schema models, and sample data for managing threat intelligence from various sources.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Entities](#database-entities)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)

---

## ✨ Features

- **Complete MongoDB Integration** with Mongoose ODM
- **4 Core Collections**: ThreatSources, ThreatIndicators, ThreatActors, Incidents
- **Production-Ready Models** with validation, indexes, and virtuals
- **Sample Data Seeding** script with realistic threat intelligence data
- **RESTful API** endpoints for all entities
- **Environment-based Configuration** using dotenv
- **Comprehensive Validation** with enums, required fields, and constraints
- **Relationship Management** between entities using ObjectId references
- **Advanced Queries** with filtering, sorting, and population

---

## 🛠 Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **dotenv** - Environment variable management
- **ES6 Modules** - Modern JavaScript syntax

---

## 📂 Project Structure

```
threat-intel-dashboard/
│
├── config/
│   └── db.js                    # MongoDB connection configuration
│
├── models/
│   ├── ThreatSource.js          # Threat intelligence sources schema
│   ├── ThreatIndicator.js       # IOCs (Indicators of Compromise) schema
│   ├── ThreatActor.js           # Threat actors and APT groups schema
│   ├── Incident.js              # Security incidents schema
│   └── index.js                 # Models export file
│
├── scripts/
│   └── seedData.js              # Database seeding script
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── server-mongo.js              # Main server entry point
└── package.json                 # Project dependencies
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (v6.0 or higher)
  - Local installation OR
  - MongoDB Atlas account (cloud database)

---

## 🚀 Installation

### Step 1: Install Dependencies

```powershell
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment configuration
- `cors` - CORS middleware
- `helmet` - Security headers
- `nodemon` - Development server (dev dependency)

### Step 2: Setup Environment Variables

Create a `.env` file in the root directory:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your configuration:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/threat_intelligence

# For MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threat_intelligence

PORT=5000
NODE_ENV=development
```

### Step 3: Start MongoDB

**For Local MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB
```

**For MongoDB Atlas:**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

---

## ⚙️ Configuration

### MongoDB Connection Settings

The database configuration in `config/db.js` includes:

- **Connection Pooling**: Max 10 concurrent connections
- **Timeouts**: 5s server selection, 45s socket timeout
- **Auto-reconnection**: Automatically reconnects on disconnection
- **Event Handlers**: Logs connection, errors, disconnections

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/threat_intelligence` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

---

## 🗄️ Database Entities

### 1. ThreatSource

Represents threat intelligence sources and feeds.

**Fields:**
- `sourceName` (String, required, unique) - Name of the threat source
- `sourceType` (Enum: 'open-source', 'commercial', 'community')
- `reliabilityScore` (Number, 0-10) - Source reliability rating
- `lastChecked` (Date) - Last verification timestamp
- `isActive` (Boolean) - Source active status
- `description` (String) - Source description

**Indexes:** `sourceName`, `sourceType + reliabilityScore`, `lastChecked`

### 2. ThreatIndicator

Indicators of Compromise (IOCs) from various sources.

**Fields:**
- `indicatorType` (Enum: 'IP', 'Domain', 'URL', 'Hash')
- `value` (String, required, unique) - The actual indicator value
- `severityLevel` (Enum: 'low', 'medium', 'high', 'critical')
- `firstSeen` (Date) - First detection timestamp
- `lastSeen` (Date) - Most recent detection
- `source` (ObjectId → ThreatSource) - Reference to source
- `tags` ([String]) - Classification tags
- `confidence` (Number, 0-100) - Confidence score
- `metadata` (Object) - Additional context (country, ASN, port, etc.)

**Indexes:** `indicatorType + severityLevel`, `source + lastSeen`, `tags`, `value (text)`

### 3. ThreatActor

Known threat actors, APT groups, and cybercriminal organizations.

**Fields:**
- `actorName` (String, required, unique) - Primary actor name
- `knownAliases` ([String]) - Alternative names
- `motivation` (Enum: 'financial', 'political', 'hacktivist', 'espionage', 'unknown')
- `techniques` ([String]) - Attack techniques used
- `activeSince` (Date) - First observed activity
- `lastActivity` (Date) - Most recent activity
- `linkedIndicators` ([ObjectId → ThreatIndicator]) - Associated IOCs
- `sophisticationLevel` (Enum: 'beginner', 'intermediate', 'advanced', 'expert')
- `targetSectors` ([String]) - Targeted industries
- `targetRegions` ([String]) - Geographic targets

**Indexes:** `actorName`, `motivation + sophisticationLevel`, `lastActivity`, `techniques`

### 4. Incident

Security incidents and breach reports.

**Fields:**
- `incidentTitle` (String, required) - Incident title
- `description` (String, required) - Detailed description
- `reportedDate` (Date) - When incident was reported
- `affectedAssets` ([String]) - Compromised systems/data
- `severity` (Enum: 'low', 'medium', 'high', 'critical')
- `linkedActors` ([ObjectId → ThreatActor]) - Attributed actors
- `relatedIndicators` ([ObjectId → ThreatIndicator]) - Associated IOCs
- `status` (Enum: 'new', 'investigating', 'contained', 'resolved', 'closed')
- `incidentType` (Enum: 'malware', 'phishing', 'data-breach', 'ddos', 'ransomware', etc.)
- `impactLevel` (Enum: 'none', 'minor', 'moderate', 'major', 'severe')
- `affectedSystems` (Number) - Count of affected systems
- `estimatedLoss` (Number) - Financial impact estimate
- `resolvedDate` (Date) - Resolution timestamp
- `notes` ([Object]) - Investigation notes with timestamps

**Indexes:** `reportedDate`, `severity + status`, `incidentType`, `status + reportedDate`

---

## 🎯 Usage

### 1. Seed the Database

Populate the database with sample threat intelligence data:

```powershell
npm run seed
```

This will:
- Clear existing data
- Insert 5 threat sources
- Insert 8 threat indicators (IPs, domains, URLs, hashes)
- Insert 5 threat actors (APT28, Lazarus, FIN7, etc.)
- Insert 5 security incidents
- Display a comprehensive summary

**Sample Output:**
```
✅ Existing data cleared

📊 Seeding Threat Sources...
✅ Inserted 5 threat sources

🎯 Seeding Threat Indicators...
✅ Inserted 8 threat indicators

👤 Seeding Threat Actors...
✅ Inserted 5 threat actors

🚨 Seeding Incidents...
✅ Inserted 5 incidents

═══════════════════════════════════════════
🎉 Database seeding completed successfully!
═══════════════════════════════════════════
```

### 2. Start the Server

**Development mode (with auto-restart):**
```powershell
npm run mongo:dev
```

**Production mode:**
```powershell
npm run mongo:start
```

Server will start on `http://localhost:5000` (or your configured PORT)

---

## 🌐 API Endpoints

### General Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check and database status |
| GET | `/api/stats` | Database statistics and counts |

### Threat Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sources` | List all threat sources |
| GET | `/api/sources/:id` | Get specific source details |

### Threat Indicators

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/indicators` | List all indicators | `?type=IP&severity=high&limit=50` |
| GET | `/api/indicators/:id` | Get specific indicator | - |
| GET | `/api/indicators/severity/:level` | Filter by severity | `level`: low/medium/high/critical |

### Threat Actors

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/actors` | List all threat actors | `?motivation=financial&limit=50` |
| GET | `/api/actors/:id` | Get specific actor with indicators | - |

### Incidents

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/incidents` | List all incidents | `?severity=critical&status=investigating&limit=50` |
| GET | `/api/incidents/:id` | Get specific incident | - |
| GET | `/api/incidents/critical/active` | Get active critical incidents | - |

### Example API Calls

**Get database statistics:**
```powershell
curl http://localhost:5000/api/stats
```

**Get critical indicators:**
```powershell
curl http://localhost:5000/api/indicators/severity/critical
```

**Get incidents by severity:**
```powershell
curl "http://localhost:5000/api/incidents?severity=high&status=investigating"
```

**Get threat actors by motivation:**
```powershell
curl "http://localhost:5000/api/actors?motivation=financial"
```

---

## 📜 Scripts

### Available npm Scripts

```json
{
  "mongo:start": "node server-mongo.js",      // Start MongoDB server
  "mongo:dev": "nodemon server-mongo.js",     // Development mode with auto-reload
  "seed": "node scripts/seedData.js",         // Seed database with sample data
  "start": "node backend/server.js",          // Start original JSON-based server
  "dev": "nodemon backend/server.js"          // Original server (dev mode)
}
```

### Running Scripts

```powershell
# Seed database
npm run seed

# Start MongoDB server (production)
npm run mongo:start

# Start MongoDB server (development with auto-reload)
npm run mongo:dev
```

---

## 🧪 Testing the Setup

### 1. Verify MongoDB Connection

```powershell
npm run mongo:start
```

Look for:
```
✅ MongoDB Connected: localhost
📊 Database: threat_intelligence
🚀 Server running on http://localhost:5000
```

### 2. Test Health Endpoint

```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-14T...",
  "database": "connected",
  "mongodb": {
    "connected": true,
    "database": "threat_intelligence"
  }
}
```

### 3. View Statistics

```powershell
curl http://localhost:5000/api/stats
```

### 4. Query Indicators

```powershell
curl "http://localhost:5000/api/indicators?severity=critical"
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong MongoDB credentials** for production
3. **Enable MongoDB authentication** in production environments
4. **Use MongoDB Atlas** for production deployments
5. **Implement rate limiting** for API endpoints
6. **Add authentication/authorization** before production use
7. **Enable HTTPS/TLS** for production
8. **Regularly update dependencies**: `npm audit fix`

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Implement API authentication (JWT, OAuth)
- [ ] Add rate limiting middleware
- [ ] Configure logging (Winston, Morgan)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Create backup strategy
- [ ] Document API with Swagger/OpenAPI

---

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

```
❌ Error connecting to MongoDB: connect ECONNREFUSED
```

**Solution:**
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB port (default: 27017)

### Module Not Found Error

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

**Solution:**
- Ensure `"type": "module"` is in `package.json`
- Run `npm install` to install dependencies
- Check file extensions are `.js` (not `.mjs`)

### Validation Errors

```
ValidationError: Path `severity` is required
```

**Solution:**
- Review model schemas in `models/` folder
- Ensure all required fields are provided
- Check enum values match schema definitions

---

## 📝 License

MIT License - feel free to use this setup for your projects!

---

## 👨‍💻 Author

Built with ❤️ for secure threat intelligence management

---

**Ready to start?**

```powershell
npm install
npm run seed
npm run mongo:dev
```

Then visit: `http://localhost:5000/api/health`

🎉 **Happy Threat Hunting!**
