import { eq, and, sql } from 'drizzle-orm';
import { getDatabase, schema } from '../lib/database';
import type { Bookmark } from '../db/schema';

export class BookmarkService {
  /**
   * Get all bookmarks
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    const db = getDatabase();
    return await db.select().from(schema.bookmarks).orderBy(schema.bookmarks.createdAt);
  }

  /**
   * Check if a question is bookmarked
   */
  static async isBookmarked(questionId: number): Promise<boolean> {
    const db = getDatabase();
    const bookmark = await db.select()
      .from(schema.bookmarks)
      .where(eq(schema.bookmarks.questionId, questionId))
      .limit(1);
    
    return bookmark.length > 0;
  }

  /**
   * Get bookmarked question IDs
   */
  static async getBookmarkedQuestionIds(): Promise<number[]> {
    const db = getDatabase();
    const bookmarks = await db.select({ questionId: schema.bookmarks.questionId })
      .from(schema.bookmarks);
    
    return bookmarks.map(b => b.questionId);
  }

  /**
   * Toggle bookmark for a question
   */
  static async toggleBookmark(questionId: number): Promise<boolean> {
    const db = getDatabase();
    
    // Check if already bookmarked
    const existing = await db.select()
      .from(schema.bookmarks)
      .where(eq(schema.bookmarks.questionId, questionId))
      .limit(1);
    
    if (existing.length > 0) {
      // Remove bookmark
      await db.delete(schema.bookmarks).where(eq(schema.bookmarks.questionId, questionId));
      return false;
    } else {
      // Add bookmark
      await db.insert(schema.bookmarks).values({ questionId });
      return true;
    }
  }

  /**
   * Add bookmark for a question
   */
  static async addBookmark(questionId: number): Promise<void> {
    const db = getDatabase();
    await db.insert(schema.bookmarks).values({ questionId }).onConflictDoNothing();
  }

  /**
   * Remove bookmark for a question
   */
  static async removeBookmark(questionId: number): Promise<void> {
    const db = getDatabase();
    await db.delete(schema.bookmarks).where(eq(schema.bookmarks.questionId, questionId));
  }

  /**
   * Get bookmarks with question details
   */
  static async getBookmarksWithDetails(): Promise<Array<{
    bookmarkId: number;
    questionId: number;
    title: string;
    topic: string;
    createdAt: string;
  }>> {
    const db = getDatabase();
    return await db.select({
      bookmarkId: schema.bookmarks.id,
      questionId: schema.bookmarks.questionId,
      title: schema.quizQuestions.title,
      topic: schema.topics.name,
      createdAt: schema.bookmarks.createdAt,
    })
    .from(schema.bookmarks)
    .innerJoin(schema.quizQuestions, eq(schema.bookmarks.questionId, schema.quizQuestions.id))
    .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
    .orderBy(schema.bookmarks.createdAt);
  }

  /**
   * Clear all bookmarks (for testing/reset)
   */
  static async clearAllBookmarks(): Promise<void> {
    const db = getDatabase();
    await db.delete(schema.bookmarks);
  }

  /**
   * Get bookmark count
   */
  static async getBookmarkCount(): Promise<number> {
    const db = getDatabase();
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(schema.bookmarks);
    return result?.count || 0;
  }
}