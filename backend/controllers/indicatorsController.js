import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IndicatorsController {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/indicators.json');
    }

    async loadIndicators() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading indicators data:', error);
            return [];
        }
    }

    async saveIndicators(indicators) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(indicators, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving indicators data:', error);
            return false;
        }
    }

    // GET /api/indicators
    async getIndicators(req, res) {
        try {
            const indicators = await this.loadIndicators();
            const { search, type, confidence, status, limit = 50, offset = 0 } = req.query;
            
            let filteredIndicators = indicators;

            // Apply filters
            if (search) {
                const searchLower = search.toLowerCase();
                filteredIndicators = filteredIndicators.filter(indicator => 
                    indicator.value.toLowerCase().includes(searchLower) ||
                    indicator.description.toLowerCase().includes(searchLower) ||
                    indicator.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }

            if (type) {
                filteredIndicators = filteredIndicators.filter(indicator => 
                    indicator.type.toLowerCase() === type.toLowerCase()
                );
            }

            if (confidence) {
                const confLevel = parseInt(confidence);
                filteredIndicators = filteredIndicators.filter(indicator => 
                    indicator.confidence >= confLevel
                );
            }

            if (status) {
                filteredIndicators = filteredIndicators.filter(indicator => 
                    indicator.status.toLowerCase() === status.toLowerCase()
                );
            }

            // Apply pagination
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            const paginatedIndicators = filteredIndicators.slice(startIndex, endIndex);

            res.json({
                data: paginatedIndicators,
                meta: {
                    total: filteredIndicators.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: endIndex < filteredIndicators.length
                }
            });
        } catch (error) {
            console.error('Error in getIndicators:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve indicators'
            });
        }
    }

    // GET /api/indicators/:id
    async getIndicatorById(req, res) {
        try {
            const indicators = await this.loadIndicators();
            const indicatorId = parseInt(req.params.id);
            const indicator = indicators.find(i => i.id === indicatorId);

            if (!indicator) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Indicator with ID ${indicatorId} not found`
                });
            }

            res.json(indicator);
        } catch (error) {
            console.error('Error in getIndicatorById:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve indicator'
            });
        }
    }

    // POST /api/indicators
    async createIndicator(req, res) {
        try {
            const indicators = await this.loadIndicators();
            const {
                type,
                value,
                confidence = 50,
                tags = [],
                source,
                description,
                tlp = 'WHITE',
                ioc = true,
                threat_types = [],
                status = 'Active'
            } = req.body;

            // Validation
            if (!type || !value || !source) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Type, value, and source are required fields'
                });
            }

            // Generate new ID
            const newId = Math.max(...indicators.map(i => i.id), 0) + 1;
            
            const newIndicator = {
                id: newId,
                type,
                value,
                confidence,
                tags,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                source,
                description,
                tlp,
                ioc,
                threat_types,
                status
            };

            indicators.push(newIndicator);
            await this.saveIndicators(indicators);

            res.status(201).json({
                message: 'Indicator created successfully',
                data: newIndicator
            });
        } catch (error) {
            console.error('Error in createIndicator:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to create indicator'
            });
        }
    }

    // PUT /api/indicators/:id
    async updateIndicator(req, res) {
        try {
            const indicators = await this.loadIndicators();
            const indicatorId = parseInt(req.params.id);
            const indicatorIndex = indicators.findIndex(i => i.id === indicatorId);

            if (indicatorIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Indicator with ID ${indicatorId} not found`
                });
            }

            // Update indicator
            indicators[indicatorIndex] = { ...indicators[indicatorIndex], ...req.body, id: indicatorId };
            await this.saveIndicators(indicators);

            res.json({
                message: 'Indicator updated successfully',
                data: indicators[indicatorIndex]
            });
        } catch (error) {
            console.error('Error in updateIndicator:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update indicator'
            });
        }
    }

    // DELETE /api/indicators/:id
    async deleteIndicator(req, res) {
        try {
            const indicators = await this.loadIndicators();
            const indicatorId = parseInt(req.params.id);
            const indicatorIndex = indicators.findIndex(i => i.id === indicatorId);

            if (indicatorIndex === -1) {
                return res.status(404).json({
                    error: 'Not found',
                    message: `Indicator with ID ${indicatorId} not found`
                });
            }

            indicators.splice(indicatorIndex, 1);
            await this.saveIndicators(indicators);

            res.json({
                message: 'Indicator deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteIndicator:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to delete indicator'
            });
        }
    }
}

export default new IndicatorsController();