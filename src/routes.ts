import express from 'express'
const router = express.Router();
import { createEntity , createEntry , getEntries , updateEntry , deleteEntry } from './controllers.js';

router.post('/entities', createEntity);
router.post('/:entity', createEntry);
router.get('/:entity', getEntries);
router.put('/:entity/:id', updateEntry);
router.delete('/:entity/:id', deleteEntry);

export default router;