import { Play, Plus, Check } from 'lucide-react';
import { type Anime } from '../lib/store';
import React from 'react';

interface FeaturedAnimeProps {
  anime: Anime;
}

export function FeaturedAnime({ anime }: FeaturedAnimeProps) {
  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <h1 className="text-5xl font-bold">{anime.title}</h1>
        <div className="flex gap-4">
          <button className="px-8 py-2 bg-white text-black rounded-lg font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors">
            <Play className="w-5 h-5" /> Watch Now
          </button>
          <button className="px-8 py-2 bg-gray-500/50 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-500/70 transition-colors">
            <Plus className="w-5 h-5" /> Add to List
          </button>
        </div>
      </div>
    </div>
  );
}