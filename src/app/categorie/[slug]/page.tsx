import Link from 'next/link';
import PromptCard from '@/components/PromptCard';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  await ensureDbInitialized();

  const catResult = await db.execute({
    sql: 'SELECT * FROM categories WHERE slug = ?',
    args: [params.slug],
  });

  if (catResult.rows.length === 0) {
    notFound();
  }

  const category = catResult.rows[0];

  const prompts = await db.execute({
    sql: `
      SELECT DISTINCT p.*,
        (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
      FROM prompts p
      JOIN prompt_categories pc ON p.id = pc.prompt_id
      WHERE pc.category_id = ?
      ORDER BY p.updated_at DESC
    `,
    args: [category.id],
  });

  const results = await Promise.all(
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 transition-colors">
          &larr; Terug
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{category.name as string}</h1>
        <span className="text-gray-500">({results.length} prompts)</span>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nog geen prompts in deze categorie.</p>
          <Link
            href="/nieuw"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voeg een prompt toe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p: any) => (
            <PromptCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
