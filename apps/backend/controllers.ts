import { Request, Response } from 'express';
import multer from 'multer';
import * as services from './services';
import { IQuizItem } from './models/QuizItem';
import { ResourceInput } from './models/Resource';

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function createQuizItem(req: Request, res: Response) {
  try {
    const { id, topic, title, question, options, correctAnswer, feedback } = req.body as IQuizItem;

    const newQuizItem = await services.createQuizItem({ id, topic, title, question, options, correctAnswer, feedback });

    res.status(201).json(newQuizItem);
  } catch (error) {
    console.error('Error creating quiz item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateQuizItem(req: Request, res: Response) {
  try {
    const {topic, title, question, options, correctAnswer, feedback } = req.body as IQuizItem;
    const quizItemId = parseInt(req.params.id);
    const updatedQuizItem = await services.updateQuizItem(quizItemId, { topic, title, question, options, correctAnswer, feedback });

    if (!updatedQuizItem) {
      res.status(404).json({ error: 'No quiz item with that id found' });
      return;
    }

    res.status(200).json(updatedQuizItem);
  } catch (error) {
    console.error('Error updating quiz item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteQuizItem(req: Request, res: Response) {
  try {
    const quizItemId = parseInt(req.params.id);
    const deletedQuizItem = await services.deleteQuizItem(quizItemId);

    if (!deletedQuizItem) {
      res.status(404).json({ error: 'No quiz item with that id found' });
      return;
    }

    res.status(200).json(deletedQuizItem);
  } catch (error) {
    console.error('Error deleting quiz item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllQuizItems(_req: Request, res: Response) {
  try {
    const quizItems = await services.getAllQuizItems();

    if (!quizItems) {
      res.status(400).json({ error: 'No quiz items found' });
      return;
    }

    res.status(200).json(quizItems);
  } catch (error) {
    console.error('Error getting all quiz items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQuizItemsByTopic(req: Request, res: Response) {
  try {
    const topic = req.params.topic as string;

    const quizItems = await services.getQuizItemsByTopic(topic);

    if (!quizItems) {
      res.status(404).json({ error: 'No quiz items with that topic found' });
      return;
    }

    res.status(200).json(quizItems);
  } catch (error) {
    console.error('Error getting quiz items by topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQuizItemById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    const quizItem = await services.getQuizItemById(id);

    if (!quizItem) {
      res.status(404).json({ error: 'No quiz item  with that id found' });
      return;
    }

    res.status(200).json(quizItem);
  } catch (error) {
    console.error('Error getting quiz item by id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createResource(req: Request, res: Response) {
  try {
    const { topic, title, content, isPublished } = req.body as ResourceInput;

    if (!topic || !title) {
      res.status(400).json({ error: 'topic and title are required' });
      return;
    }

    const newResource = await services.createResource({ topic, title, content, isPublished });

    res.status(201).json(newResource);
  } catch (error) {
    if ((error as { name?: string })?.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllResources(_req: Request, res: Response) {
  try {
    const resources = await services.getAllResources();

    res.status(200).json(resources);
  } catch (error) {
    console.error('Error getting all resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getResourceById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    const resource = await services.getResourceById(id);

    if (!resource) {
      res.status(404).json({ error: 'No resource with that id found' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error getting resource by id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getResourceByTitle(req: Request, res: Response) {
  try {
    const title = req.params.title as string;

    const resource = await services.getResourceByTitle(title);

    if (!resource) {
      res.status(404).json({ error: 'No resource with that title found' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error getting resource by title:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateResource(req: Request, res: Response) {
  try {
    const { topic, title, content, isPublished } = req.body as ResourceInput;
    const resourceId = parseInt(req.params.id);
    const updatedResource = await services.updateResource(resourceId, { topic, title, content, isPublished });

    if (!updatedResource) {
      res.status(404).json({ error: 'No resource with that id found' });
      return;
    }

    res.status(200).json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteResource(req: Request, res: Response) {
  try {
    const resourceId = parseInt(req.params.id);
    const deletedResource = await services.deleteResource(resourceId);

    if (!deletedResource) {
      res.status(404).json({ error: 'No resource with that id found' });
      return;
    }

    res.status(200).json(deletedResource);
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function publishResource(req: Request, res: Response) {
  try {
    const resourceId = parseInt(req.params.id);
    const publishedResource = await services.publishResource(resourceId);

    if (!publishedResource) {
      res.status(404).json({ error: 'No resource with that id found' });
      return;
    }

    res.status(200).json(publishedResource);
  } catch (error) {
    console.error('Error publishing resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadResource(req: Request, res: Response) {
  try {
    const file = req.file;
    const { topic, title } = req.body as { topic?: string; title?: string };

    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are accepted' });
      return;
    }

    if (!topic || !title) {
      res.status(400).json({ error: 'topic and title are required' });
      return;
    }

    const newResource = await services.createResource({ topic, title, content: '', isPublished: false });

    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const resourceUploadMiddleware = resourceUpload.single('pdf');
