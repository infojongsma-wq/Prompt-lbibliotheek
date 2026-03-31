import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureDbInitialized();

  const comments = await db.execute({
    sql: 'SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC',
    args: [params.id],
  });

  return NextResponse.json(comments.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureDbInitialized();
  const { author, content } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Opmerking is verplicht' }, { status: 400 });
  }

  const result = await db.execute({
    sql: 'INSERT INTO comments (prompt_id, author, content) VALUES (?, ?, ?)',
    args: [params.id, author?.trim() || 'Anoniem', content.trim()],
  });

  const comment = await db.execute({
    sql: 'SELECT * FROM comments WHERE id = ?',
    args: [result.lastInsertRowid!],
  });

  return NextResponse.json(comment.rows[0], { status: 201 });
}
