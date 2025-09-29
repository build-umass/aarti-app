import { eq } from 'drizzle-orm';
import { getDatabase, schema } from '../lib/database';
import type { UserSettings, NewUserSettings } from '../db/schema';

export class UserService {
  /**
   * Get user settings
   */
  static async getUserSettings(): Promise<UserSettings> {
    const db = getDatabase();
    const user = await db.select().from(schema.userSettings).where(eq(schema.userSettings.id, 1)).limit(1);
    
    if (user.length === 0) {
      // Create default user if none exists
      await db.insert(schema.userSettings).values({
        id: 1,
        username: 'Example User',
      });
      
      const newUser = await db.select().from(schema.userSettings).where(eq(schema.userSettings.id, 1)).limit(1);
      return newUser[0];
    }
    
    return user[0];
  }

  /**
   * Update username
   */
  static async updateUsername(username: string): Promise<void> {
    const db = getDatabase();
    await db.update(schema.userSettings)
      .set({ 
        username,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.userSettings.id, 1));
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
    const user = await db.select().from(schema.userSettings).where(eq(schema.userSettings.id, 1)).limit(1);
    return user.length > 0;
  }
}