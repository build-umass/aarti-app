import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// User settings table (single user per device)
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey().default(1),
  username: text('username').notNull().default('Example User'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Topics table
export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Quiz questions table
export const quizQuestions = sqliteTable('quiz_questions', {
  id: integer('id').primaryKey(),
  topicId: integer('topic_id').notNull().references(() => topics.id),
  title: text('title').notNull(),
  question: text('question').notNull(),
  options: text('options').notNull(), // JSON string
  correctAnswer: text('correct_answer').notNull(),
  feedback: text('feedback').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Quiz progress table
export const quizProgress = sqliteTable('quiz_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => quizQuestions.id),
  selectedAnswer: text('selected_answer'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => quizQuestions.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Types for TypeScript
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;

export type QuizProgress = typeof quizProgress.$inferSelect;
export type NewQuizProgress = typeof quizProgress.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
