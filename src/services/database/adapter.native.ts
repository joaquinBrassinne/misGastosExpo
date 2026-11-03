import * as SQLite from 'expo-sqlite';
import { IDatabaseAdapter, QueryResult } from './types';

export class DatabaseAdapter implements IDatabaseAdapter {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('gastos_personales.db');
    await this.db.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);
  }

  async getAll<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<T>(sql, params as (string | number)[]);
  }

  async getFirst<T>(sql: string, params: (string | number | null)[] = []): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getFirstAsync<T>(sql, params as (string | number)[]);
  }

  async run(sql: string, params: (string | number | null)[] = []): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(sql, params as (string | number)[]);
    return {
      lastInsertRowId: result.lastInsertRowId,
      changes: result.changes,
    };
  }

  async exec(sql: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execAsync(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export function createAdapter(): IDatabaseAdapter {
  return new DatabaseAdapter();
}

