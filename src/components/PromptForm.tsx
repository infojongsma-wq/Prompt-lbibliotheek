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
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
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
  const removeDocField = (index: number) =>
    setRequiredDocs((prev) => prev.filter((_, i) => i !== index));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Naam van de prompt *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Versienummer</label>
        <input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="1.0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categorieën *</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedCategories.includes(cat.id)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
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
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
              }
            }}
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm border border-gray-300"
          >
            Toevoegen
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Korte omschrijving * <span className={`${wordCount > 100 ? 'text-red-500' : 'text-gray-400'}`}>({wordCount}/100 woorden)</span>
        </label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prompt tekst *</label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zelf toe te voegen documenten/bronnen
        </label>
        {requiredDocs.map((doc, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={doc}
              onChange={(e) => updateDocField(i, e.target.value)}
              placeholder={`Document ${i + 1}`}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {requiredDocs.length > 1 && (
              <button
                type="button"
                onClick={() => removeDocField(i)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDocField}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Document toevoegen
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opmerkingen maker</label>
        <textarea
          value={makerNotes}
          onChange={(e) => setMakerNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Tips, aandachtspunten, of andere opmerkingen..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {submitting ? 'Opslaan...' : 'Prompt opslaan'}
      </button>
    </form>
  );
}
