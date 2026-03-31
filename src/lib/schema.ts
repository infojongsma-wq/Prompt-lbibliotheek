import { Client } from '@libsql/client';

export async function initializeDatabase(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0',
      prompt_text TEXT NOT NULL,
      short_description TEXT NOT NULL,
      required_documents TEXT DEFAULT '[]',
      maker_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prompt_categories (
      prompt_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (prompt_id, category_id),
      FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      author TEXT NOT NULL DEFAULT 'Anoniem',
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
    );
  `);

  const defaultCategories = [
    { name: 'Tekst', slug: 'tekst' },
    { name: 'Creatief', slug: 'creatief' },
    { name: 'Analyse', slug: 'analyse' },
    { name: 'Onderzoek', slug: 'onderzoek' },
    { name: 'Productiviteit', slug: 'productiviteit' },
    { name: 'Anders', slug: 'anders' },
  ];

  for (const cat of defaultCategories) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)',
      args: [cat.name, cat.slug],
    });
  }
}
