import { QuizItem, IQuizItem } from './models/QuizItem';

export async function createQuizItem(quizItemData: {
  id: number;
  topic: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  feedback: string;
}) {
  try {
    const quizItem = new QuizItem(quizItemData);
    return await quizItem.save();
  } catch (error) {
    console.error("Error creating quiz item:", error);
    throw error;
  }
}

export async function getAllQuizItems() {
  try {
    return await QuizItem.find().sort({ id: 1 });
  } catch (error) {
    console.error("Error finding quiz items:", error);
    throw error;
  }
}

export async function getQuizItemsByTopic(topic: string) {
  try {
    return await QuizItem.find({ topic });
  } catch (error) {
    console.error(`Error finding quiz items for topic "${topic}":`, error);
    throw error;
  }
}

export async function getQuizItemById(id: number) {
  try {
    return await QuizItem.findOne({ id });
  } catch (error) {
    console.error(`Error finding quiz item with ID ${id}:`, error);
    throw error;
  }
}

export async function updateQuizItem(id: number, updateData: Partial<Omit<IQuizItem, 'id'>>) {
  try {
    return await QuizItem.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error(`Error updating quiz item with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteQuizItem(id: number) {
  try {
    return await QuizItem.findOneAndDelete({ id });
  } catch (error) {
    console.error(`Error deleting quiz item with ID ${id}:`, error);
    throw error;
  }
}

export async function getNextQuizItemId() {
  try {
    const highestItem = await QuizItem.findOne().sort({ id: -1 });
    return highestItem ? highestItem.id + 1 : 1;
  } catch (error) {
    console.error("Error getting next quiz item ID:", error);
    throw error;
  }
}