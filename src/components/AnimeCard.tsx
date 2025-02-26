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
}

export function AnimeCard({ anime, className, onRemove }: AnimeCardProps) {
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
    <Link to={`/anime/${anime.mal_id}`} className="group block">
      <div
        className={cn("relative overflow-hidden rounded-lg cursor-pointer", className)}
      >
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-full h-auto object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 stroke-red-500" : "stroke-white")} />
            </button>
            {!isWatched && (
              <button
                onClick={handleWatchlistToggle}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ListPlus className={cn("w-5 h-5", isWatchlisted ? "stroke-blue-400" : "stroke-white")} />
              </button>
            )}
            {isWatchlisted && (
              <button
                onClick={handleAddToWatched}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <CheckCircle className={cn("w-5 h-5", isWatched ? "stroke-green-400" : "stroke-white")} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemove}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 stroke-white" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{anime.title}</h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>Score: {anime.score}</span>
              {anime.year && <span>• {anime.year}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}