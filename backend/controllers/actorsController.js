import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ActorsController {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/actors.json');
    }

    async loadActors() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading actors data:', error);
            return [];
        }
    }

    async saveActors(actors) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(actors, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving actors data:', error);
            return false;
        }
    }

    // GET /api/actors
    async getActors(req, res) {
        try {
            const actors = await this.loadActors();
            const { search, origin, status, limit = 50, offset = 0 } = req.query;
            
            let filteredActors = actors;

            // Apply filters
            if (search) {
                const searchLower = search.toLowerCase();
                filteredActors = filteredActors.filter(actor => 
                    actor.name.toLowerCase().includes(searchLower) ||
                    actor.description.toLowerCase().includes(searchLower) ||
                    actor.alias.some(alias => alias.toLowerCase().includes(searchLower))
                );
            }

            if (origin) {
                filteredActors = filteredActors.filter(actor => 
                    actor.origin.toLowerCase() === origin.toLowerCase()
                );
            }

            if (status) {
                filteredActors = filteredActors.filter(actor => 
                    actor.status.toLowerCase() === status.toLowerCase()
                );
            }

            // Apply pagination
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            const paginatedActors = filteredActors.slice(startIndex, endIndex);

            res.json({
                data: paginatedActors,
                meta: {
                    total: filteredActors.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: endIndex < filteredActors.length
                }
            });
        } catch (error) {
            console.error('Error in getActors:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve threat actors'
            });
        }
    }

    // GET /api/actors/:id
    async getActorById(req, res) {
        try {
            const actors = await this.loadActors();
            const actorId = parseInt(req.params.id);
            const actor = actors.find(a => a.id === actorId);

            if (!actor) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat actor with ID ${actorId} not found`
                });
            }

            res.json(actor);
        } catch (error) {
            console.error('Error in getActorById:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve threat actor'
            });
        }
    }

    // POST /api/actors
    async createActor(req, res) {
        try {
            const actors = await this.loadActors();
            const {
                name,
                alias = [],
                origin,
                tactics = [],
                techniques = [],
                description,
                sophistication,
                motivation = [],
                targets = [],
                status = 'Active'
            } = req.body;

            // Validation
            if (!name || !origin || !description) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Name, origin, and description are required fields'
                });
            }

            // Generate new ID
            const newId = Math.max(...actors.map(a => a.id), 0) + 1;
            
            const newActor = {
                id: newId,
                name,
                alias,
                origin,
                firstSeen: new Date().toISOString().split('T')[0],
                lastSeen: new Date().toISOString().split('T')[0],
                tactics,
                techniques,
                description,
                sophistication,
                motivation,
                targets,
                status
            };

            actors.push(newActor);
            await this.saveActors(actors);

            res.status(201).json({
                message: 'Threat actor created successfully',
                data: newActor
            });
        } catch (error) {
            console.error('Error in createActor:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to create threat actor'
            });
        }
    }

    // PUT /api/actors/:id
    async updateActor(req, res) {
        try {
            const actors = await this.loadActors();
            const actorId = parseInt(req.params.id);
            const actorIndex = actors.findIndex(a => a.id === actorId);

            if (actorIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat actor with ID ${actorId} not found`
                });
            }

            // Update actor
            actors[actorIndex] = { ...actors[actorIndex], ...req.body, id: actorId };
            await this.saveActors(actors);

            res.json({
                message: 'Threat actor updated successfully',
                data: actors[actorIndex]
            });
        } catch (error) {
            console.error('Error in updateActor:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update threat actor'
            });
        }
    }

    // DELETE /api/actors/:id
    async deleteActor(req, res) {
        try {
            const actors = await this.loadActors();
            const actorId = parseInt(req.params.id);
            const actorIndex = actors.findIndex(a => a.id === actorId);

            if (actorIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat actor with ID ${actorId} not found`
                });
            }

            actors.splice(actorIndex, 1);
            await this.saveActors(actors);

            res.json({
                message: 'Threat actor deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteActor:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to delete threat actor'
            });
        }
    }
}

export default new ActorsController();