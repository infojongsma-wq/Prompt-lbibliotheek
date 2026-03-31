import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prompt = db.prepare(`
    SELECT p.*,
      (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
      (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
    FROM prompts p
    WHERE p.id = ?
  `).get(params.id) as any;

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt niet gevonden' }, { status: 404 });
  }

  const categories = db.prepare(`
    SELECT c.* FROM categories c
    JOIN prompt_categories pc ON c.id = pc.category_id
    WHERE pc.prompt_id = ?
  `).all(params.id);

  const comments = db.prepare(`
    SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC
  `).all(params.id);

  return NextResponse.json({ ...prompt, categories, comments });
}
