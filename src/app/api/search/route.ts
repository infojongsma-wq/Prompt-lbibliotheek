import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  const term = `%${q.trim()}%`;

  const prompts = db.prepare(`
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
  `).all(term, term, term, term, term);

  const promptsWithCategories = prompts.map((p: any) => {
    const categories = db.prepare(`
      SELECT c.* FROM categories c
      JOIN prompt_categories pc ON c.id = pc.category_id
      WHERE pc.prompt_id = ?
    `).all(p.id);
    return { ...p, categories };
  });

  return NextResponse.json(promptsWithCategories);
}
