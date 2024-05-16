import express from 'express'
const router = express.Router();
import { createEntity , createEntry , getEntries , updateEntry , deleteEntry , addAttribute } from './controllers.js';

router.post('/entities', createEntity);
router.post('/:entity', createEntry);
router.get('/:entity', getEntries);
router.put('/:entity/:id', updateEntry);
router.delete('/:entity/:id', deleteEntry);
router.post('/entities/add-attribute', addAttribute);

export default router;