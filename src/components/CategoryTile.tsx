import Link from 'next/link';
import Image from 'next/image';

const categoryColors: Record<string, string> = {
  tekst: 'bg-oost-blauw',
  creatief: 'bg-oost-paars',
  analyse: 'bg-oost-groen',
  onderzoek: 'bg-oost-oranje',
  productiviteit: 'bg-oost-rood',
  anders: 'bg-oost-geel',
};

const categoryIcons: Record<string, string> = {
  tekst: '/icons/icon-tekst.png',
  creatief: '/icons/icon-creatief.png',
  analyse: '/icons/icon-analyse.png',
  onderzoek: '/icons/icon-onderzoek.png',
  productiviteit: '/icons/icon-productiviteit.png',
  anders: '/icons/icon-anders.png',
};

interface CategoryTileProps {
  id: number;
  name: string;
  slug: string;
  prompt_count: number;
}

export default function CategoryTile({ name, slug, prompt_count }: CategoryTileProps) {
  const color = categoryColors[slug] || 'bg-oost-blauw';
  const icon = categoryIcons[slug];

  return (
    <Link href={`/categorie/${slug}`}>
      <div className={`${color} rounded-xl p-6 text-white hover:scale-105 transition-transform duration-200 shadow-lg cursor-pointer min-h-[140px] flex flex-col justify-between`}>
        <div className="flex justify-end">
          {icon ? (
            <Image
              src={icon}
              alt={name}
              width={48}
              height={48}
              className="opacity-70 object-contain"
            />
          ) : (
            <span className="text-4xl font-bold opacity-30">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
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
