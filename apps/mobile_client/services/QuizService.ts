import { getDatabase } from '../lib/database';
import { appEvents, EVENT_TYPES } from '../lib/eventEmitter';

export interface Topic {
  id: number;
  name: string;
  created_at: string | null;
}

export interface QuizQuestion {
  id: number;
  topic_id: number;
  title: string;
  question: string;
  options: string; // JSON string
  correct_answer: string;
  feedback: string;
  created_at: string | null;
}

export interface QuizProgress {
  id: number;
  question_id: number;
  selected_answer: string | null;
  is_completed: number; // SQLite boolean (0 or 1)
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export class QuizService {
  /**
   * Get all topics
   */
  static async getTopics(): Promise<Topic[]> {
    const db = getDatabase();
    return await db.getAllAsync<Topic>('SELECT * FROM topics ORDER BY name');
  }

  /**
   * Get all quiz questions
   */
  static async getQuizQuestions(topicId?: number): Promise<QuizQuestion[]> {
    const db = getDatabase();
    
    if (topicId) {
      return await db.getAllAsync<QuizQuestion>(
        'SELECT * FROM quiz_questions WHERE topic_id = ? ORDER BY id',
        [topicId]
      );
    }
    
    return await db.getAllAsync<QuizQuestion>('SELECT * FROM quiz_questions ORDER BY id');
  }

  /**
   * Get quiz question by ID
   */
  static async getQuizQuestion(questionId: number): Promise<QuizQuestion | null> {
    const db = getDatabase();
    return await db.getFirstAsync<QuizQuestion>(
      'SELECT * FROM quiz_questions WHERE id = ?',
      [questionId]
    );
  }

  /**
   * Get quiz progress for a question
   */
  static async getQuizProgress(questionId: number): Promise<QuizProgress | null> {
    const db = getDatabase();
    return await db.getFirstAsync<QuizProgress>(
      'SELECT * FROM quiz_progress WHERE question_id = ?',
      [questionId]
    );
  }

  /**
   * Get all quiz progress
   */
  static async getAllQuizProgress(): Promise<QuizProgress[]> {
    const db = getDatabase();
    return await db.getAllAsync<QuizProgress>('SELECT * FROM quiz_progress');
  }

  /**
   * Save quiz answer
   */
  static async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO quiz_progress (question_id, selected_answer, is_completed, completed_at, updated_at)
       VALUES (?, ?, 1, ?, ?)
       ON CONFLICT(question_id) DO UPDATE SET
         selected_answer = excluded.selected_answer,
         is_completed = 1,
         completed_at = excluded.completed_at,
         updated_at = excluded.updated_at`,
      [questionId, selectedAnswer, now, now]
    );

    // Emit event to notify other components
    appEvents.emit(EVENT_TYPES.QUIZ_PROGRESS_UPDATED);
  }

  /**
   * Get completed question IDs
   */
  static async getCompletedQuestions(topicId?: number): Promise<number[]> {
    const db = getDatabase();
    
    if (topicId) {
      const results = await db.getAllAsync<{ question_id: number }>(
        `SELECT qp.question_id 
         FROM quiz_progress qp
         JOIN quiz_questions qq ON qp.question_id = qq.id
         WHERE qp.is_completed = 1 AND qq.topic_id = ?`,
        [topicId]
      );
      return results.map(r => r.question_id);
    }
    
    const results = await db.getAllAsync<{ question_id: number }>(
      'SELECT question_id FROM quiz_progress WHERE is_completed = 1'
    );
    return results.map(r => r.question_id);
  }

  /**
   * Get selected answers
   */
  static async getSelectedAnswers(): Promise<Record<number, string>> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ question_id: number; selected_answer: string }>(
      'SELECT question_id, selected_answer FROM quiz_progress WHERE selected_answer IS NOT NULL'
    );
    
    const answers: Record<number, string> = {};
    results.forEach(row => {
      answers[row.question_id] = row.selected_answer;
    });
    return answers;
  }

  /**
   * Get completion stats
   */
  static async getCompletionStats(): Promise<{ total: number; completed: number; percentage: number }> {
    const db = getDatabase();
    
    const totalResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quiz_questions'
    );
    const completedResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quiz_progress WHERE is_completed = 1'
    );
    
    const total = totalResult?.count || 0;
    const completed = completedResult?.count || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  /**
   * Reset quiz progress
   */
  static async resetProgress(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM quiz_progress');
  }

  /**
   * Reset progress for a specific question
   */
  static async resetQuestionProgress(questionId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM quiz_progress WHERE question_id = ?', [questionId]);
  }

  /**
   * Get quiz progress by topic
   */
  static async getProgressByTopic(topicId: number): Promise<{ total: number; completed: number }> {
    const db = getDatabase();
    
    const totalResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quiz_questions WHERE topic_id = ?',
      [topicId]
    );
    
    const completedResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM quiz_progress qp
       JOIN quiz_questions qq ON qp.question_id = qq.id
       WHERE qp.is_completed = 1 AND qq.topic_id = ?`,
      [topicId]
    );
    
    return {
      total: totalResult?.count || 0,
      completed: completedResult?.count || 0,
    };
  }
}
