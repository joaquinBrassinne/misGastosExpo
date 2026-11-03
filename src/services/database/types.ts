export interface QueryResult {
  lastInsertRowId: number;
  changes: number;
}

export interface IDatabaseAdapter {
  init(): Promise<void>;
  getAll<T>(sql: string, params?: (string | number | null)[]): Promise<T[]>;
  getFirst<T>(sql: string, params?: (string | number | null)[]): Promise<T | null>;
  run(sql: string, params?: (string | number | null)[]): Promise<QueryResult>;
  exec(sql: string): Promise<void>;
  close?(): Promise<void>;
}

