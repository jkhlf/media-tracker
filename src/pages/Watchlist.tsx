import { useAnimeStore } from '../lib/store';
import { AnimeCard } from '../components/AnimeCard';
import React from 'react';

export function Watchlist() {
  const { watchlist } = useAnimeStore();

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
        <p>Add some anime to watch later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-8 px-4 max-w-6xl mx-auto sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {watchlist.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}