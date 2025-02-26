import { Star, Medal, TrendingUp, Users } from 'lucide-react';
import React from 'react';

interface AnimeStatsProps {
  score?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
}

export function AnimeStats({ score, rank, popularity, members }: AnimeStatsProps) {
  // Helper function to format large numbers
  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="flex flex-wrap gap-4 text-gray-300">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        <span>{score !== null && score !== undefined ? score.toFixed(2) : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Medal className="w-5 h-5 text-blue-400" />
        <span>#{rank || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <span>#{popularity || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        <span>{formatNumber(members)}</span>
      </div>
    </div>
  );
}