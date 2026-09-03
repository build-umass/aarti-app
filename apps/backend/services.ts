import { QuizItem, IQuizItem, QuizItemInput } from './models/QuizItem';
import { Resource, IResource, ResourceInput } from './models/Resource';

export async function createQuizItem(quizItemData: QuizItemInput) {
  try {
    // Validation runs before pre('save') hooks in Mongoose, so the id must be
    // assigned here rather than in a hook. The unique index still guards
    // against concurrent duplicates.
    const lastQuizItem = await QuizItem.findOne().sort({ id: -1 });
    const quizItem = new QuizItem({
      ...quizItemData,
      id: lastQuizItem ? lastQuizItem.id + 1 : 1,
    });
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
    const quizItem = await QuizItem.findOne({ id });
    if (!quizItem) {
      throw new Error(`Quiz item with ID ${id} not found`);
    }

    // Assigning undefined unsets a Mongoose path, which fails required-field
    // validation on partial updates; drop undefined entries first.
    const changes = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );
    Object.assign(quizItem, changes);
    return await quizItem.save();
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

export async function createResource(resourceData: ResourceInput) {
  try {
    const lastResource = await Resource.findOne().sort({ id: -1 });
    const resource = new Resource({
      ...resourceData,
      id: lastResource ? lastResource.id + 1 : 1,
    });
    return await resource.save();
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

export async function getAllResources() {
  try {
    return await Resource.find().sort({ id: 1 });
  } catch (error) {
    console.error('Error finding resources:', error);
    throw error;
  }
}

export async function getResourceById(id: number) {
  try {
    return await Resource.findOne({ id });
  } catch (error) {
    console.error(`Error finding resource with ID ${id}:`, error);
    throw error;
  }
}

export async function getResourceByTitle(title: string) {
  try {
    return await Resource.findOne({ title });
  } catch (error) {
    console.error(`Error finding resource with title "${title}":`, error);
    throw error;
  }
}

export async function updateResource(id: number, updateData: Partial<Omit<IResource, 'id'>>) {
  try {
    const resource = await Resource.findOne({ id });
    if (!resource) {
      return null;
    }

    const changes = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );
    Object.assign(resource, changes);
    return await resource.save();
  } catch (error) {
    console.error(`Error updating resource with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteResource(id: number) {
  try {
    return await Resource.findOneAndDelete({ id });
  } catch (error) {
    console.error(`Error deleting resource with ID ${id}:`, error);
    throw error;
  }
}

export async function publishResource(id: number) {
  try {
    const resource = await Resource.findOne({ id });
    if (!resource) {
      return null;
    }

    resource.isPublished = true;
    return await resource.save();
  } catch (error) {
    console.error(`Error publishing resource with ID ${id}:`, error);
    throw error;
  }
}