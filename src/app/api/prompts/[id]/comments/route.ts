import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = db.prepare(
    'SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC'
  ).all(params.id);

  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { author, content } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Opmerking is verplicht' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO comments (prompt_id, author, content) VALUES (?, ?, ?)'
  ).run(params.id, author?.trim() || 'Anoniem', content.trim());

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(comment, { status: 201 });
}
