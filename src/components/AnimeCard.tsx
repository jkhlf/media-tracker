import React from 'react';
import { Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Anime } from '../lib/store';

interface AnimeCardProps {
  anime: Anime;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  progress?: number;
  totalEpisodes?: number;
  userScore?: number | null;
}

export function AnimeCard({ anime, onRemove, showRemoveButton, progress, totalEpisodes, userScore }: AnimeCardProps) {
  const hasProgress = progress !== undefined && progress > 0;
  const isCompleted = progress !== undefined && totalEpisodes !== undefined && progress >= totalEpisodes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group"
    >
      <Link to={`/anime/${anime.mal_id}`} className="block rounded-lg overflow-hidden transition-transform duration-200 transform hover:scale-[1.02] hover:shadow-lg">
        <div className="relative aspect-[2/3]">
          <img
            src={anime.images?.webp?.image_url || 'https://via.placeholder.com/225x320?text=No+Image'}
            alt={anime.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Progress bar overlay at bottom of image */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/80">
              <div 
                className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                style={{ width: `${totalEpisodes ? (progress / totalEpisodes) * 100 : 0}%` }}
              />
            </div>
          )}

          {/* Score overlay */}
          {anime.score > 0 && (
            <div className="absolute top-2 right-2 bg-background/70 dark:bg-black/70 rounded-md px-1.5 py-0.5 flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-xs font-medium text-foreground">{anime.score.toFixed(1)}</span>
            </div>
          )}

          {/* User score overlay */}
          {userScore && (
            <div className="absolute top-2 left-2 bg-blue-600/80 rounded-md px-1.5 py-0.5 flex items-center">
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="ml-1 text-xs font-medium text-white">{userScore}</span>
            </div>
          )}
        </div>
        
        <div className="p-2 bg-card text-card-foreground">
          <h3 className="text-sm font-medium line-clamp-2">{anime.title}</h3>
          
          {/* Progress text */}
          {hasProgress && (
            <div className="mt-1 text-xs text-muted-foreground">
              {progress}/{totalEpisodes || '?'} eps {isCompleted && '(Completed)'}
            </div>
          )}
        </div>
      </Link>
      
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
          aria-label="Remove anime"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}