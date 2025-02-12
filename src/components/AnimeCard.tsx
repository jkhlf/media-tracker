import React from 'react';
import { Heart, ListPlus, CheckCircle } from 'lucide-react';
import { useAnimeStore, type Anime } from '../lib/store';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom'; 

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

export function AnimeCard({ anime, className }: AnimeCardProps) {
  const { favorites, watchlist, watched, addToFavorites, removeFromFavorites, addToWatchlist, addToWatched } = useAnimeStore();

  const isFavorite = favorites.some((a) => a.mal_id === anime.mal_id);
  const isWatchlisted = watchlist.some((a) => a.mal_id === anime.mal_id);
  const isWatched = watched.some((a) => a.mal_id === anime.mal_id);

  return (
    <Link to={`/anime/${anime.mal_id}`} className="group block"> {/* Wrap the entire card in a Link, use block display */}
      <div
        className={cn("relative overflow-hidden rounded-lg cursor-pointer", className)}
      >
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-full h-[300px] object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
                isFavorite ? removeFromFavorites(anime.mal_id) : addToFavorites(anime);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 stroke-red-500" : "stroke-white")} />
            </button>
            {!isWatched && (
              <button
                onClick={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation();
                  addToWatchlist(anime);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ListPlus className={cn("w-5 h-5", isWatchlisted ? "stroke-blue-400" : "stroke-white")} />
              </button>
            )}
            {isWatchlisted && (
              <button
                onClick={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation();
                  addToWatched(anime);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <CheckCircle className={cn("w-5 h-5", isWatched ? "stroke-green-400" : "stroke-white")} />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{anime.title}</h3>
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