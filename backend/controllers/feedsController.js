import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FeedsController {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/feeds.json');
    }

    async loadFeeds() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading feeds data:', error);
            return [];
        }
    }

    async saveFeeds(feeds) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(feeds, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving feeds data:', error);
            return false;
        }
    }

    // GET /api/feeds
    async getFeeds(req, res) {
        try {
            const feeds = await this.loadFeeds();
            const { search, type, status, reliability, limit = 50, offset = 0 } = req.query;
            
            let filteredFeeds = feeds;

            // Apply filters
            if (search) {
                const searchLower = search.toLowerCase();
                filteredFeeds = filteredFeeds.filter(feed => 
                    feed.name.toLowerCase().includes(searchLower) ||
                    feed.description.toLowerCase().includes(searchLower) ||
                    feed.source_organization.toLowerCase().includes(searchLower)
                );
            }

            if (type) {
                filteredFeeds = filteredFeeds.filter(feed => 
                    feed.type.toLowerCase() === type.toLowerCase()
                );
            }

            if (status) {
                filteredFeeds = filteredFeeds.filter(feed => 
                    feed.status.toLowerCase() === status.toLowerCase()
                );
            }

            if (reliability) {
                filteredFeeds = filteredFeeds.filter(feed => 
                    feed.reliability.toLowerCase() === reliability.toLowerCase()
                );
            }

            // Apply pagination
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            const paginatedFeeds = filteredFeeds.slice(startIndex, endIndex);

            res.json({
                data: paginatedFeeds,
                meta: {
                    total: filteredFeeds.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: endIndex < filteredFeeds.length
                }
            });
        } catch (error) {
            console.error('Error in getFeeds:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve threat feeds'
            });
        }
    }

    // GET /api/feeds/:id
    async getFeedById(req, res) {
        try {
            const feeds = await this.loadFeeds();
            const feedId = parseInt(req.params.id);
            const feed = feeds.find(f => f.id === feedId);

            if (!feed) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat feed with ID ${feedId} not found`
                });
            }

            res.json(feed);
        } catch (error) {
            console.error('Error in getFeedById:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve threat feed'
            });
        }
    }

    // POST /api/feeds
    async createFeed(req, res) {
        try {
            const feeds = await this.loadFeeds();
            const {
                name,
                type,
                url,
                description,
                status = 'Active',
                update_frequency,
                reliability = 'Medium',
                tags = [],
                data_types = [],
                format,
                authentication,
                source_organization,
                tlp_levels = [],
                categories = []
            } = req.body;

            // Validation
            if (!name || !type || !url || !description) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Name, type, URL, and description are required fields'
                });
            }

            // Generate new ID
            const newId = Math.max(...feeds.map(f => f.id), 0) + 1;
            
            const newFeed = {
                id: newId,
                name,
                type,
                url,
                description,
                status,
                last_updated: new Date().toISOString(),
                update_frequency,
                reliability,
                tags,
                data_types,
                format,
                authentication,
                total_indicators: 0,
                new_indicators_today: 0,
                source_organization,
                tlp_levels,
                categories
            };

            feeds.push(newFeed);
            await this.saveFeeds(feeds);

            res.status(201).json({
                message: 'Threat feed created successfully',
                data: newFeed
            });
        } catch (error) {
            console.error('Error in createFeed:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to create threat feed'
            });
        }
    }

    // PUT /api/feeds/:id
    async updateFeed(req, res) {
        try {
            const feeds = await this.loadFeeds();
            const feedId = parseInt(req.params.id);
            const feedIndex = feeds.findIndex(f => f.id === feedId);

            if (feedIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat feed with ID ${feedId} not found`
                });
            }

            // Update feed with new last_updated timestamp
            const updatedFeed = { 
                ...feeds[feedIndex], 
                ...req.body, 
                id: feedId,
                last_updated: new Date().toISOString()
            };
            
            feeds[feedIndex] = updatedFeed;
            await this.saveFeeds(feeds);

            res.json({
                message: 'Threat feed updated successfully',
                data: feeds[feedIndex]
            });
        } catch (error) {
            console.error('Error in updateFeed:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update threat feed'
            });
        }
    }

    // DELETE /api/feeds/:id
    async deleteFeed(req, res) {
        try {
            const feeds = await this.loadFeeds();
            const feedId = parseInt(req.params.id);
            const feedIndex = feeds.findIndex(f => f.id === feedId);

            if (feedIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Threat feed with ID ${feedId} not found`
                });
            }

            feeds.splice(feedIndex, 1);
            await this.saveFeeds(feeds);

            res.json({
                message: 'Threat feed deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteFeed:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to delete threat feed'
            });
        }
    }
}

export default new FeedsController();