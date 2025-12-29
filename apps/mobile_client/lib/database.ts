import React from 'react';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { createClient } from '@libsql/client';
import quizDataFile from '../assets/quizData.json';

// Database instance
let db: SQLiteDatabase | null = null;

// Initialize database - using async API for all platforms
export const initializeDatabase = async () => {
  if (!db) {
    // Use async API for all platforms (web and native)
    db = await openDatabaseAsync('aarti_app.db');
    
    // Create tables if they don't exist
    await createTables();
  }
  return db;
};

// Create database tables
async function createTables() {
  if (!db) throw new Error('Database not initialized');

  await db.execAsync(`
    -- User settings table
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      username TEXT NOT NULL DEFAULT 'Example User',
      onboarding_completed INTEGER DEFAULT 0,
      first_launch_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      CHECK (id = 1)
    );

    -- Topics table
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Quiz questions table
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      feedback TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    );

    -- Quiz progress table
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      selected_answer TEXT,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
    );

    -- Bookmarks table
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
    );

    -- Knowledge base table for RAG chatbot
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      embedding TEXT, -- JSON array of embedding values (nullable)
      metadata TEXT, -- JSON metadata
      content_type TEXT DEFAULT 'quiz', -- 'quiz', 'resource', 'general'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_id ON quiz_questions(topic_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_progress_question_id ON quiz_progress(question_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON bookmarks(question_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_type ON knowledge_base(content_type);
  `);

  // Run migrations for existing databases
  await runMigrations();

  console.log('Database tables created successfully');
}

// Migration function to add new columns to existing tables
async function runMigrations() {
  if (!db) throw new Error('Database not initialized');

  try {
    // Check if onboarding_completed column exists
    const tableInfo = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(user_settings)"
    );
    const columnNames = tableInfo.map(col => col.name);

    // Add onboarding_completed column if it doesn't exist
    if (!columnNames.includes('onboarding_completed')) {
      console.log('Adding onboarding_completed column to user_settings table');
      await db.execAsync(
        'ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER DEFAULT 0'
      );
    }

    // Add first_launch_date column if it doesn't exist
    if (!columnNames.includes('first_launch_date')) {
      console.log('Adding first_launch_date column to user_settings table');
      await db.execAsync(
        'ALTER TABLE user_settings ADD COLUMN first_launch_date TEXT'
      );
    }

    // Check knowledge_base table schema and recreate if needed
    const kbTableInfo = await db.getAllAsync<{ name: string; type: string; notnull: number }>(
      "PRAGMA table_info(knowledge_base)"
    );

    if (kbTableInfo.length > 0) {
      const embeddingCol = kbTableInfo.find(col => col.name === 'embedding');
      if (embeddingCol && embeddingCol.notnull === 1) {
        console.log('Found old schema with NOT NULL embedding column, recreating tables...');
        // Drop and recreate tables with correct schema
        await db.runAsync('DROP TABLE IF EXISTS knowledge_base');
        await db.runAsync('DROP TABLE IF EXISTS vector_embeddings');

        await db.execAsync(`
          CREATE TABLE knowledge_base (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            embedding TEXT,
            metadata TEXT,
            content_type TEXT DEFAULT 'resource',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE vector_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id TEXT NOT NULL,
            embedding TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX idx_vector_embeddings_content_id ON vector_embeddings(content_id);
        `);

        console.log('Tables recreated with correct schema');
      } else {
        console.log('Knowledge base table schema looks good');
      }
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Simple migration status hook that doesn't violate Rules of Hooks
export const useDatabaseMigrations = () => {
  const [migrationStatus, setMigrationStatus] = React.useState<{
    success: boolean;
    error: Error | null;
  }>({ success: false, error: null });

  React.useEffect(() => {
    if (db) {
      // Database is initialized, migrations are handled by the SQL file
      // Since we're using a simple schema setup, we consider migrations successful
      setMigrationStatus({ success: true, error: null });
    } else {
      setMigrationStatus({ success: false, error: null });
    }
  }, [db]);

  return migrationStatus;
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
    // Check each data type independently to determine what needs seeding
    const existingUser = await database.getFirstAsync('SELECT * FROM user_settings LIMIT 1');
    const existingTopics = await database.getFirstAsync('SELECT * FROM topics LIMIT 1');
    const existingQuestions = await database.getFirstAsync('SELECT * FROM quiz_questions LIMIT 1');

    // Seed user if missing
    if (!existingUser) {
      console.log('Seeding default user...');
      await database.runAsync(
        'INSERT OR IGNORE INTO user_settings (id, username, onboarding_completed) VALUES (?, ?, ?)',
        [1, 'Example User', 0]
      );
      console.log('Default user created with onboarding_completed = 0');
    }

    // Seed topics if missing
    if (!existingTopics) {
      console.log('Seeding topics...');
      const topics = [...new Set(quizDataFile.quizzes.map((quiz: any) => quiz.topic))];
      for (const topic of topics) {
        await database.runAsync(
          'INSERT OR IGNORE INTO topics (name) VALUES (?)',
          [topic]
        );
      }
    }

    // Seed quiz questions if missing
    if (!existingQuestions) {
      console.log('Seeding quiz questions...');

      // Get topic IDs (they should exist by now)
      const topicRecords = await database.getAllAsync<{ id: number; name: string }>('SELECT id, name FROM topics');
      const topicMap = new Map(topicRecords.map(t => [t.name, t.id]));

      // Insert quiz questions
      for (const quiz of quizDataFile.quizzes) {
        const topicId = topicMap.get(quiz.topic);
        if (topicId) {
          await database.runAsync(
            'INSERT OR IGNORE INTO quiz_questions (id, topic_id, title, question, options, correct_answer, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              quiz.id,
              topicId,
              quiz.title,
              quiz.question,
              JSON.stringify(quiz.options),
              quiz.correctAnswer,
              quiz.feedback
            ]
          );
        }
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Initialize vector database
export const initializeVectorDatabase = async () => {
  const { initializeVectorDB } = await import('./vector-db');
  await initializeVectorDB();
};
