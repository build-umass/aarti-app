import { getDatabase } from '../lib/database';

export interface UserSettings {
  id: number;
  username: string;
  onboarding_completed: number;
  first_launch_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export class UserService {
  /**
   * Get user settings
   */
  static async getUserSettings(): Promise<UserSettings> {
    const db = getDatabase();
    const user = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
    
    if (!user) {
      // Create default user if none exists
      await db.runAsync(
        'INSERT OR IGNORE INTO user_settings (id, username, onboarding_completed) VALUES (?, ?, ?)',
        [1, 'Example User', 0]
      );

      const newUser = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
      if (!newUser) throw new Error('Failed to create default user');
      return newUser;
    }
    
    return user;
  }

  /**
   * Update username
   */
  static async updateUsername(username: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE user_settings SET username = ?, updated_at = ? WHERE id = 1',
      [username, new Date().toISOString()]
    );
  }

  /**
   * Get username
   */
  static async getUsername(): Promise<string> {
    const user = await this.getUserSettings();
    return user.username;
  }

  /**
   * Check if user exists
   */
  static async userExists(): Promise<boolean> {
    const db = getDatabase();
    const user = await db.getFirstAsync('SELECT id FROM user_settings WHERE id = 1');
    return user !== null;
  }

  /**
   * Get onboarding status
   * Returns false if onboarding is not completed OR if username is still the default value
   */
  static async getOnboardingStatus(): Promise<boolean> {
    const user = await this.getUserSettings();

    // Safety check: if username is still default, onboarding is not complete
    if (user.username === 'Example User') {
      console.log('Username is still default, forcing onboarding');
      return false;
    }

    const isCompleted = user.onboarding_completed === 1;
    console.log('Onboarding status check:', {
      username: user.username,
      onboarding_completed: user.onboarding_completed,
      isCompleted
    });

    return isCompleted;
  }

  /**
   * Mark onboarding as completed
   */
  static async setOnboardingCompleted(): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE user_settings SET onboarding_completed = ?, first_launch_date = COALESCE(first_launch_date, ?), updated_at = ? WHERE id = 1',
      [1, now, now]
    );
  }

  /**
   * Reset all quiz progress (deletes all quiz_progress entries)
   */
  static async resetQuizProgress(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM quiz_progress');
  }

  /**
   * Reset all bookmarks (deletes all bookmarks entries)
   */
  static async resetBookmarks(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM bookmarks');
  }
}