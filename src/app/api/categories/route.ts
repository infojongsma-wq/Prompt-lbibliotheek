import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureDbInitialized();

  const result = await db.execute(`
    SELECT c.*, COUNT(pc.prompt_id) as prompt_count
    FROM categories c
    LEFT JOIN prompt_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.name
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  const { name } = await request.json();

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    const result = await db.execute({
      sql: 'INSERT INTO categories (name, slug) VALUES (?, ?)',
      args: [name.trim(), slug],
    });

    const category = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [result.lastInsertRowid!],
    });
    return NextResponse.json(category.rows[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Categorie bestaat al' }, { status: 409 });
  }
}
