import { Router } from 'express';
import {
    createQuizItem,
    updateQuizItem,
    deleteQuizItem,
    getAllQuizItems,
    getQuizItemsByTopic,
    getQuizItemById,
} from './controllers';

const router = Router();

router.post('/quiz', createQuizItem);
router.put('/quiz/:id', updateQuizItem);
router.delete('/quiz/:id', deleteQuizItem);
router.get('/quiz', getAllQuizItems);
router.get('/quiz/topic/:topic', getQuizItemsByTopic);
router.get('/quiz/:id', getQuizItemById);

export default router;
