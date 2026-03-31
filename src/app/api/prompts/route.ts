import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';
import { CreatePromptInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureDbInitialized();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let prompts;
  if (category) {
    prompts = await db.execute({
      sql: `
        SELECT DISTINCT p.*,
          (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
          (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
        FROM prompts p
        JOIN prompt_categories pc ON p.id = pc.prompt_id
        JOIN categories c ON pc.category_id = c.id
        WHERE c.slug = ?
        ORDER BY p.updated_at DESC
      `,
      args: [category],
    });
  } else {
    prompts = await db.execute(`
      SELECT p.*,
        (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
      FROM prompts p
      ORDER BY p.updated_at DESC
    `);
  }

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

export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  const body: CreatePromptInput = await request.json();

  if (!body.name || !body.prompt_text || !body.short_description) {
    return NextResponse.json(
      { error: 'Naam, korte omschrijving en prompttekst zijn verplicht' },
      { status: 400 }
    );
  }

  const wordCount = body.short_description.trim().split(/\s+/).length;
  if (wordCount > 100) {
    return NextResponse.json(
      { error: 'Korte omschrijving mag maximaal 100 woorden bevatten' },
      { status: 400 }
    );
  }

  const result = await db.execute({
    sql: `INSERT INTO prompts (name, version, prompt_text, short_description, required_documents, maker_notes)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      body.name,
      body.version || '1.0',
      body.prompt_text,
      body.short_description,
      JSON.stringify(body.required_documents || []),
      body.maker_notes || '',
    ],
  });

  const promptId = result.lastInsertRowid!;

  if (body.category_ids && body.category_ids.length > 0) {
    for (const catId of body.category_ids) {
      await db.execute({
        sql: 'INSERT INTO prompt_categories (prompt_id, category_id) VALUES (?, ?)',
        args: [promptId, catId],
      });
    }
  }

  const prompt = await db.execute({
    sql: 'SELECT * FROM prompts WHERE id = ?',
    args: [promptId],
  });
  const categories = await db.execute({
    sql: `SELECT c.* FROM categories c
          JOIN prompt_categories pc ON c.id = pc.category_id
          WHERE pc.prompt_id = ?`,
    args: [promptId],
  });

  return NextResponse.json({ ...prompt.rows[0], categories: categories.rows }, { status: 201 });
}
