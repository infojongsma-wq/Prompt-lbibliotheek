import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { score } = await request.json();

  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Score moet tussen 1 en 5 zijn' }, { status: 400 });
  }

  db.prepare('INSERT INTO ratings (prompt_id, score) VALUES (?, ?)').run(params.id, score);

  const stats = db.prepare(`
    SELECT AVG(CAST(score AS FLOAT)) as average_rating, COUNT(*) as rating_count
    FROM ratings WHERE prompt_id = ?
  `).get(params.id) as any;

  return NextResponse.json(stats, { status: 201 });
}
