import express from 'express';
import actorsController from '../controllers/actorsController.js';

const router = express.Router();

// GET /api/actors - Get all threat actors with optional filtering
router.get('/', actorsController.getActors.bind(actorsController));

// GET /api/actors/:id - Get specific threat actor by ID
router.get('/:id', actorsController.getActorById.bind(actorsController));

// POST /api/actors - Create new threat actor
router.post('/', actorsController.createActor.bind(actorsController));

// PUT /api/actors/:id - Update existing threat actor
router.put('/:id', actorsController.updateActor.bind(actorsController));

// DELETE /api/actors/:id - Delete threat actor
router.delete('/:id', actorsController.deleteActor.bind(actorsController));

export default router;