# Cybersecurity Threat Intelligence Dashboard

A full-stack web application for monitoring and managing cybersecurity threats, indicators, incidents, and threat intelligence feeds.

## Features

### Frontend
- **Responsive UI** with modern dark theme using Tailwind CSS
- **Dashboard** with real-time metrics and charts
- **Threat Actors** management with filtering and CRUD operations
- **Indicators of Compromise (IOCs)** tracking and analysis
- **Security Incidents** monitoring and response management
- **Threat Intelligence Feeds** configuration and monitoring
- **Interactive Charts** using Chart.js for data visualization

### Backend
- **RESTful API** built with Node.js and Express
- **Modular Controllers** for each data type
- **JSON File Storage** for development (easily replaceable with database)
- **CORS Support** for cross-origin requests
- **Environment Configuration** with .env support
- **Error Handling** and logging

## Project Structure

```
threat-intel-dashboard/
│
├── frontend/
│   ├── index.html              # Main dashboard page
│   ├── css/
│   │   ├── input.css          # Tailwind CSS source
│   │   └── tailwind.css       # Compiled CSS (generated)
│   ├── js/
│   │   ├── dashboard.js       # Dashboard functionality
│   │   ├── actors.js          # Threat actors management
│   │   ├── indicators.js      # IOCs management
│   │   ├── incidents.js       # Incidents management
│   │   └── feeds.js           # Threat feeds management
│   └── pages/
│       ├── actors.html        # Threat actors page
│       ├── indicators.html    # Indicators page
│       ├── incidents.html     # Incidents page
│       └── feeds.html         # Threat feeds page
│
├── backend/
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── middleware/            # Custom middleware
│   └── data/                  # JSON data files
│
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
└── tailwind.config.js         # Tailwind CSS configuration
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or download the project**
   ```bash
   cd threat-intel-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build Tailwind CSS** (optional - CDN is used for demo)
   ```bash
   npm run build-css
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file (already exists)
   # Default MongoDB URI: mongodb://localhost:27017/threat_intelligence
   # Default PORT: 5000
   ```

5. **Seed the MongoDB database** (first time only)
   ```bash
   npm run seed
   ```
   This will populate the database with sample data:
   - 5 Threat Sources (AlienVault, VirusTotal, MISP, etc.)
   - 8 Threat Indicators (IPs, domains, hashes, URLs)
   - 5 Threat Actors (APT28, Lazarus Group, FIN7, etc.)
   - 5 Security Incidents

6. **Start the server**
   
   **Option A: MongoDB Server (Recommended)**
   ```bash
   npm run mongo:dev     # Development mode (auto-reload)
   npm run mongo:start   # Production mode
   ```
   
   **Option B: JSON File Server (No database needed)**
   ```bash
   npm run dev          # Development mode
   npm start            # Production mode
   ```

7. **Access the application**
   - Open your browser and navigate to: `http://localhost:5000`
   - The API is available at: `http://localhost:5000/api`
   - Health check: `http://localhost:5000/api/health`
   - Database stats: `http://localhost:5000/api/stats`

## MongoDB Setup

### Requirements
- MongoDB installed locally OR MongoDB Atlas (free cloud database)

### Local MongoDB Setup
```bash
# Windows - Start MongoDB service
net start MongoDB

# Verify connection
# MongoDB should be running on mongodb://localhost:27017
```

### MongoDB Atlas Setup (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### Available Scripts
- `npm run seed` - Populate database with sample data
- `npm run mongo:dev` - Start MongoDB server (development)
- `npm run mongo:start` - Start MongoDB server (production)
- `npm run test:db` - Test MongoDB connection
- `npm start` - Start JSON file server (no database)
- `npm run dev` - Start JSON file server (development)

## API Endpoints

### System
- `GET /api/health` - System health check
- `GET /api/stats` - Database statistics (MongoDB only)

### Threat Sources (MongoDB only)
- `GET /api/sources` - List all threat intelligence sources
- `GET /api/sources/:id` - Get specific source

### Threat Actors
- `GET /api/actors` - List all threat actors
- `GET /api/actors/:id` - Get specific threat actor
- `POST /api/actors` - Create new threat actor
- `PUT /api/actors/:id` - Update threat actor
- `DELETE /api/actors/:id` - Delete threat actor

### Indicators
- `GET /api/indicators` - List all indicators
- `GET /api/indicators/:id` - Get specific indicator
- `POST /api/indicators` - Create new indicator
- `PUT /api/indicators/:id` - Update indicator
- `DELETE /api/indicators/:id` - Delete indicator

### Incidents
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/:id` - Get specific incident
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident

### Threat Feeds
- `GET /api/feeds` - List all threat feeds
- `GET /api/feeds/:id` - Get specific feed
- `POST /api/feeds` - Create new feed
- `PUT /api/feeds/:id` - Update feed
- `DELETE /api/feeds/:id` - Delete feed

### System
- `GET /api/health` - System health check

## Usage

### Dashboard
- View real-time metrics for threats, indicators, incidents, and feeds
- Interactive charts showing threat level distribution and incident timeline
- Recent activity feeds for quick monitoring

### Managing Threat Actors
- Add new threat actors with details like origin, sophistication, and tactics
- Filter actors by origin, status, or search terms
- Edit existing actor information
- Track actor aliases and associated campaigns

### Tracking Indicators
- Add IOCs including IP addresses, domains, file hashes, URLs, and emails
- Set confidence levels and TLP (Traffic Light Protocol) classifications
- Filter by type, confidence level, or status
- Monitor indicator lifecycles

### Incident Management
- Create and track security incidents
- Assign severity levels and categories
- Associate incidents with threat actors
- Track investigation progress and resolution

### Threat Feed Management
- Configure multiple threat intelligence feeds
- Monitor feed status and reliability
- Track indicators received from each feed
- Manage feed authentication and update frequencies

## Development

### Adding New Features
1. Backend: Add new routes in `backend/routes/` and controllers in `backend/controllers/`
2. Frontend: Create corresponding JavaScript modules in `frontend/js/`
3. Update the navigation and create new HTML pages as needed

### Database Integration
The current implementation uses JSON files for data storage. To integrate with a database:
1. Replace file operations in controllers with database queries
2. Add database configuration to `.env`
3. Install appropriate database drivers (e.g., `pg` for PostgreSQL, `mongodb` for MongoDB)

### Styling Customization
- Modify `tailwind.config.js` for theme customization
- Update `frontend/css/input.css` for custom components
- Rebuild CSS with `npm run build-css`

## Security Considerations

For production deployment:
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Validate and sanitize all input data
- Implement rate limiting
- Use a proper database with encryption
- Add logging and monitoring
- Configure proper CORS policies

## Technologies Used

- **Frontend**: HTML5, CSS3 (Tailwind), JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Development**: Nodemon, npm scripts
- **Styling**: Tailwind CSS with custom dark theme
- **Data**: JSON files (development), easily replaceable with databases

## License

This project is for educational and demonstration purposes. Please ensure compliance with your organization's security policies before deploying in production environments.

## Support

For issues or questions about this threat intelligence dashboard:
1. Check the console for any JavaScript errors
2. Verify the backend server is running on port 3000
3. Ensure all dependencies are properly installed
4. Check the API endpoints are responding correctly

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication and role-based access
- Real-time notifications and alerts
- Export functionality (PDF, CSV, JSON)
- Integration with external threat intelligence APIs
- Advanced analytics and machine learning capabilities
- Mobile-responsive improvements
- Automated threat feed ingestion