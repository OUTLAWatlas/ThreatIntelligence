import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IncidentsController {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/incidents.json');
    }

    async loadIncidents() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading incidents data:', error);
            return [];
        }
    }

    async saveIncidents(incidents) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(incidents, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving incidents data:', error);
            return false;
        }
    }

    // GET /api/incidents
    async getIncidents(req, res) {
        try {
            const incidents = await this.loadIncidents();
            const { search, severity, status, limit = 50, offset = 0 } = req.query;
            
            let filteredIncidents = incidents;

            // Apply filters
            if (search) {
                const searchLower = search.toLowerCase();
                filteredIncidents = filteredIncidents.filter(incident => 
                    incident.title.toLowerCase().includes(searchLower) ||
                    incident.description.toLowerCase().includes(searchLower) ||
                    incident.threat_actor.toLowerCase().includes(searchLower)
                );
            }

            if (severity) {
                filteredIncidents = filteredIncidents.filter(incident => 
                    incident.severity.toLowerCase() === severity.toLowerCase()
                );
            }

            if (status) {
                filteredIncidents = filteredIncidents.filter(incident => 
                    incident.status.toLowerCase() === status.toLowerCase()
                );
            }

            // Apply pagination
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);

            res.json({
                data: paginatedIncidents,
                meta: {
                    total: filteredIncidents.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: endIndex < filteredIncidents.length
                }
            });
        } catch (error) {
            console.error('Error in getIncidents:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve incidents'
            });
        }
    }

    // GET /api/incidents/:id
    async getIncidentById(req, res) {
        try {
            const incidents = await this.loadIncidents();
            const incidentId = parseInt(req.params.id);
            const incident = incidents.find(i => i.id === incidentId);

            if (!incident) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Incident with ID ${incidentId} not found`
                });
            }

            res.json(incident);
        } catch (error) {
            console.error('Error in getIncidentById:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve incident'
            });
        }
    }

    // POST /api/incidents
    async createIncident(req, res) {
        try {
            const incidents = await this.loadIncidents();
            const {
                title,
                description,
                severity = 'Medium',
                status = 'Investigating',
                affected_systems = [],
                threat_actor,
                attack_vector,
                indicators = [],
                mitre_tactics = [],
                mitre_techniques = [],
                analyst,
                organization
            } = req.body;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Title and description are required fields'
                });
            }

            // Generate new ID
            const newId = Math.max(...incidents.map(i => i.id), 0) + 1;
            
            const newIncident = {
                id: newId,
                title,
                description,
                severity,
                status,
                date_discovered: new Date().toISOString(),
                date_updated: new Date().toISOString(),
                affected_systems,
                threat_actor,
                attack_vector,
                indicators,
                mitre_tactics,
                mitre_techniques,
                impact: {
                    confidentiality: 'Low',
                    integrity: 'Low',
                    availability: 'Low'
                },
                timeline: [{
                    timestamp: new Date().toISOString(),
                    event: 'Incident created'
                }],
                analyst,
                organization
            };

            incidents.push(newIncident);
            await this.saveIncidents(incidents);

            res.status(201).json({
                message: 'Incident created successfully',
                data: newIncident
            });
        } catch (error) {
            console.error('Error in createIncident:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to create incident'
            });
        }
    }

    // PUT /api/incidents/:id
    async updateIncident(req, res) {
        try {
            const incidents = await this.loadIncidents();
            const incidentId = parseInt(req.params.id);
            const incidentIndex = incidents.findIndex(i => i.id === incidentId);

            if (incidentIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Incident with ID ${incidentId} not found`
                });
            }

            // Update incident with new date_updated
            const updatedIncident = { 
                ...incidents[incidentIndex], 
                ...req.body, 
                id: incidentId,
                date_updated: new Date().toISOString()
            };
            
            incidents[incidentIndex] = updatedIncident;
            await this.saveIncidents(incidents);

            res.json({
                message: 'Incident updated successfully',
                data: incidents[incidentIndex]
            });
        } catch (error) {
            console.error('Error in updateIncident:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update incident'
            });
        }
    }

    // DELETE /api/incidents/:id
    async deleteIncident(req, res) {
        try {
            const incidents = await this.loadIncidents();
            const incidentId = parseInt(req.params.id);
            const incidentIndex = incidents.findIndex(i => i.id === incidentId);

            if (incidentIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Incident with ID ${incidentId} not found`
                });
            }

            incidents.splice(incidentIndex, 1);
            await this.saveIncidents(incidents);

            res.json({
                message: 'Incident deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteIncident:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to delete incident'
            });
        }
    }
}

export default new IncidentsController();