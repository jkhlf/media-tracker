import { useAnimeStore } from '../lib/store';
import { AnimeCard } from '../components/AnimeCard';
import React from 'react';

export function Favorites() {
  const { favorites } = useAnimeStore();

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
        <p>Start adding some anime to your favorites!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {favorites.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}