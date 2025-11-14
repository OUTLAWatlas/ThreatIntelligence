import express from 'express';
import feedsController from '../controllers/feedsController.js';

const router = express.Router();

// GET /api/feeds - Get all threat feeds with optional filtering
router.get('/', feedsController.getFeeds.bind(feedsController));

// GET /api/feeds/:id - Get specific threat feed by ID
router.get('/:id', feedsController.getFeedById.bind(feedsController));

// POST /api/feeds - Create new threat feed
router.post('/', feedsController.createFeed.bind(feedsController));

// PUT /api/feeds/:id - Update existing threat feed
router.put('/:id', feedsController.updateFeed.bind(feedsController));

// DELETE /api/feeds/:id - Delete threat feed
router.delete('/:id', feedsController.deleteFeed.bind(feedsController));

export default router;