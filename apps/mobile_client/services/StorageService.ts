import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, topics, quizQuestions, quizProgress, bookmarks } from '@/lib/schema';
import { QuizItem } from '../../../types';


class StorageService {
  private currentUserId: number | null = null;

  async initialize() {
    // Get or create default user
    const existingUser = await db.select().from(users).limit(1);
    if (existingUser.length === 0) {
      const [newUser] = await db.insert(users).values({
        username: 'default',
        settings: JSON.stringify({}),
      }).returning();
      this.currentUserId = newUser.id;
    } else {
      this.currentUserId = existingUser[0].id;
    }
  }

  async getQuizQuestions(): Promise<QuizItem[]> {
    const questions = await db.select().from(quizQuestions);
    return questions.map(q => ({
      id: q.id,
      topic: '', // Will be populated by the caller
      title: q.title,
      question: q.question,
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer,
      feedback: q.feedback,
    }));
  }

  async getTopics() {
    return await db.select().from(topics);
  }

  async getSelectedAnswers(): Promise<{ [key: number]: string }> {
    if (!this.currentUserId) await this.initialize();
    
    const progress = await db
      .select()
      .from(quizProgress)
      .where(eq(quizProgress.userId, this.currentUserId!));

    const answers: { [key: number]: string } = {};
    progress.forEach(p => {
      if (p.questionId !== null) {
        answers[p.questionId] = p.selectedAnswer;
      }
    });
    return answers;
  }

  async getCompletedQuestions(topicId?: number): Promise<number[]> {
    if (!this.currentUserId) await this.initialize();

    let query = db
      .select({ questionId: quizProgress.questionId })
      .from(quizProgress)
      .where(eq(quizProgress.userId, this.currentUserId!));

    if (topicId) {
      query = query.innerJoin(
        quizQuestions,
        and(
          eq(quizQuestions.id, quizProgress.questionId),
          eq(quizQuestions.topicId, topicId)
        )
      );
    }

    const completed = await query;
    return completed.map(c => c.questionId).filter((id): id is number => id !== null);
  }

  async getBookmarkedQuestionIds(): Promise<number[]> {
    if (!this.currentUserId) await this.initialize();

    const bookmarked = await db
      .select({ questionId: bookmarks.questionId })
      .from(bookmarks)
      .where(eq(bookmarks.userId, this.currentUserId!));

    return bookmarked.map(b => b.questionId).filter((id): id is number => id !== null);
  }

  async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
    if (!this.currentUserId) await this.initialize();

    // Check if answer exists
    const existing = await db
      .select()
      .from(quizProgress)
      .where(
        and(
          eq(quizProgress.userId, this.currentUserId!),
          eq(quizProgress.questionId, questionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing answer
      await db
        .update(quizProgress)
        .set({ selectedAnswer })
        .where(
          and(
            eq(quizProgress.userId, this.currentUserId!),
            eq(quizProgress.questionId, questionId)
          )
        );
    } else {
      // Insert new answer
      await db.insert(quizProgress).values({
        userId: this.currentUserId!,
        questionId,
        selectedAnswer,
      });
    }
  }

  async toggleBookmark(questionId: number): Promise<boolean> {
    if (!this.currentUserId) await this.initialize();

    // Check if bookmark exists
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, this.currentUserId!),
          eq(bookmarks.questionId, questionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Remove bookmark
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, this.currentUserId!),
            eq(bookmarks.questionId, questionId)
          )
        );
      return false;
    } else {
      // Add bookmark
      await db.insert(bookmarks).values({
        userId: this.currentUserId!,
        questionId,
      });
      return true;
    }
  }
}

export const storageService = new StorageService();
