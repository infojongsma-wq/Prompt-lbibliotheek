import Link from 'next/link';

const categoryColors: Record<string, string> = {
  tekst: 'bg-blue-500',
  creatief: 'bg-purple-500',
  analyse: 'bg-green-500',
  onderzoek: 'bg-orange-500',
  productiviteit: 'bg-rose-500',
  anders: 'bg-gray-500',
};

const categoryIcons: Record<string, string> = {
  tekst: 'T',
  creatief: 'C',
  analyse: 'A',
  onderzoek: 'O',
  productiviteit: 'P',
  anders: '?',
};

interface CategoryTileProps {
  id: number;
  name: string;
  slug: string;
  prompt_count: number;
}

export default function CategoryTile({ name, slug, prompt_count }: CategoryTileProps) {
  const color = categoryColors[slug] || 'bg-teal-500';
  const icon = categoryIcons[slug] || name.charAt(0).toUpperCase();

  return (
    <Link href={`/categorie/${slug}`}>
      <div className={`${color} rounded-xl p-6 text-white hover:scale-105 transition-transform duration-200 shadow-lg cursor-pointer min-h-[140px] flex flex-col justify-between`}>
        <div className="text-4xl font-bold opacity-30">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm opacity-80 mt-1">
            {prompt_count} {prompt_count === 1 ? 'prompt' : 'prompts'}
          </p>
        </div>
      </div>
    </Link>
  );
}
