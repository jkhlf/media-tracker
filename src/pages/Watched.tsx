import { useAnimeStore } from '../lib/store';
import { AnimeCard } from '../components/AnimeCard';
import React from 'react';

export function Watched() {
  const { watched } = useAnimeStore();

  if (watched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <h2 className="text-2xl font-bold mb-2">No watched anime yet</h2>
        <p>Mark some anime as watched to track your progress!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Watched Anime</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {watched.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}