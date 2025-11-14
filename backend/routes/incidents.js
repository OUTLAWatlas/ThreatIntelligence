import express from 'express';
import incidentsController from '../controllers/incidentsController.js';

const router = express.Router();

// GET /api/incidents - Get all incidents with optional filtering
router.get('/', incidentsController.getIncidents.bind(incidentsController));

// GET /api/incidents/:id - Get specific incident by ID
router.get('/:id', incidentsController.getIncidentById.bind(incidentsController));

// POST /api/incidents - Create new incident
router.post('/', incidentsController.createIncident.bind(incidentsController));

// PUT /api/incidents/:id - Update existing incident
router.put('/:id', incidentsController.updateIncident.bind(incidentsController));

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', incidentsController.deleteIncident.bind(incidentsController));

export default router;