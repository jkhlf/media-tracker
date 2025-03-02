import React from 'react';
import { Star, Trophy, Users, TrendingUp } from 'lucide-react';

interface AnimeStatsProps {
  score?: number;
  rank?: number;
  popularity?: number;
  members?: number;
}

export const AnimeStats: React.FC<AnimeStatsProps> = ({ score, rank, popularity, members }) => {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {score !== undefined && score > 0 && (
        <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{score.toFixed(2)}</span>
        </div>
      )}
      
      {rank !== undefined && rank > 0 && (
        <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>#{rank}</span>
        </div>
      )}
      
      {popularity !== undefined && popularity > 0 && (
        <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span>#{popularity}</span>
        </div>
      )}
      
      {members !== undefined && members > 0 && (
        <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-green-500" />
          <span>{members.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};