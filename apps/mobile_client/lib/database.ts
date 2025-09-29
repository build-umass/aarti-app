import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from '../db/schema';
import quizDataFile from '../assets/quizData.json';
import migrations from '../drizzle/migrations';

// Database instance
let db: ReturnType<typeof drizzle> | null = null;

// Initialize database
export const initializeDatabase = () => {
  if (!db) {
    const expoDb = openDatabaseSync('aarti_app.db');
    db = drizzle(expoDb, { schema });
  }
  return db;
};

// Hook for migrations
export const useDatabaseMigrations = () => {
  if (!db) {
    return { success: false, error: new Error('Database not initialized') };
  }
  const database = getDatabase();
  return useMigrations(database, migrations);
};

// Get database instance
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Seed initial data
export const seedInitialData = async () => {
  const database = getDatabase();
  
  try {
    // Check if data already exists
    const existingUser = await database.select().from(schema.userSettings).limit(1);
    if (existingUser.length > 0) {
      return; // Data already seeded
    }

    // Insert default user
    await database.insert(schema.userSettings).values({
      id: 1,
      username: 'Example User',
    });

    // Insert topics
    const topics = [...new Set(quizDataFile.quizzes.map((quiz: any) => quiz.topic))];
    const topicInserts = topics.map(topic => ({ name: topic }));
    await database.insert(schema.topics).values(topicInserts);

    // Get topic IDs
    const topicRecords = await database.select().from(schema.topics);
    const topicMap = new Map(topicRecords.map(t => [t.name, t.id]));

    // Insert quiz questions
    const questionInserts: Array<{
      id: number;
      topicId: number;
      title: string;
      question: string;
      options: string;
      correctAnswer: string;
      feedback: string;
    }> = [];

    for (const quiz of quizDataFile.quizzes) {
      const topicId = topicMap.get(quiz.topic);
      if (topicId) {
        questionInserts.push({
          id: quiz.id,
          topicId,
          title: quiz.title,
          question: quiz.question,
          options: JSON.stringify(quiz.options),
          correctAnswer: quiz.correctAnswer,
          feedback: quiz.feedback,
        });
      }
    }

    if (questionInserts.length > 0) {
      await database.insert(schema.quizQuestions).values(questionInserts);
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Export schema for use in other files
export { schema };
