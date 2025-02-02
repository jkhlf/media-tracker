import { useState } from 'react';
import { X, ExternalLink, Info, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimeDetails } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { AnimeStats } from './AnimeStats';
import React from 'react';

interface AnimeDetailsProps {
  animeId: number;
  onClose: () => void;
}

export function AnimeDetails({ animeId, onClose }: AnimeDetailsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['animeDetails', animeId],
    queryFn: () => getAnimeDetails(animeId),
  });

  const { addToWatchlist, addToFavorites } = useAnimeStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'watch'>('overview');

  const anime = data?.data;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center"
      >
        <div className="animate-pulse">Loading...</div>
      </motion.div>
    );
  }

  if (!anime) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center"
      >
        <div className="text-gray-400 text-center">
          <p>No details available for this anime.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/95 z-50 overflow-y-auto"
      >
        <div className="relative">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[55vh] max-w-3xl relative mx-auto px-4 md:px-8"
          >
            <img
              src={anime.images.webp.large_image_url || anime.images.webp.image_url}
              alt={anime.title}
              className="w-full h-[55vh] object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-900/50 rounded-full hover:bg-gray-900/75 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>

          {/* Content */}
          <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-32 relative space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-2xl md:text-4xl font-bold">{anime.title}</h1>

              <AnimeStats
                score={anime.score}
                rank={anime.rank}
                popularity={anime.popularity}
                members={anime.members}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addToWatchlist(anime)}
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Play className="w-5 h-5" /> Add to Watchlist
                </button>
                <button
                  onClick={() => addToFavorites(anime)}
                  className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add to Favorites
                </button>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="border-b border-gray-800">
              <div className="flex gap-8">
                <TabButton
                  active={selectedTab === 'overview'}
                  onClick={() => setSelectedTab('overview')}
                  icon={<Info className="w-4 h-4" />}
                >
                  Overview
                </TabButton>
                <TabButton
                  active={selectedTab === 'watch'}
                  onClick={() => setSelectedTab('watch')}
                  icon={<Play className="w-4 h-4" />}
                >
                  Where to Watch
                </TabButton>
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pb-12"
            >
              {selectedTab === 'overview' ? (
                <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed">{anime.synopsis}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {anime.genres && anime.genres.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {anime.genres.map((genre: any) => (
                            <span
                              key={genre.mal_id}
                              className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {anime.studios && anime.studios.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Studios</h3>
                        <div className="flex flex-wrap gap-2">
                          {anime.studios.map((studio: any) => (
                            <span
                              key={studio.mal_id}
                              className="text-blue-400"
                            >
                              {studio.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {anime.streaming && anime.streaming.length > 0 ? (
                    <div className="grid gap-4">
                      {anime.streaming.map((platform: any) => (
                        <a
                          key={platform.url}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <span>{platform.name}</span>
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No streaming platforms available.</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function TabButton({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 relative flex items-center gap-2 ${
        active ? 'text-white' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {icon}
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        />
      )}
    </button>
  );
}