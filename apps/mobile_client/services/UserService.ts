import { getDatabase } from '../lib/database';

export interface UserSettings {
  id: number;
  username: string;
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
        'INSERT OR IGNORE INTO user_settings (id, username) VALUES (?, ?)',
        [1, 'Example User']
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
}