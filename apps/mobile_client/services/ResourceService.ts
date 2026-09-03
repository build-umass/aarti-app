import { getDatabase } from '../lib/database';

export interface ResourceRow {
  id: string;
  title: string;
  sections: string; // JSON string of Section[]
  created_at: string | null;
}

export class ResourceService {
  static async getAllResources(): Promise<ResourceRow[]> {
    const db = getDatabase();
    return await db.getAllAsync<ResourceRow>('SELECT * FROM resources ORDER BY id');
  }

  static async getResourceById(id: string): Promise<ResourceRow | null> {
    const db = getDatabase();
    return await db.getFirstAsync<ResourceRow>(
      'SELECT * FROM resources WHERE id = ?',
      [id]
    );
  }
}
