import express from 'express';

const router = express.Router();

// Admin access only
router.route('/').get().post();
router.route('/:id').get().patch().delete();

export default router;
