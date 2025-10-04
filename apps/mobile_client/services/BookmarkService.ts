import { getDatabase } from '../lib/database';

export interface Bookmark {
  id: number;
  question_id: number;
  created_at: string | null;
}

export class BookmarkService {
  /**
   * Get all bookmarks
   */
  static async getAllBookmarks(): Promise<Bookmark[]> {
    const db = getDatabase();
    return await db.getAllAsync<Bookmark>('SELECT * FROM bookmarks ORDER BY created_at DESC');
  }

  /**
   * Get bookmarked question IDs
   */
  static async getBookmarkedQuestionIds(): Promise<number[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ question_id: number }>(
      'SELECT question_id FROM bookmarks'
    );
    return results.map(r => r.question_id);
  }

  /**
   * Check if a question is bookmarked
   */
  static async isBookmarked(questionId: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      'SELECT id FROM bookmarks WHERE question_id = ?',
      [questionId]
    );
    return result !== null;
  }

  /**
   * Add a bookmark
   */
  static async addBookmark(questionId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO bookmarks (question_id) VALUES (?)',
      [questionId]
    );
  }

  /**
   * Remove a bookmark
   */
  static async removeBookmark(questionId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'DELETE FROM bookmarks WHERE question_id = ?',
      [questionId]
    );
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  static async toggleBookmark(questionId: number): Promise<boolean> {
    const isCurrentlyBookmarked = await this.isBookmarked(questionId);
    
    if (isCurrentlyBookmarked) {
      await this.removeBookmark(questionId);
      return false; // Now not bookmarked
    } else {
      await this.addBookmark(questionId);
      return true; // Now bookmarked
    }
  }

  /**
   * Clear all bookmarks
   */
  static async clearAllBookmarks(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM bookmarks');
  }

  /**
   * Get bookmark count
   */
  static async getBookmarkCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookmarks'
    );
    return result?.count || 0;
  }

  /**
   * Get bookmarked questions with details
   */
  static async getBookmarkedQuestionsWithDetails(): Promise<any[]> {
    const db = getDatabase();
    return await db.getAllAsync(
      `SELECT qq.*, b.created_at as bookmarked_at
       FROM bookmarks b
       JOIN quiz_questions qq ON b.question_id = qq.id
       ORDER BY b.created_at DESC`
    );
  }
}
