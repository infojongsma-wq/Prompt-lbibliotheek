import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureDbInitialized();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  const term = `%${q.trim()}%`;

  const prompts = await db.execute({
    sql: `
      SELECT DISTINCT p.*,
        (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
      FROM prompts p
      LEFT JOIN prompt_categories pc ON p.id = pc.prompt_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.name LIKE ?
        OR p.short_description LIKE ?
        OR p.prompt_text LIKE ?
        OR p.maker_notes LIKE ?
        OR c.name LIKE ?
      ORDER BY p.updated_at DESC
    `,
    args: [term, term, term, term, term],
  });

  const promptsWithCategories = await Promise.all(
    prompts.rows.map(async (p) => {
      const cats = await db.execute({
        sql: `SELECT c.* FROM categories c
              JOIN prompt_categories pc ON c.id = pc.category_id
              WHERE pc.prompt_id = ?`,
        args: [p.id],
      });
      return { ...p, categories: cats.rows };
    })
  );

  return NextResponse.json(promptsWithCategories);
}
