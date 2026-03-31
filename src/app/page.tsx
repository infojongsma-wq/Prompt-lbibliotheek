import SearchBar from '@/components/SearchBar';
import CategoryTile from '@/components/CategoryTile';
import PromptCard from '@/components/PromptCard';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';

interface HomeProps {
  searchParams: { q?: string };
}

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: HomeProps) {
  await ensureDbInitialized();
  const query = searchParams.q;

  if (query) {
    const term = `%${query}%`;
    const prompts = await db.execute({
      sql: `
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
      `,
      args: [term, term, term, term, term],
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
      <div className="space-y-8">
        <SearchBar initialQuery={query} />
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Zoekresultaten voor &ldquo;{query}&rdquo; ({results.length})
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-500">Geen prompts gevonden. Probeer een andere zoekterm.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((p: any) => (
                <PromptCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const categories = await db.execute(`
    SELECT c.*, COUNT(pc.prompt_id) as prompt_count
    FROM categories c
    LEFT JOIN prompt_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.name
  `);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl font-bold text-gray-900">Prompt Bibliotheek</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Zoek, bewaar en deel je beste prompts. Blader door categorieën of gebruik de zoekbalk.
        </p>
      </div>
      <SearchBar />
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Categorieën</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.rows.map((cat: any) => (
            <CategoryTile key={cat.id} {...cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
