import { Router } from 'express';
import {
    createQuizItem,
    updateQuizItem,
    deleteQuizItem,
    getAllQuizItems,
    getQuizItemsByTopic,
    getQuizItemById,
    createResource,
    getAllResources,
    getResourceById,
    getResourceByTitle,
    updateResource,
    deleteResource,
    publishResource,
    uploadResource,
    resourceUploadMiddleware,
} from './controllers';

const router = Router();

router.post('/quiz', createQuizItem);
router.put('/quiz/:id', updateQuizItem);
router.delete('/quiz/:id', deleteQuizItem);
router.get('/quiz', getAllQuizItems);
router.get('/quiz/topic/:topic', getQuizItemsByTopic);
router.get('/quiz/:id', getQuizItemById);

router.get('/resource', getAllResources);
router.post('/resource', createResource);
router.post('/resource/upload', resourceUploadMiddleware, uploadResource);
router.get('/resource/title/:title', getResourceByTitle);
router.get('/resource/:id', getResourceById);
router.put('/resource/:id', updateResource);
router.delete('/resource/:id', deleteResource);
router.post('/resource/:id/publish', publishResource);

export default router;
