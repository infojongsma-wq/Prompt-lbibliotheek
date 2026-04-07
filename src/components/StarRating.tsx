'use client';

import { useState } from 'react';

interface StarRatingProps {
  promptId: number;
  averageRating: number | null;
  ratingCount: number;
}

export default function StarRating({ promptId, averageRating: initialAvg, ratingCount: initialCount }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [average, setAverage] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);

  const handleRate = async (score: number) => {
    if (submitted) return;
    const res = await fetch(`/api/prompts/${promptId}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });
    if (res.ok) {
      const data = await res.json();
      setAverage(data.average_rating);
      setCount(data.rating_count);
      setSubmitted(true);
    }
  };

  const displayRating = average ? Math.round(average * 10) / 10 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-oost-donkerblauw">Beoordeling:</span>
        <span className="text-lg font-bold text-oost-geel">{displayRating > 0 ? displayRating : '-'}</span>
        <span className="text-sm text-oost-donkerblauw/50">({count} {count === 1 ? 'stem' : 'stemmen'})</span>
      </div>
      <div className="flex items-center gap-1">
        {!submitted ? (
          <>
            <span className="text-sm text-oost-donkerblauw/60 mr-2">Geef je beoordeling:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleRate(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-7 h-7 transition-colors ${star <= hover ? 'text-oost-geel' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </>
        ) : (
          <span className="text-sm text-oost-groen font-semibold">Bedankt voor je beoordeling!</span>
        )}
      </div>
    </div>
  );
}
