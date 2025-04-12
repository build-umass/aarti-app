import { Router } from 'express';
import {
    createQuizItem,
    updateQuizItem,
    deleteQuizItem,
    getAllQuizItems,
    getQuizItemsByTopic,
    getQuizItemById,
    // import your controller logic here
} from './controllers';

const router = Router();


router.post('/quiz', createQuizItem as any);
router.put('/quiz/:id', updateQuizItem as any);
router.delete('/quiz/:id', deleteQuizItem as any);
router.get('/quiz', getAllQuizItems as any);
router.get('/quiz/topic/:topic', getQuizItemsByTopic as any);
router.get('/quiz/:id', getQuizItemById as any);


// router.get('/', doSomethingController as any)
// will return the result of your doSomethingController
export default router;