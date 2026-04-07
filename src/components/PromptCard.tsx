import Link from 'next/link';

interface PromptCardProps {
  id: number;
  name: string;
  short_description: string;
  categories: { name: string; slug: string }[];
  average_rating: number | null;
  rating_count: number;
  version: string;
}

const categoryBadgeColors: Record<string, string> = {
  tekst: 'bg-oost-blauw/10 text-oost-blauw',
  creatief: 'bg-oost-paars/10 text-oost-paars',
  analyse: 'bg-oost-groen/10 text-oost-groen',
  onderzoek: 'bg-oost-oranje/10 text-oost-oranje',
  productiviteit: 'bg-oost-rood/10 text-oost-rood',
  anders: 'bg-oost-geel/10 text-oost-geel',
};

function StarDisplay({ rating }: { rating: number | null }) {
  const stars = rating ? Math.round(rating * 2) / 2 : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= stars ? 'text-oost-geel' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating !== null && (
        <span className="text-sm text-oost-donkerblauw/50 ml-1">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}

export default function PromptCard({
  id,
  name,
  short_description,
  categories,
  average_rating,
  version,
}: PromptCardProps) {
  return (
    <Link href={`/prompt/${id}`}>
      <div className="bg-white rounded-xl border border-oost-blauw/10 p-5 hover:shadow-lg hover:border-oost-blauw/30 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-oost-donkerblauw line-clamp-2">{name}</h3>
          <span className="text-xs text-oost-donkerblauw/40 ml-2 whitespace-nowrap">v{version}</span>
        </div>
        <p className="text-oost-donkerblauw/70 text-sm mb-4 flex-grow line-clamp-3">{short_description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map((cat) => (
            <span
              key={cat.slug}
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${categoryBadgeColors[cat.slug] || 'bg-oost-blauw/10 text-oost-blauw'}`}
            >
              {cat.name}
            </span>
          ))}
        </div>
        <StarDisplay rating={average_rating} />
      </div>
    </Link>
  );
}
