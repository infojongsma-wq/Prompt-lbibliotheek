import Link from 'next/link';
import db from '@/lib/db';
import { ensureDbInitialized } from '@/lib/init';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import DownloadButton from '@/components/DownloadButton';
import StarRating from '@/components/StarRating';
import CommentSection from '@/components/CommentSection';
import { Comment } from '@/lib/types';

export const dynamic = 'force-dynamic';

const categoryBadgeColors: Record<string, string> = {
  tekst: 'bg-oost-blauw/10 text-oost-blauw',
  creatief: 'bg-oost-paars/10 text-oost-paars',
  analyse: 'bg-oost-groen/10 text-oost-groen',
  onderzoek: 'bg-oost-oranje/10 text-oost-oranje',
  productiviteit: 'bg-oost-rood/10 text-oost-rood',
  anders: 'bg-oost-geel/10 text-oost-geel',
};

interface PromptPageProps {
  params: { id: string };
}

export default async function PromptPage({ params }: PromptPageProps) {
  await ensureDbInitialized();

  const promptResult = await db.execute({
    sql: `SELECT p.*,
      (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
      (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
    FROM prompts p WHERE p.id = ?`,
    args: [params.id],
  });

  if (promptResult.rows.length === 0) notFound();
  const prompt = promptResult.rows[0] as any;

  const catResult = await db.execute({
    sql: `SELECT c.* FROM categories c JOIN prompt_categories pc ON c.id = pc.category_id WHERE pc.prompt_id = ?`,
    args: [params.id],
  });
  const categories = catResult.rows;

  const commentsResult = await db.execute({
    sql: 'SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC',
    args: [params.id],
  });
  const comments = commentsResult.rows as unknown as Comment[];

  const requiredDocs: string[] = (() => {
    try { return JSON.parse((prompt.required_documents as string) || '[]'); }
    catch { return []; }
  })();

  const createdDate = new Date(prompt.created_at + 'Z').toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-block text-oost-blauw hover:text-oost-blauw/70 transition-colors font-semibold">
        &larr; Terug naar overzicht
      </Link>

      <div className="bg-white rounded-xl border border-oost-blauw/10 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-oost-blauw/10">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-oost-donkerblauw">{prompt.name as string}</h1>
            <span className="text-sm text-oost-donkerblauw/40 whitespace-nowrap ml-4">v{prompt.version as string}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {categories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/categorie/${cat.slug}`}
                className={`text-xs px-3 py-1 rounded-full font-semibold ${categoryBadgeColors[cat.slug] || 'bg-oost-blauw/10 text-oost-blauw'} hover:opacity-70 transition-opacity`}
              >
                {cat.name}
              </Link>
            ))}
            <span className="text-sm text-oost-donkerblauw/40">{createdDate}</span>
          </div>
          <p className="text-oost-donkerblauw/80">{prompt.short_description as string}</p>
        </div>

        {/* Prompt tekst */}
        <div className="p-6 border-b border-oost-blauw/10">
          <h2 className="text-lg font-bold text-oost-donkerblauw mb-3">Prompt tekst</h2>
          <div className="bg-oost-lichtblauw rounded-lg p-4 font-mono text-sm text-oost-donkerblauw whitespace-pre-wrap max-h-96 overflow-y-auto border border-oost-blauw/10">
            {prompt.prompt_text as string}
          </div>
          <div className="flex gap-3 mt-4">
            <CopyButton text={prompt.prompt_text as string} />
            <DownloadButton text={prompt.prompt_text as string} filename={(prompt.name as string).replace(/\s+/g, '-')} />
          </div>
        </div>

        {/* Zelf toe te voegen documenten */}
        {requiredDocs.length > 0 && (
          <div className="p-6 border-b border-oost-blauw/10">
            <h2 className="text-lg font-bold text-oost-donkerblauw mb-3">Zelf toe te voegen documenten</h2>
            <ul className="list-disc list-inside space-y-1 text-oost-donkerblauw/70 text-sm">
              {requiredDocs.map((doc, i) => <li key={i}>{doc}</li>)}
            </ul>
          </div>
        )}

        {/* Opmerkingen maker */}
        {prompt.maker_notes && (
          <div className="p-6 border-b border-oost-blauw/10">
            <h2 className="text-lg font-bold text-oost-donkerblauw mb-3">Opmerkingen van de maker</h2>
            <p className="text-oost-donkerblauw/70 text-sm whitespace-pre-wrap">{prompt.maker_notes as string}</p>
          </div>
        )}

        {/* Rating */}
        <div className="p-6 border-b border-oost-blauw/10">
          <StarRating
            promptId={prompt.id as number}
            averageRating={prompt.average_rating as number | null}
            ratingCount={prompt.rating_count as number}
          />
        </div>

        {/* Comments */}
        <div className="p-6">
          <CommentSection promptId={prompt.id as number} initialComments={comments} />
        </div>
      </div>
    </div>
  );
}
