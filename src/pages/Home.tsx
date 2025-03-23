import { useQuery } from '@tanstack/react-query';
import { getTopAnime, getSeasonNow, getAnimeRecommendations } from '../lib/api';
import { AnimeGrid } from '../components/AnimeGrid';
import { SeasonalChart } from '../components/SeasonalChart';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import HomeBanner from '../components/HomeBanner';
import CollectionsGrid from '../components/CollectionsGrid';
import { allCollections } from '../data/collections';
import { CollectionProps } from '../components/AnimeCollection';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  const [userCollections, setUserCollections] = useState<CollectionProps[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar coleções do usuário do localStorage
  useEffect(() => {
    try {
      const savedCollections = localStorage.getItem('userCollections');
      if (savedCollections) {
        setUserCollections(JSON.parse(savedCollections));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
      setIsLoaded(true);
    }
  }, []);

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

  if (topLoading || seasonLoading || recommendationsLoading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="w-10 h-10 text-indigo-600 mb-4 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Carregando sua experiência de anime...</p>
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
    <div className="relative max-w-7xl mx-auto">
      {/* Banner Principal */}
      <HomeBanner />

      {/* Coleções do Usuário (se existirem) */}
      {userCollections.length > 0 && (
        <CollectionsGrid 
          title="Suas Coleções" 
          description="Coleções personalizadas que você criou"
          collections={userCollections} 
          showAddButton={true}
          isEditable={true}
        />
      )}

      {/* Coleções Temáticas Sugeridas */}
      <CollectionsGrid 
        title="Coleções Temáticas" 
        description="Explore nossas coleções cuidadosamente selecionadas para todos os gostos"
        collections={allCollections}
        showAddButton={userCollections.length === 0}
      />

      {/* Chart da Temporada Atual */}
      {seasonNow && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <SeasonalChart items={seasonNow.data.slice(0, 12)} />
        </div>
      )}

      {/* Top Anime */}
      {topAnime && (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Top Anime</h2>
          <AnimeGrid
            items={topAnime.data.slice(0, 12)}
          />
        </div>
      )}

      {/* Recomendações */}
      {recommendations && (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Recomendados para Você</h2>
          <AnimeGrid
            items={processRecommendations()}
          />
        </div>
      )}
    </div>
  );
}