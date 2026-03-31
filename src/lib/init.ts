import db from './db';
import { initializeDatabase } from './schema';

const globalForInit = globalThis as unknown as { _dbInitialized: boolean };

export async function ensureDbInitialized() {
  if (!globalForInit._dbInitialized) {
    await initializeDatabase(db);
    globalForInit._dbInitialized = true;
  }
}
