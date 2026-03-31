import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreatePromptInput } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let prompts;
  if (category) {
    prompts = db.prepare(`
      SELECT DISTINCT p.*,
        (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
      FROM prompts p
      JOIN prompt_categories pc ON p.id = pc.prompt_id
      JOIN categories c ON pc.category_id = c.id
      WHERE c.slug = ?
      ORDER BY p.updated_at DESC
    `).all(category);
  } else {
    prompts = db.prepare(`
      SELECT p.*,
        (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
      FROM prompts p
      ORDER BY p.updated_at DESC
    `).all();
  }

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

export async function POST(request: NextRequest) {
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

  const insertPrompt = db.transaction((data: CreatePromptInput) => {
    const result = db.prepare(`
      INSERT INTO prompts (name, version, prompt_text, short_description, required_documents, maker_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.version || '1.0',
      data.prompt_text,
      data.short_description,
      JSON.stringify(data.required_documents || []),
      data.maker_notes || ''
    );

    const promptId = result.lastInsertRowid;

    if (data.category_ids && data.category_ids.length > 0) {
      const insertCat = db.prepare(
        'INSERT INTO prompt_categories (prompt_id, category_id) VALUES (?, ?)'
      );
      for (const catId of data.category_ids) {
        insertCat.run(promptId, catId);
      }
    }

    return promptId;
  });

  const promptId = insertPrompt(body);

  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId) as Record<string, unknown>;
  const categories = db.prepare(`
    SELECT c.* FROM categories c
    JOIN prompt_categories pc ON c.id = pc.category_id
    WHERE pc.prompt_id = ?
  `).all(promptId);

  return NextResponse.json({ ...prompt, categories }, { status: 201 });
}
