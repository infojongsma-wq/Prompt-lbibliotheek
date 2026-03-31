import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureDbInitialized();

  const prompt = await db.execute({
    sql: `SELECT p.*,
      (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
      (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
    FROM prompts p
    WHERE p.id = ?`,
    args: [params.id],
  });

  if (prompt.rows.length === 0) {
    return NextResponse.json({ error: 'Prompt niet gevonden' }, { status: 404 });
  }

  const categories = await db.execute({
    sql: `SELECT c.* FROM categories c
          JOIN prompt_categories pc ON c.id = pc.category_id
          WHERE pc.prompt_id = ?`,
    args: [params.id],
  });

  const comments = await db.execute({
    sql: 'SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC',
    args: [params.id],
  });

  return NextResponse.json({
    ...prompt.rows[0],
    categories: categories.rows,
    comments: comments.rows,
  });
}
