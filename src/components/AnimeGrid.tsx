// src/components/AnimeGrid.tsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AnimeCard } from './AnimeCard';
import { type Anime } from '../lib/store';
import React from 'react';

interface AnimeGridProps {
  items: Anime[];
  title?: string;
}

export function AnimeGrid({ items, title }: AnimeGridProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Create a map to track duplicate IDs
  const seenIds = new Map();
  
  // Filter out duplicates or add an index to make keys unique
  const uniqueItems = items.map((anime, index) => {
    const animeId = anime.mal_id;
    if (seenIds.has(animeId)) {
      // Create a unique key for duplicates by adding an index suffix
      const uniqueId = `${animeId}-${index}`;
      return { ...anime, uniqueKey: uniqueId };
    } else {
      seenIds.set(animeId, true);
      return { ...anime, uniqueKey: animeId };
    }
  });

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold px-4">{title}</h2>}
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4"
      >
        {uniqueItems.map((anime) => (
          <motion.div key={anime.uniqueKey} variants={item}>
            <AnimeCard anime={anime} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}