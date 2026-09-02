import { Request, Response } from 'express';
import * as services from './services';
import { IQuizItem } from './models/QuizItem';

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
