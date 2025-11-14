import express from 'express';
import indicatorsController from '../controllers/indicatorsController.js';

const router = express.Router();

// GET /api/indicators - Get all indicators with optional filtering
router.get('/', indicatorsController.getIndicators.bind(indicatorsController));

// GET /api/indicators/:id - Get specific indicator by ID
router.get('/:id', indicatorsController.getIndicatorById.bind(indicatorsController));

// POST /api/indicators - Create new indicator
router.post('/', indicatorsController.createIndicator.bind(indicatorsController));

// PUT /api/indicators/:id - Update existing indicator
router.put('/:id', indicatorsController.updateIndicator.bind(indicatorsController));

// DELETE /api/indicators/:id - Delete indicator
router.delete('/:id', indicatorsController.deleteIndicator.bind(indicatorsController));

export default router;