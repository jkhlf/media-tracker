import React from 'react';
import { Heart, ListPlus, CheckCircle, X } from 'lucide-react';
import { useAnimeStore, type Anime } from '../lib/store';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom'; 
import { toast } from 'react-toastify';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, className, onRemove, showRemoveButton = false }) => {
  const { favorites, watchlist, watched, addToFavorites, removeFromFavorites, addToWatchlist, addToWatched, removeFromWatchlist } = useAnimeStore();

  const isFavorite = favorites.some((a) => a.mal_id === anime.mal_id);
  const isWatchlisted = watchlist.some((a) => a.mal_id === anime.mal_id);
  const isWatched = watched.some((a) => a.mal_id === anime.mal_id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (isFavorite) {
      removeFromFavorites(anime.mal_id);
      toast.info(`Removed "${anime.title}" from favorites`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      addToFavorites(anime);
      toast.success(`Added "${anime.title}" to favorites`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (isWatchlisted) {
      removeFromWatchlist(anime.mal_id);
      toast.info(`Removed "${anime.title}" from watchlist`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      addToWatchlist(anime);
      toast.success(`Added "${anime.title}" to watchlist`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleAddToWatched = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    addToWatched(anime);
    toast.success(`Marked "${anime.title}" as watched`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onRemove) {
      onRemove();
      toast.info(`Removed "${anime.title}"`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden shadow-md bg-gray-50 dark:bg-[#121212]/70 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-xl">
      {showRemoveButton && onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-10 bg-gray-900/70 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} className="text-white" />
        </button>
      )}
      
      <Link to={`/anime/${anime.mal_id}`} className="block">
        <div className="aspect-[2/3] w-full relative">
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {anime.score && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
              ★ {anime.score.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{anime.title}</h3>
        </div>
      </Link>
    </div>
  );
};

export default AnimeCard;