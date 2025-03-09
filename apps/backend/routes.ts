import { Router } from 'express';
import {
    getAllQuizItems,
    getQuizItemsByTopic,
    getQuizItemById,
    // import your controller logic here
} from './controllers';

const router = Router();


router.get('/quiz', getAllQuizItems as any);
router.get('/quiz/:topic', getQuizItemsByTopic as any);
router.get('/quiz/:id', getQuizItemById as any);


// router.get('/', doSomethingController as any)
// will return the result of your doSomethingController
export default router;