import React, { useState } from 'react';
import { useAnimeStore } from '../lib/store';
import { AnimeCard } from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export function Library() {
  const { watched, favorites, watchlist, addToWatchlist, addToFavorites, removeFromWatchlist, removeFromFavorites } = useAnimeStore();
  const [selectedTab, setSelectedTab] = useState<'watchlist' | 'watched' | 'favorites'>('watchlist');

  const handleAddToWatchlist = (anime) => {
    if (watchlist.some(item => item.mal_id === anime.mal_id)) {
      toast.error('Anime already in watchlist');
    } else {
      addToWatchlist(anime);
      toast.success('Anime added to watchlist');
    }
  };

  const handleAddToFavorites = (anime) => {
    if (favorites.some(item => item.mal_id === anime.mal_id)) {
      toast.error('Anime already in favorites');
    } else {
      addToFavorites(anime);
      toast.success('Anime added to favorites');
    }
  };

  const handleRemoveFromWatchlist = (anime) => {
    removeFromWatchlist(anime.mal_id);
    toast.success('Anime removed from watchlist');
  };

  const handleRemoveFromFavorites = (anime) => {
    removeFromFavorites(anime.mal_id);
    toast.success('Anime removed from favorites');
  };

  const renderAnimeList = (animeList: any[], emptyMessage: string, onRemove: (anime: any) => void) => {
    if (animeList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <h2 className="text-2xl font-bold mb-2">{emptyMessage}</h2>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animeList.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} onRemove={() => onRemove(anime)} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 pt-8 px-4 max-w-6xl mx-auto sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6">Your Library</h2>
      <div className="border-b border-gray-800">
        <div className="flex gap-8">
          <TabButton
            active={selectedTab === 'watchlist'}
            onClick={() => setSelectedTab('watchlist')}
          >
            Watchlist
          </TabButton>
          <TabButton
            active={selectedTab === 'watched'}
            onClick={() => setSelectedTab('watched')}
          >
            Watched
          </TabButton>
          <TabButton
            active={selectedTab === 'favorites'}
            onClick={() => setSelectedTab('favorites')}
          >
            Favorites
          </TabButton>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pb-12"
      >
        {selectedTab === 'watchlist' && renderAnimeList(watchlist, 'Your watchlist is empty', handleRemoveFromWatchlist)}
        {selectedTab === 'watched' && renderAnimeList(watched, 'No watched anime yet', () => {})}
        {selectedTab === 'favorites' && renderAnimeList(favorites, 'No favorites yet', handleRemoveFromFavorites)}
      </motion.div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 relative flex items-center gap-2 ${
        active ? 'text-white' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        />
      )}
    </button>
  );
}

export default Library;
