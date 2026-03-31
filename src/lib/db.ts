import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './schema';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'promptbibliotheek.db');

const globalForDb = globalThis as unknown as { _db: Database.Database };

if (!globalForDb._db) {
  globalForDb._db = new Database(dbPath);
  globalForDb._db.pragma('journal_mode = WAL');
  globalForDb._db.pragma('foreign_keys = ON');
  initializeDatabase(globalForDb._db);
}

const db = globalForDb._db;

export default db;
