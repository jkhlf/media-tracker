import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimeCard } from './AnimeCard';
import { type Anime } from '../lib/store';
import React from 'react';

interface SeasonalChartProps {
  items: Anime[];
}

export function SeasonalChart({ items }: SeasonalChartProps) {
  const today = new Date();
  const currentSeason = Math.floor((today.getMonth() / 12) * 4);
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h2 className="text-2xl font-bold">
          {seasons[currentSeason]} {format(today, 'yyyy')} Anime
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4"
      >
        {items.map((anime, index) => (
          <motion.div
            key={anime.mal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AnimeCard anime={anime} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}