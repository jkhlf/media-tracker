import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Info, Play, Star, StarOff, Shuffle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAnimeDetails, getAnimeRecommendationsForDetails } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { AnimeStats } from '../components/AnimeStats';
import { useParams, Link } from 'react-router-dom'; 

interface UserAnimeData {
  episode?: number;
  notes?: string;
  rating?: number | null;
  watchHistory?: { startedAt?: string, lastWatchedAt?: string };
}

const localStorageKey = 'userAnimeData';

function RatingComponent({ rating, onRatingSet }: { rating: number | null, onRatingSet: (rating: number | null) => void }) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          className="focus:outline-none"
          onClick={() => onRatingSet(starIndex)}
          onMouseEnter={() => setHoverRating(starIndex)}
          onMouseLeave={() => setHoverRating(null)}
        >
          {starIndex <= (hoverRating !== null ? hoverRating : rating as any) ? (
            <Star className="w-6 h-6 text-yellow-500" />
          ) : (
            <StarOff className="w-6 h-6 text-gray-500" />
          )}
        </button>
      ))}
      <button
        type="button"
        className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
        onClick={() => onRatingSet(null)}
      >
        Clear
      </button>
    </div>
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


export function AnimeDetailsPage() { // Renamed to AnimeDetailsPage and removed props
  const { animeId: animeIdParam } = useParams(); // Get animeId from URL params
  const animeId = animeIdParam ? parseInt(animeIdParam, 10) : null; // Parse animeId to number

  const { data: animeDetailsData, isLoading } = useQuery({
    queryKey: ['animeDetails', animeId],
    queryFn: () => getAnimeDetails(animeId as number), // Type assertion as animeId is checked below
    enabled: animeId !== null, // Only run query if animeId is valid
  });
  const anime = animeDetailsData?.data;

  // --- User Data Features ---
  const [userAnimeData, setUserAnimeData] = useState<UserAnimeData>(() => {
    if (animeId === null) return {}; // Return empty if no animeId
    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData)[animeId] || {};
      return parsedData;
    }
    return {};
  });

  useEffect(() => {
    if (animeId === null) return; // Don't save if no animeId
    const storedData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
    storedData[animeId] = userAnimeData;
    localStorage.setItem(localStorageKey, JSON.stringify(storedData));
  }, [userAnimeData, animeId]);

  const handleEpisodeChange = (change: number) => {
    setUserAnimeData(prevData => ({
      ...prevData,
      episode: Math.max(0, (prevData.episode || 0) + change),
    }));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnimeData(prevData => ({ ...prevData, notes: event.target.value }));
  };

  const handleRatingSet = (rating: number | null) => {
    setUserAnimeData(prevData => ({ ...prevData, rating }));
  };

  const handleAddToWatchHistory = () => {
    setUserAnimeData(prevData => {
      const now = new Date().toISOString();
      return {
        ...prevData,
        watchHistory: {
          startedAt: prevData.watchHistory?.startedAt || now,
          lastWatchedAt: now,
        }
      };
    });
  };

  // --- React Query and Store Hooks ---
  const { addToWatchlist, addToFavorites } = useAnimeStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'personal' | 'watch' | 'related'>('overview');

  // --- Fetch Related Anime Recommendations ---
  const {
    data: relatedAnimeData,
    isLoading: isRelatedAnimeLoading,
    error: relatedAnimeError,
  } = useQuery({
    queryKey: ['animeRecommendations', animeId],
    queryFn: () => getAnimeRecommendationsForDetails (animeId as number), // Type assertion as animeId is checked
    enabled: selectedTab === 'related' && animeId !== null, // Conditionally enable query
  });

  const recommendations = relatedAnimeData?.data;


  if (isLoading || animeId === null) { // Handle null animeId (e.g., invalid route)
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        {animeId === null ? (
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">Invalid Anime ID.</p>
            <Link to="/" className="text-blue-500 hover:underline">Go back to Home</Link>
          </div>
        ) : (
          <div className="animate-pulse">Loading Anime Details...</div>
        )}
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p>No details available for this anime.</p>
          <Link to="/" className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-900 min-h-screen text-white" // Full page background
    >
      <div className="container mx-auto pt-12 pb-24"> {/* Container for content, added padding */}
        <div className="relative">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[55vh] max-w-5xl relative mx-auto px-4 md:px-8 rounded-lg overflow-hidden" // Added rounded-lg and overflow-hidden
          >
            <img
              src={anime.images.webp.large_image_url || anime.images.webp.image_url}
              alt={anime.title}
              className="w-full h-[55vh] object-cover" // Changed object-contain to object-cover for hero
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
            <Link to="/" className="absolute top-4 right-4 p-2 bg-gray-900/50 rounded-full hover:bg-gray-900/75 transition-colors">
              <X className="w-6 h-6" />
            </Link>
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
                  onClick={() => { addToWatchlist(anime); handleAddToWatchHistory(); }}
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
                  active={selectedTab === 'personal'}
                  onClick={() => setSelectedTab('personal')}
                  icon={<Star className="w-4 h-4" />}
                >
                  Personal
                </TabButton>
                <TabButton
                  active={selectedTab === 'watch'}
                  onClick={() => setSelectedTab('watch')}
                  icon={<Play className="w-4 h-4" />}
                >
                  Where to Watch
                </TabButton>
                <TabButton
                  active={selectedTab === 'related'}
                  onClick={() => setSelectedTab('related')}
                  icon={<Shuffle className="w-4 h-4" />}
                >
                  Related Anime
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
              {selectedTab === 'overview' && (
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
              )}

              {selectedTab === 'personal' && (
                <div className="space-y-6">
                  {/* Episode Tracking */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Episode Tracking</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleEpisodeChange(-1)}
                        className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >-</button>
                      <span className="text-xl">{userAnimeData.episode || 0}</span>
                      <button
                        onClick={() => handleEpisodeChange(1)}
                        className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >+</button>
                    </div>
                  </div>

                  {/* Personal Notes */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Notes</h3>
                    <textarea
                      value={userAnimeData.notes || ''}
                      onChange={handleNotesChange}
                      placeholder="Write your notes here..."
                      className="w-full p-3 bg-gray-800 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Custom Rating */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Your Rating</h3>
                    <RatingComponent rating={userAnimeData.rating as any} onRatingSet={handleRatingSet} />
                  </div>

                  {/* Watch History */}
                  {userAnimeData.watchHistory && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Watch History</h3>
                      {userAnimeData.watchHistory.startedAt && (
                        <p className="text-gray-300">Started Watching: {new Date(userAnimeData.watchHistory.startedAt).toLocaleDateString()}</p>
                      )}
                      {userAnimeData.watchHistory.lastWatchedAt && (
                        <p className="text-gray-300">Last Watched: {new Date(userAnimeData.watchHistory.lastWatchedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'watch' && (
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

              {selectedTab === 'related' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-2">Related Anime Recommendations</h3>
                  {isRelatedAnimeLoading ? (
                    <div className="animate-pulse text-gray-400">Loading recommendations...</div>
                  ) : relatedAnimeError ? (
                    <div className="text-red-500">Error loading recommendations.</div>
                  ) : recommendations && recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map((recommendation: any) => (
                        <div key={recommendation.entry.mal_id} className="bg-gray-800 rounded-lg p-4 flex flex-col"> {/* Flex column for image and text */}
                          <a
                            href={`https://myanimelist.net/anime/${recommendation.entry.mal_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            <h4 className="font-semibold text-blue-400">{recommendation.entry.title}</h4>
                          </a>
                          {recommendation.entry.images?.webp?.thumb_image_url && ( // Check if image URL exists
                            <img
                              src={recommendation.entry.images.webp.thumb_image_url}
                              alt={recommendation.entry.title}
                              className="w-full h-32 object-cover rounded-md mt-2 mb-2" // Added image style
                            />
                          )}
                          <p className="text-gray-300 text-sm mt-auto">{recommendation.content}</p> {/* mt-auto to push content to bottom */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No recommendations found for this anime.</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AnimeDetailsPage;