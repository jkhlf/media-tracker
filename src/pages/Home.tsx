import { useQuery } from '@tanstack/react-query';
import { getTopAnime, getSeasonNow, getAnimeRecommendations } from '../lib/api';
import { AnimeGrid } from '../components/AnimeGrid';
import { SeasonalChart } from '../components/SeasonalChart';
import { Loader } from 'lucide-react';
import React from 'react';
import HomeBanner from '../components/HomeBanner';

export function Home() {

  const { data: topAnime, isLoading: topLoading } = useQuery({
    queryKey: ['topAnime'],
    queryFn: () => getTopAnime(),
  });

  const { data: seasonNow, isLoading: seasonLoading } = useQuery({
    queryKey: ['seasonNow'],
    queryFn: () => getSeasonNow(),
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => getAnimeRecommendations(),
  });

  if (topLoading || seasonLoading || recommendationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const processRecommendations = () => {
    if (!recommendations?.data) return [];
    
    const uniqueAnimeMap = new Map();
    
    recommendations.data.forEach((rec: any) => {
      const entries = rec.entry || [];
      entries.forEach((entry: any) => {
        if (entry && entry.mal_id && !uniqueAnimeMap.has(entry.mal_id)) {
          uniqueAnimeMap.set(entry.mal_id, entry);
        }
      });
    });
    
    return Array.from(uniqueAnimeMap.values()).slice(0, 12);
  };

  return (
    <div className=" px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative">

      <HomeBanner />

      {/* Chart da Temporada Atual */}
      {seasonNow && (
        <div>
          <SeasonalChart items={seasonNow.data.slice(0, 12)} />
        </div>
      )}

      {/* Top Anime */}
      {topAnime && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left mx-3 mt-8">Top Anime</h2>
          <AnimeGrid
            items={topAnime.data.slice(0, 12)}
          />
        </div>
      )}

      {/* Recomendações */}
      {recommendations && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left mx-3">Recommended for You</h2>
          <AnimeGrid
            items={processRecommendations()}
          />
        </div>
      )}
    </div>
  );
}