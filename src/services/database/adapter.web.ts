import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { IDatabaseAdapter, QueryResult } from './types';

export class DatabaseAdapter implements IDatabaseAdapter {
  private db: Database | null = null;

  async init(): Promise<void> {
    let SQL: SqlJsStatic;
    try {
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
    } catch {
      // Intento sin opciones
      SQL = await initSqlJs();
    }
    // Base de datos en memoria para plataforma Web como requiere la consigna
    this.db = new SQL.Database();
    this.db.run('PRAGMA foreign_keys = ON;');
  }

  async getAll<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Web Database not initialized');
    const stmt = this.db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params as (string | number | null)[]);
    }
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    stmt.free();
    return results;
  }

  async getFirst<T>(sql: string, params: (string | number | null)[] = []): Promise<T | null> {
    const all = await this.getAll<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }

  async run(sql: string, params: (string | number | null)[] = []): Promise<QueryResult> {
    if (!this.db) throw new Error('Web Database not initialized');
    const stmt = this.db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params as (string | number | null)[]);
    }
    stmt.step();
    stmt.free();

    const query = this.db.exec('SELECT last_insert_rowid() AS id, changes() AS ch;');
    const lastInsertRowId = (query[0]?.values[0]?.[0] as number) ?? 0;
    const changes = (query[0]?.values[0]?.[1] as number) ?? 0;

    return { lastInsertRowId, changes };
  }

  async exec(sql: string): Promise<void> {
    if (!this.db) throw new Error('Web Database not initialized');
    this.db.exec(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export function createAdapter(): IDatabaseAdapter {
  return new DatabaseAdapter();
}

