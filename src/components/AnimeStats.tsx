import { Star, Users, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

interface AnimeStatsProps {
  score: number;
  rank?: number;
  popularity?: number;
  members?: number;
}

export function AnimeStats({ score, rank, popularity, members }: AnimeStatsProps) {
  const stats = [
    {
      icon: <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />,
      label: 'Score',
      value: score.toFixed(2),
    },
    rank ? {
      icon: <Trophy className="w-4 h-4 text-purple-400" />,
      label: 'Rank',
      value: `#${rank}`,
    } : null,
    popularity ? {
      icon: <TrendingUp className="w-4 h-4 text-green-400" />,
      label: 'Popularity',
      value: `#${popularity}`,
    } : null,
    members ? {
      icon: <Users className="w-4 h-4 text-blue-400" />,
      label: 'Members',
      value: members.toLocaleString(),
    } : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat?.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2"
        >
          {stat?.icon}
          <div className="text-sm">
            <span className="text-gray-400">{stat?.label}:</span>{' '}
            <span className="font-medium">{stat?.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}