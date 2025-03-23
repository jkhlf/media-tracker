import React, { useState } from 'react';
import { useAnimeStore } from '../lib/store';
import { useUserDataStore } from '../lib/userDataStore';
import { AnimeCard } from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Eye, BookMarked, Check, Heart, } from 'lucide-react';

export function Library() {
  const { 
    watching, 
    watched, 
    favorites, 
    watchlist, 
    addToWatchlist, 
    addToFavorites, 
    addToWatching, 
    removeFromWatchlist, 
    removeFromFavorites, 
    removeFromWatched,
    removeFromWatching,

  } = useAnimeStore();
  
  const { animeData } = useUserDataStore();
  
  const [selectedTab, setSelectedTab] = useState<'watching' | 'to-watch' | 'watched' | 'favorites' | 'collections'>('watching');
  
  const handleRemoveFromWatched = (anime) => {
    removeFromWatched(anime.mal_id);
    toast.success('Anime removed from watched list');
  };

  const handleRemoveFromWatching = (anime) => {
    removeFromWatching(anime.mal_id);
    toast.success('Anime removed from watching list');
  };

  const handleRemoveFromWatchlist = (anime) => {
    removeFromWatchlist(anime.mal_id);
    toast.success('Anime removed from to-watch list');
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
          <AnimeCard 
            key={anime.mal_id} 
            anime={anime} 
            onRemove={() => onRemove(anime)} 
            showRemoveButton={true} 
            progress={animeData[anime.mal_id]?.currentEpisode}
            totalEpisodes={animeData[anime.mal_id]?.totalEpisodes || anime.episodes}
            userScore={animeData[anime.mal_id]?.score}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 pt-8 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Your Library</h2>
      </div>
      
      <div className="border-b border-gray-800">
        <div className="flex overflow-x-auto gap-8 pb-1">
          <TabButton
            active={selectedTab === 'watching'}
            onClick={() => setSelectedTab('watching')}
          >
            <Eye size={18} />
            Watching
          </TabButton>
          <TabButton
            active={selectedTab === 'to-watch'}
            onClick={() => setSelectedTab('to-watch')}
          >
            <BookMarked size={18} />
            To Watch
          </TabButton>
          <TabButton
            active={selectedTab === 'watched'}
            onClick={() => setSelectedTab('watched')}
          >
            <Check size={18} />
            Watched
          </TabButton>
          <TabButton
            active={selectedTab === 'favorites'}
            onClick={() => setSelectedTab('favorites')}
          >
            <Heart size={18} />
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
        {selectedTab === 'watching' && renderAnimeList(watching, 'You are not watching any anime', handleRemoveFromWatching)}
        {selectedTab === 'to-watch' && renderAnimeList(watchlist, 'Your to-watch list is empty', handleRemoveFromWatchlist)}
        {selectedTab === 'watched' && renderAnimeList(watched, 'No watched anime yet', handleRemoveFromWatched)}
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
      className={`pb-4 relative flex items-center gap-2 whitespace-nowrap ${
        active ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-300'
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
