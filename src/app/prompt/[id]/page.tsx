import Link from 'next/link';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import DownloadButton from '@/components/DownloadButton';
import StarRating from '@/components/StarRating';
import CommentSection from '@/components/CommentSection';
import { Comment } from '@/lib/types';

export const dynamic = 'force-dynamic';

const categoryBadgeColors: Record<string, string> = {
  tekst: 'bg-blue-100 text-blue-700',
  creatief: 'bg-purple-100 text-purple-700',
  analyse: 'bg-green-100 text-green-700',
  onderzoek: 'bg-orange-100 text-orange-700',
  productiviteit: 'bg-rose-100 text-rose-700',
  anders: 'bg-gray-100 text-gray-700',
};

interface PromptPageProps {
  params: { id: string };
}

export default function PromptPage({ params }: PromptPageProps) {
  const prompt = db.prepare(`
    SELECT p.*,
      (SELECT AVG(CAST(score AS FLOAT)) FROM ratings WHERE prompt_id = p.id) as average_rating,
      (SELECT COUNT(*) FROM ratings WHERE prompt_id = p.id) as rating_count
    FROM prompts p
    WHERE p.id = ?
  `).get(params.id) as any;

  if (!prompt) {
    notFound();
  }

  const categories = db.prepare(`
    SELECT c.* FROM categories c
    JOIN prompt_categories pc ON c.id = pc.category_id
    WHERE pc.prompt_id = ?
  `).all(params.id) as any[];

  const comments = db.prepare(
    'SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at DESC'
  ).all(params.id) as Comment[];

  const requiredDocs: string[] = (() => {
    try {
      return JSON.parse(prompt.required_documents || '[]');
    } catch {
      return [];
    }
  })();

  const createdDate = new Date(prompt.created_at + 'Z').toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-block text-indigo-600 hover:text-indigo-800 transition-colors">
        &larr; Terug naar overzicht
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.name}</h1>
            <span className="text-sm text-gray-400 whitespace-nowrap ml-4">v{prompt.version}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {categories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/categorie/${cat.slug}`}
                className={`text-xs px-3 py-1 rounded-full ${categoryBadgeColors[cat.slug] || 'bg-teal-100 text-teal-700'} hover:opacity-80 transition-opacity`}
              >
                {cat.name}
              </Link>
            ))}
            <span className="text-sm text-gray-400">{createdDate}</span>
          </div>
          <p className="text-gray-600">{prompt.short_description}</p>
        </div>

        {/* Prompt tekst */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Prompt tekst</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-200">
            {prompt.prompt_text}
          </div>
          <div className="flex gap-3 mt-4">
            <CopyButton text={prompt.prompt_text} />
            <DownloadButton text={prompt.prompt_text} filename={prompt.name.replace(/\s+/g, '-')} />
          </div>
        </div>

        {/* Zelf toe te voegen documenten */}
        {requiredDocs.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Zelf toe te voegen documenten</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              {requiredDocs.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Opmerkingen maker */}
        {prompt.maker_notes && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Opmerkingen van de maker</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{prompt.maker_notes}</p>
          </div>
        )}

        {/* Rating */}
        <div className="p-6 border-b border-gray-100">
          <StarRating
            promptId={prompt.id}
            averageRating={prompt.average_rating}
            ratingCount={prompt.rating_count}
          />
        </div>

        {/* Comments */}
        <div className="p-6">
          <CommentSection promptId={prompt.id} initialComments={comments} />
        </div>
      </div>
    </div>
  );
}
