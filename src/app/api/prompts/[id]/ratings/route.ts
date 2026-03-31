import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureDbInitialized();
  const { score } = await request.json();

  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Score moet tussen 1 en 5 zijn' }, { status: 400 });
  }

  await db.execute({
    sql: 'INSERT INTO ratings (prompt_id, score) VALUES (?, ?)',
    args: [params.id, score],
  });

  const stats = await db.execute({
    sql: `SELECT AVG(CAST(score AS FLOAT)) as average_rating, COUNT(*) as rating_count
          FROM ratings WHERE prompt_id = ?`,
    args: [params.id],
  });

  return NextResponse.json(stats.rows[0], { status: 201 });
}
