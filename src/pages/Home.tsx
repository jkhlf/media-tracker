import { useQuery } from '@tanstack/react-query';
import { getTopAnime, getSeasonNow, getAnimeRecommendations } from '../lib/api';
import { AnimeGrid } from '../components/AnimeGrid';
import { SeasonalChart } from '../components/SeasonalChart';
import { Loader } from 'lucide-react';
import React from 'react';

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

  return (
    <div className="space-y-10 pt-8 px-4 max-w-6xl mx-auto sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Chart da Temporada Atual */}
      {seasonNow && (
        <div>
          <SeasonalChart items={seasonNow.data.slice(0, 10)} />
        </div>
      )}

      {/* Top Anime */}
      {topAnime && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left mx-3">Top Anime</h2>
          <AnimeGrid
            items={topAnime.data.slice(0, 10)} // Reduzi o número de itens exibidos
          />
        </div>
      )}



      {/* Recomendações */}
      {recommendations && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left mx-3">Recommended for You</h2>
          <AnimeGrid
            items={recommendations.data
              .slice(0, 10) // Reduzi o número de itens exibidos
              .map((rec: any) => rec.entry[0])}
          />
        </div>
      )}
    </div>
  );
}
