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
        {items.map((anime) => (
          <motion.div key={anime.mal_id} variants={item}>
            <AnimeCard anime={anime} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}