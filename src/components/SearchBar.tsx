'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op trefwoord, onderwerp, categorie of doel..."
          className="w-full px-5 py-3 pr-12 text-lg border border-oost-blauw/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-oost-blauw focus:border-transparent shadow-sm bg-white text-oost-donkerblauw placeholder:text-oost-donkerblauw/40"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-oost-blauw/50 hover:text-oost-blauw transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
