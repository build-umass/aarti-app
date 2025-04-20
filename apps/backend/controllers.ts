import { Request, Response } from 'express';
import * as services from './services';
import { IQuizItem } from 'models/QuizItem';

export async function nothing() {} // to make it a module => if you add a function, you can remove

 
export async function createQuizItem(req: Request, res: Response) {
  try {
    const { id, topic, title, question, options, correctAnswer, feedback } = req.body as IQuizItem;

    const newQuizItem = await services.createQuizItem({ id, topic, title, question, options, correctAnswer, feedback });

    return res.status(201).json(newQuizItem);

  } catch (error) {
    console.error('Error creating quiz item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateQuizItem(req: Request, res: Response) {
  try {
    const {topic, title, question, options, correctAnswer, feedback } = req.body as IQuizItem;
    const quizItemId = parseInt(req.params.id);
    const updatedQuizItem = await services.updateQuizItem(quizItemId, { topic, title, question, options, correctAnswer, feedback });

    if (!updatedQuizItem) {
      return res.status(404).json({ error: 'No quiz item with that id found' });
    }

    return res.status(200).json(updatedQuizItem);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteQuizItem(req: Request, res: Response) {
  try {
    const quizItemId = parseInt(req.params.id);
    const deletedQuizItem = await services.deleteQuizItem(quizItemId);

    if (!deletedQuizItem) {
      return res.status(404).json({ error: 'No quiz item with that id found' });
    }

    return res.status(200).json(deletedQuizItem);

  } catch (error) {
    console.error('Error deleting quiz item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllQuizItems(_req: Request, res: Response) {
  try {
    const quizItems = await services.getAllQuizItems();

    if (!quizItems) {
      return res.status(400).json({ error: 'No quiz items found' });
    }

    return res.status(200).json(quizItems);

  } catch (error) {
    console.error('Error getting all quiz items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQuizItemsByTopic(req: Request, res: Response) {
  try {
    const topic = req.params.topic as string;

    const quizItems = await services.getQuizItemsByTopic(topic);

    if (!quizItems) {
      return res.status(404).json({ error: 'No quiz items with that topic found' });
    }

    return res.status(200).json(quizItems);

  } catch (error) {
    console.error('Error getting quiz items by topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQuizItemById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    const quizItem = await services.getQuizItemById(id);

    if (!quizItem) {
      return res.status(404).json({ error: 'No quiz item  with that id found' });
    }

    return res.status(200).json(quizItem);

  } catch (error) {
    console.error('Error getting quiz item by id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


/*
export async function somethingController(req: Request, res: Response) {
  try {

    const { x, y, z } = req.body as RequestBodyInterface;  => for type safety, define an interface so you know what you are getting

    const returnObject = services.doSomething(x,y,z) => services usually interact with the database, or call other services etc.

    if (!returnObject) {
      return res.status(400).json({ error: 'We tried to do something and it failed, but we know exactly what went wrong so we can return you a nice error code for clarity'})
    }

    const responseBody: ResponseBodyInterface = { obj: returnObject };
    return res.status(201).json(responseBody);

  } catch (error) {
    console.error('We got an error but it wasn't expected, so log it:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
*/

