'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types';

export default function PromptForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [shortDescription, setShortDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [requiredDocs, setRequiredDocs] = useState<string[]>(['']);
  const [makerNotes, setMakerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
  }, []);

  const wordCount = shortDescription.trim() ? shortDescription.trim().split(/\s+/).length : 0;

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setSelectedCategories((prev) => [...prev, cat.id]);
      setNewCategoryName('');
    }
  };

  const addDocField = () => setRequiredDocs((prev) => [...prev, '']);
  const removeDocField = (index: number) => setRequiredDocs((prev) => prev.filter((_, i) => i !== index));
  const updateDocField = (index: number, value: string) =>
    setRequiredDocs((prev) => prev.map((d, i) => (i === index ? value : d)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !shortDescription.trim() || !promptText.trim()) {
      setError('Naam, korte omschrijving en prompttekst zijn verplicht.');
      return;
    }
    if (wordCount > 100) {
      setError('Korte omschrijving mag maximaal 100 woorden bevatten.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Selecteer minimaal één categorie.');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        version: version.trim() || '1.0',
        short_description: shortDescription.trim(),
        prompt_text: promptText,
        category_ids: selectedCategories,
        required_documents: requiredDocs.filter((d) => d.trim()),
        maker_notes: makerNotes.trim(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/prompt/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Er is iets misgegaan.');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2 border border-oost-blauw/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-oost-blauw bg-white text-oost-donkerblauw placeholder:text-oost-donkerblauw/40";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="bg-oost-rood/10 border border-oost-rood/30 text-oost-rood px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-1">Naam van de prompt *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-1">Versienummer</label>
        <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className={inputClass} placeholder="1.0" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-2">Categorieën *</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors font-semibold ${
                selectedCategories.includes(cat.id)
                  ? 'bg-oost-blauw text-white border-oost-blauw'
                  : 'bg-white text-oost-donkerblauw border-oost-blauw/20 hover:border-oost-blauw'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nieuwe categorie toevoegen..."
            className="flex-grow px-3 py-2 border border-oost-blauw/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oost-blauw bg-white text-oost-donkerblauw placeholder:text-oost-donkerblauw/40"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-oost-lichtblauw text-oost-donkerblauw rounded-lg hover:bg-oost-blauw/10 text-sm border border-oost-blauw/20 font-semibold"
          >
            Toevoegen
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-1">
          Korte omschrijving *{' '}
          <span className={wordCount > 100 ? 'text-oost-rood' : 'text-oost-donkerblauw/40'}>({wordCount}/100 woorden)</span>
        </label>
        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-1">Prompt tekst *</label>
        <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={12} className={`${inputClass} font-mono text-sm`} required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-2">Zelf toe te voegen documenten/bronnen</label>
        {requiredDocs.map((doc, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={doc}
              onChange={(e) => updateDocField(i, e.target.value)}
              placeholder={`Document ${i + 1}`}
              className="flex-grow px-3 py-2 border border-oost-blauw/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oost-blauw bg-white text-oost-donkerblauw placeholder:text-oost-donkerblauw/40"
            />
            {requiredDocs.length > 1 && (
              <button type="button" onClick={() => removeDocField(i)} className="px-3 py-2 text-oost-rood hover:bg-oost-rood/10 rounded-lg">
                &times;
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addDocField} className="text-sm text-oost-blauw hover:text-oost-blauw/70 font-semibold">
          + Document toevoegen
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-oost-donkerblauw mb-1">Opmerkingen maker</label>
        <textarea value={makerNotes} onChange={(e) => setMakerNotes(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Tips, aandachtspunten, of andere opmerkingen..." />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-oost-blauw text-white rounded-lg font-bold hover:bg-oost-blauw/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {submitting ? 'Opslaan...' : 'Prompt opslaan'}
      </button>
    </form>
  );
}
