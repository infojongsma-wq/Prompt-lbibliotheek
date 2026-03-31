import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const categories = db.prepare(`
    SELECT c.*, COUNT(pc.prompt_id) as prompt_count
    FROM categories c
    LEFT JOIN prompt_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.name
  `).all();

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    const result = db.prepare(
      'INSERT INTO categories (name, slug) VALUES (?, ?)'
    ).run(name.trim(), slug);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Categorie bestaat al' }, { status: 409 });
  }
}
