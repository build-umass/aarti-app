import { eq, and, sql } from 'drizzle-orm';
import { getDatabase, schema } from '../lib/database';
import type { QuizQuestion, QuizProgress, Topic } from '../db/schema';

export class QuizService {
  /**
   * Get all topics
   */
  static async getTopics(): Promise<Topic[]> {
    const db = getDatabase();
    return await db.select().from(schema.topics).orderBy(schema.topics.name);
  }

  /**
   * Get all quiz questions
   */
  static async getQuizQuestions(topicId?: number): Promise<QuizQuestion[]> {
    const db = getDatabase();
    
    if (topicId) {
      return await db.select()
        .from(schema.quizQuestions)
        .where(eq(schema.quizQuestions.topicId, topicId))
        .orderBy(schema.quizQuestions.id);
    }
    
    return await db.select().from(schema.quizQuestions).orderBy(schema.quizQuestions.id);
  }

  /**
   * Get quiz question by ID
   */
  static async getQuizQuestion(questionId: number): Promise<QuizQuestion | null> {
    const db = getDatabase();
    const questions = await db.select()
      .from(schema.quizQuestions)
      .where(eq(schema.quizQuestions.id, questionId))
      .limit(1);
    
    return questions[0] || null;
  }

  /**
   * Get quiz progress for a question
   */
  static async getQuizProgress(questionId: number): Promise<QuizProgress | null> {
    const db = getDatabase();
    const progress = await db.select()
      .from(schema.quizProgress)
      .where(eq(schema.quizProgress.questionId, questionId))
      .limit(1);
    
    return progress[0] || null;
  }

  /**
   * Get all quiz progress
   */
  static async getAllQuizProgress(): Promise<QuizProgress[]> {
    const db = getDatabase();
    return await db.select().from(schema.quizProgress).orderBy(schema.quizProgress.questionId);
  }

  /**
   * Save quiz answer and mark as completed
   */
  static async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
    const db = getDatabase();
    
    await db.insert(schema.quizProgress)
      .values({
        questionId,
        selectedAnswer,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.quizProgress.questionId,
        set: {
          selectedAnswer,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
  }

  /**
   * Get selected answers for all questions
   */
  static async getSelectedAnswers(): Promise<Record<number, string>> {
    const db = getDatabase();
    const progress = await db.select({
      questionId: schema.quizProgress.questionId,
      selectedAnswer: schema.quizProgress.selectedAnswer,
    })
    .from(schema.quizProgress)
    .where(sql`${schema.quizProgress.selectedAnswer} IS NOT NULL`);
    
    const answers: Record<number, string> = {};
    progress.forEach(p => {
      if (p.selectedAnswer) {
        answers[p.questionId] = p.selectedAnswer;
      }
    });
    
    return answers;
  }

  /**
   * Get completed question IDs
   */
  static async getCompletedQuestions(topicId?: number): Promise<number[]> {
    const db = getDatabase();
    
    let query = db.select({ questionId: schema.quizProgress.questionId })
      .from(schema.quizProgress)
      .where(eq(schema.quizProgress.isCompleted, true));
    
    if (topicId) {
      query = query.innerJoin(
        schema.quizQuestions,
        eq(schema.quizProgress.questionId, schema.quizQuestions.id)
      ).where(
        and(
          eq(schema.quizProgress.isCompleted, true),
          eq(schema.quizQuestions.topicId, topicId)
        )
      );
    }
    
    const results = await query.orderBy(schema.quizProgress.questionId);
    return results.map(r => r.questionId);
  }

  /**
   * Get completion statistics
   */
  static async getCompletionStats(topicId?: number): Promise<{
    total: number;
    completed: number;
    percentage: number;
  }> {
    const db = getDatabase();
    
    let totalQuery = db.select({ count: sql<number>`count(*)` }).from(schema.quizQuestions);
    let completedQuery = db.select({ count: sql<number>`count(*)` })
      .from(schema.quizProgress)
      .where(eq(schema.quizProgress.isCompleted, true));
    
    if (topicId) {
      totalQuery = totalQuery.where(eq(schema.quizQuestions.topicId, topicId));
      completedQuery = completedQuery
        .innerJoin(schema.quizQuestions, eq(schema.quizProgress.questionId, schema.quizQuestions.id))
        .where(
          and(
            eq(schema.quizProgress.isCompleted, true),
            eq(schema.quizQuestions.topicId, topicId)
          )
        );
    }
    
    const [totalResult] = await totalQuery;
    const [completedResult] = await completedQuery;
    
    const total = totalResult?.count || 0;
    const completed = completedResult?.count || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  /**
   * Get correct answers count for a topic
   */
  static async getCorrectAnswersCount(topicId?: number): Promise<number> {
    const db = getDatabase();
    
    let query = db.select({ count: sql<number>`count(*)` })
      .from(schema.quizProgress)
      .innerJoin(schema.quizQuestions, eq(schema.quizProgress.questionId, schema.quizQuestions.id))
      .where(
        and(
          eq(schema.quizProgress.isCompleted, true),
          sql`${schema.quizProgress.selectedAnswer} = ${schema.quizQuestions.correctAnswer}`
        )
      );
    
    if (topicId) {
      query = query.where(
        and(
          eq(schema.quizProgress.isCompleted, true),
          eq(schema.quizQuestions.topicId, topicId),
          sql`${schema.quizProgress.selectedAnswer} = ${schema.quizQuestions.correctAnswer}`
        )
      );
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  /**
   * Clear all progress (for testing/reset)
   */
  static async clearAllProgress(): Promise<void> {
    const db = getDatabase();
    await db.delete(schema.quizProgress);
  }
}