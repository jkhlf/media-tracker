import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftFromLine, Heart, PlusCircle, Star, X, Play, Eye, BookmarkPlus, 
  Check, Loader, Calendar, Award, TrendingUp, Film, Info, ExternalLink, 
  Clock, Users, BarChart2, Tv, Video, Briefcase, Radio
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnimeDetails, getAnimeRecommendationsForDetails, getAnimeCharacters, getAnimeVoices } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { useUserDataStore } from '../lib/userDataStore';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dialog } from '@headlessui/react';
import AnimeTracker from '../components/AnimeTracker';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString; // Fallback to original string if parsing fails
  }
};

// Helper to capitalize words
const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Helper function to format broadcast information
const formatBroadcast = (broadcast) => {
  if (!broadcast || (!broadcast.day && !broadcast.time)) {
    return 'Unknown broadcast time';
  }
  
  let result = '';
  if (broadcast.day) result += broadcast.day + 's';
  if (broadcast.time) result += ' at ' + broadcast.time;
  if (broadcast.timezone) result += ' (' + broadcast.timezone + ')';
  return result;
};

// Helper function to format duration
const formatDuration = (duration) => {
  if (!duration) return 'Unknown';
  return duration.replace('per ep', 'per episode');
};

function TabButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 relative px-6 ${
        active 
          ? 'text-white border-b-2 border-blue-500 font-medium' 
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function AnimeDetailsPage() { 
  const { animeId: animeIdParam } = useParams();
  const animeId = animeIdParam ? parseInt(animeIdParam, 10) : null;

  // Primary anime details query
  const { 
    data: animeDetailsData, 
    isLoading 
  } = useQuery({
    queryKey: ['animeDetails', animeId],
    queryFn: () => getAnimeDetails(animeId as number),
    enabled: animeId !== null,
  });
  
  const anime = animeDetailsData?.data;

  // Always call hooks in the same order
  // Define all states at the top of the component
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [userAnimeData, setUserAnimeData] = useState<{
    episode?: number;
    notes?: string;
    rating?: number | null;
    watchHistory?: { startedAt?: string, lastWatchedAt?: string };
  }>({});

  // Store hooks
  const { 
    addToWatchlist, 
    removeFromWatchlist,
    addToFavorites, 
    removeFromFavorites,
    favorites,
    watchlist,
    watched,
    watching,
    collections,
    addToWatched,
    addToWatching,
    removeFromWatched,
    removeFromWatching,
    addToCollection,
    createCollection,
    removeFromCollection
  } = useAnimeStore();
  
  // Get user tracking data
  const { animeData, updateAnimeData } = useUserDataStore();

  // Group relations by type - Always call useMemo, even if anime is undefined
  const relationsByType = useMemo(() => {
    if (!anime?.relations) return {};
    
    const grouped = {};
    anime.relations.forEach(relation => {
      if (!grouped[relation.relation]) {
        grouped[relation.relation] = [];
      }
      grouped[relation.relation] = [...grouped[relation.relation], ...relation.entry];
    });
    
    return grouped;
  }, [anime?.relations]);
  
  // Check if anime is in various lists - these are now computed with useMemo
  const isInFavorites = useMemo(() => 
    animeId ? favorites.some(item => item.mal_id === animeId) : false
  , [animeId, favorites]);
  
  const isInWatchlist = useMemo(() => 
    animeId ? watchlist.some(item => item.mal_id === animeId) : false
  , [animeId, watchlist]);
  
  const isInWatched = useMemo(() => 
    animeId ? watched.some(item => item.mal_id === animeId) : false
  , [animeId, watched]);
  
  const isInWatching = useMemo(() => 
    animeId ? watching.some(item => item.mal_id === animeId) : false
  , [animeId, watching]);

  // Check which collections contain this anime
  const animeCollections = useMemo(() => 
    animeId 
      ? collections.filter(collection => 
          collection.animes.some(anime => anime.mal_id === animeId)
        )
      : []
  , [animeId, collections]);

  // Lazy loaded data for different tabs
  const {
    data: recommendationsData,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
  } = useQuery({
    queryKey: ['animeRecommendations', animeId],
    queryFn: () => getAnimeRecommendationsForDetails(animeId as number),
    enabled: selectedTab === 'recommendations' && animeId !== null,
  });

  const {
    data: charactersData,
    isLoading: isCharactersLoading,
    error: charactersError,
  } = useQuery({
    queryKey: ['animeCharacters', animeId],
    queryFn: () => getAnimeCharacters(animeId as number),
    enabled: selectedTab === 'characters' && animeId !== null,
  });

  const {
    data: staffData,
    isLoading: isStaffLoading,
    error: staffError,
  } = useQuery({
    queryKey: ['animeVoices', animeId],
    queryFn: () => getAnimeVoices(animeId as number),
    enabled: selectedTab === 'voices' && animeId !== null,
  });

  // Initialize user data state from localStorage
  useEffect(() => {
    if (animeId === null) return;
    
    const storedData = localStorage.getItem('userAnimeData');
    if (storedData) {
      const parsedData = JSON.parse(storedData)[animeId] || {};
      setUserAnimeData(parsedData);
    }
  }, [animeId]);

  // Update localStorage when user data changes
  useEffect(() => {
    if (animeId === null) return;
    
    const storedData = JSON.parse(localStorage.getItem('userAnimeData') || '{}');
    storedData[animeId] = userAnimeData;
    localStorage.setItem('userAnimeData', JSON.stringify(storedData));
  }, [userAnimeData, animeId]);

  // Set start date if this is the first time viewing this anime
  useEffect(() => {
    if (animeId && anime && !animeData[animeId]?.startDate) {
      updateAnimeData(animeId, {
        startDate: new Date().toISOString(),
        totalEpisodes: anime.episodes || undefined
      });
    }
  }, [animeId, anime, animeData, updateAnimeData]);

  // Update metadata when anime details are loaded
  useEffect(() => {
    if (animeId && anime) {
      // Store title and image when details load
      updateAnimeData(animeId, {
        title: anime.title,
        image: anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url,
        totalEpisodes: anime.episodes || undefined
      });
    }
  }, [animeId, anime, updateAnimeData]);

  // Event handlers for collection and lists
  const handleFavoriteToggle = () => {
    if (!anime) return;
    
    if (isInFavorites) {
      removeFromFavorites(anime.mal_id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(anime);
      toast.success('Added to favorites');
    }
  };

  const handleWatchlistToggle = () => {
    if (!anime) return;
    
    if (isInWatchlist) {
      removeFromWatchlist(anime.mal_id);
      toast.success('Removed from watch list');
    } else {
      addToWatchlist(anime);
      toast.success('Added to watch list');
    }
  };
  
  // When marking as watched, update to set all episodes as watched
  const handleWatchedToggle = () => {
    if (!anime) return;
    
    if (isInWatched) {
      removeFromWatched(anime.mal_id);
      toast.success('Removed from watched');
    } else {
      addToWatched(anime);
      // Also mark all episodes as watched in tracker
      if (anime.episodes) {
        updateAnimeData(anime.mal_id, {
          currentEpisode: anime.episodes,
          finishDate: new Date().toISOString(),
          title: anime.title,
          image: anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url
        });
        toast.success(`Marked all ${anime.episodes} episodes as watched`);
      } else {
        toast.success('Marked as watched');
      }
    }
  };
  
  const handleWatchingToggle = () => {
    if (!anime) return;
    
    if (isInWatching) {
      removeFromWatching(anime.mal_id);
      toast.success('Removed from watching');
    } else {
      addToWatching(anime);
      toast.success('Added to watching');
    }
  };
  
  const handleAddToCollection = (collectionName) => {
    if (!anime) return;
    
    addToCollection(anime, collectionName);
    toast.success(`Added to ${collectionName}`);
    setIsDropdownOpen(false);
  };
  
  const handleRemoveFromCollection = (collectionName) => {
    if (!animeId) return;
    
    removeFromCollection(animeId, collectionName);
    toast.success(`Removed from collection: ${collectionName}`);
    setIsDropdownOpen(false);
  };
  
  const handleCreateCollection = () => {
    if (!anime || !newCollectionName.trim()) return;
    
    if (collections.some(c => c.name === newCollectionName)) {
      toast.error('Collection with this name already exists');
      return;
    }
    
    createCollection(newCollectionName);
    addToCollection(anime, newCollectionName);
    toast.success(`Added to new collection: ${newCollectionName}`);
    setNewCollectionName('');
    setIsCreateCollectionOpen(false);
    setIsDropdownOpen(false);
  };

  // Loading state
  if (isLoading || animeId === null) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin text-blue-500" />
          <p>Loading anime details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!anime) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-white">
      {/* Hero Banner with background image */}
      <div 
        className="relative w-auto h-[450px] bg-cover bg-center" 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${anime.images?.jpg?.large_image_url})`,
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
        
        <div className="container mx-auto h-full px-4 relative pt-8">
          <Link to="/" className="inline-block p-2 bg-black/50 rounded-full hover:bg-black/75 transition-colors">
            <ArrowLeftFromLine className="w-6 h-6 text-white" /> 
          </Link>
          
          {/* Watch Trailer Button */}
          {anime.trailer?.url && (
            <div className="absolute top-8 right-4">
              <a 
                href={anime.trailer.url}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
              >
                <Play className="w-4 h-4" /> Watch Trailer
              </a>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 flex">
            {/* Anime Poster */}
            <div className="w-48 h-72 rounded-md overflow-hidden shadow-lg border border-gray-700 mr-6 flex-shrink-0">
              <img 
                src={anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url} 
                alt={anime.title} 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            
            {/* Anime Info */}
            <div className="pt-20">
              <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <h2 className="text-xl text-gray-400 mb-2">{anime.title_english}</h2>
              )}
              
              <div className="flex items-center gap-6 mb-6">
                {anime.score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-medium">{anime.score}</span>
                    <span className="text-sm text-gray-400">
                      ({anime.scored_by ? new Intl.NumberFormat().format(anime.scored_by) : '?'} users)
                    </span>
                  </div>
                )}
                
                {anime.rank && (
                  <div className="flex items-center gap-1">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span className="text-sm">Rank #{anime.rank}</span>
                  </div>
                )}
                
                {anime.popularity && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm">#{anime.popularity} in Popularity</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleWatchingToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInWatching ? 'bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'
                  } transition-colors`}
                >
                  <Eye className="w-4 h-4" /> 
                  {isInWatching ? 'Watching' : 'Add to Watching'}
                </button>
                
                <button
                  onClick={handleWatchlistToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInWatchlist ? 'bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'
                  } transition-colors`}
                >
                  <BookmarkPlus className="w-4 h-4" /> 
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
                
                <button
                  onClick={handleWatchedToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInWatched ? 'bg-green-700' : 'bg-gray-800 hover:bg-gray-700'
                  } transition-colors`}
                >
                  <Check className="w-4 h-4" /> 
                  {isInWatched ? 'Watched' : 'Mark as Watched'}
                </button>
                
                <button
                  onClick={handleFavoriteToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInFavorites ? 'bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                  } transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-white' : ''}`} /> 
                  {isInFavorites ? 'Favorited' : 'Add to Favorites'}
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-4 py-2 rounded-md flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Add to Collection
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 w-64 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => setIsCreateCollectionOpen(true)}
                          className="w-full py-2 px-3 text-left rounded-md text-white hover:bg-gray-700 flex items-center gap-2"
                        >
                          <PlusCircle size={16} />
                          Create new collection
                        </button>
                        
                        {/* If the anime is in any collections, show them with option to remove */}
                        {animeCollections.length > 0 && (
                          <>
                            <div className="h-px bg-gray-700 my-2"></div>
                            <p className="px-3 py-1 text-xs text-gray-400">In collections:</p>
                            
                            {animeCollections.map((collection) => (
                              <div key={collection.name} className="flex items-center justify-between py-1 px-3 hover:bg-gray-700 rounded-md">
                                <span className="text-sm text-gray-300">{collection.name}</span>
                                <button
                                  onClick={() => handleRemoveFromCollection(collection.name)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  title={`Remove from ${collection.name}`}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {collections.filter(c => !animeCollections.some(ac => ac.name === c.name)).length > 0 && (
                          <>
                            <div className="h-px bg-gray-700 my-2"></div>
                            <p className="px-3 py-1 text-xs text-gray-400">Add to collection:</p>
                            
                            {collections
                              .filter(c => !animeCollections.some(ac => ac.name === c.name))
                              .map((collection) => (
                                <button
                                  key={collection.name}
                                  onClick={() => handleAddToCollection(collection.name)}
                                  className="w-full py-2 px-3 text-left rounded-md text-white hover:bg-gray-700"
                                >
                                  {collection.name}
                                </button>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex overflow-x-auto border-b border-gray-800">
          <TabButton
            active={selectedTab === 'overview'}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={selectedTab === 'details'}
            onClick={() => setSelectedTab('details')}
          >
            Details
          </TabButton>
          <TabButton
            active={selectedTab === 'characters'}
            onClick={() => setSelectedTab('characters')}
          >
            Characters
          </TabButton>
          <TabButton
            active={selectedTab === 'voices'}
            onClick={() => setSelectedTab('voices')}
          >
            Voices
          </TabButton>
          <TabButton
            active={selectedTab === 'related'}
            onClick={() => setSelectedTab('related')}
          >
            Related
          </TabButton>
          <TabButton
            active={selectedTab === 'recommendations'}
            onClick={() => setSelectedTab('recommendations')}
          >
            Recommendations
          </TabButton>
        </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-1 bg-gray-900 p-6 rounded-lg">
                {anime.type && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Type</h3>
                    <p className="font-medium">{anime.type}</p>
                  </div>
                )}
                
                {anime.episodes !== null && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Episodes</h3>
                    <p className="font-medium">{anime.episodes || 'Unknown'}</p>
                  </div>
                )}
                
                {anime.status && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Status</h3>
                    <p className="font-medium">{anime.status}</p>
                  </div>
                )}
                
                {anime.aired && anime.aired.from && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Aired</h3>
                    <p className="font-medium">{formatDate(anime.aired.from)}</p>
                  </div>
                )}
                
                {anime.season && anime.year && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Season</h3>
                    <p className="font-medium">{capitalize(anime.season)} {anime.year}</p>
                  </div>
                )}
                
                {anime.studios && anime.studios.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm">Studio</h3>
                    <p className="font-medium">{anime.studios[0].name}</p>
                  </div>
                )}
                
                <div className="mt-2">
                  <h3 className="text-gray-400 text-sm mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres && anime.genres.map(genre => (
                      <span 
                        key={genre.mal_id}
                        className="px-3 py-1 bg-gray-800 text-sm rounded-full"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-gray-900 p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed">{anime.synopsis}</p>
              </div>
            </div>
            
            {/* New section: Anime Tracker */}
            {animeId && (
              <div className="mb-10">
                <AnimeTracker 
                  animeId={animeId} 
                  totalEpisodes={anime?.episodes} 
                  animeDetails={anime}
                />
              </div>
            )}
            
            {/* External Links */}
            {anime.external && anime.external.length > 0 && (
              <div className="space-y-4 max-w-6xl mt-6">
                <h3 className="text-xl font-semibold">External Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {anime.external.slice(0,3).map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Streaming Services */}
            {anime.streaming && anime.streaming.length > 0 && (
              <div className="space-y-4 max-w-6xl mt-6">
                <h3 className="text-xl font-semibold">Where to Watch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {anime.streaming.map((service, index) => (
                    <a
                      key={index}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <span>{service.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Detailed Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4 border-b border-gray-800 pb-2">Basic Information</h3>
                
                <div className="space-y-4">
                  {anime.type && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Type</div>
                      <div className="w-2/3 font-medium">{anime.type}</div>
                    </div>
                  )}
                  
                  {anime.source && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Source</div>
                      <div className="w-2/3 font-medium">{anime.source}</div>
                    </div>
                  )}
                  
                  {anime.episodes !== null && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Episodes</div>
                      <div className="w-2/3 font-medium">{anime.episodes || 'Unknown'}</div>
                    </div>
                  )}
                  
                  {anime.duration && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Duration</div>
                      <div className="w-2/3 font-medium">{formatDuration(anime.duration)}</div>
                    </div>
                  )}
                  
                  {anime.rating && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Rating</div>
                      <div className="w-2/3 font-medium">{anime.rating}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4 border-b border-gray-800 pb-2">Statistics</h3>
                
                <div className="space-y-4">
                  {anime.score !== null && (
                    <div className="flex items-center">
                      <div className="w-1/3 text-gray-400">Score</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                        {anime.score} 
                        <span className="text-sm text-gray-400 ml-1">
                          ({anime.scored_by ? new Intl.NumberFormat().format(anime.scored_by) : '?'} users)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {anime.rank && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Rank</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <Award className="w-4 h-4 text-purple-400 mr-1" />
                        #{anime.rank}
                      </div>
                    </div>
                  )}
                  
                  {anime.popularity && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Popularity</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        #{anime.popularity}
                      </div>
                    </div>
                  )}
                  
                  {anime.members && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Members</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <Users className="w-4 h-4 text-blue-400 mr-1" />
                        {new Intl.NumberFormat().format(anime.members)}
                      </div>
                    </div>
                  )}
                  
                  {anime.favorites && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Favorites</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <Heart className="w-4 h-4 text-red-400 mr-1" />
                        {new Intl.NumberFormat().format(anime.favorites)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Broadcast & Season */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-4 border-b border-gray-800 pb-2">Broadcast Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {anime.status && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Status</div>
                      <div className="w-2/3 font-medium">{anime.status}</div>
                    </div>
                  )}
                  
                  {anime.aired && (anime.aired.from || anime.aired.to) && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Aired</div>
                      <div className="w-2/3 font-medium">
                        {anime.aired.from ? formatDate(anime.aired.from) : '?'} 
                        {anime.aired.to ? ` to ${formatDate(anime.aired.to)}` : anime.aired.from ? ' (ongoing)' : ''}
                      </div>
                    </div>
                  )}
                  
                  {anime.season && anime.year && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Season</div>
                      <div className="w-2/3 font-medium">
                        {capitalize(anime.season)} {anime.year}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {anime.broadcast && (anime.broadcast.day || anime.broadcast.time) && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Broadcast</div>
                      <div className="w-2/3 font-medium flex items-center">
                        <Radio className="w-4 h-4 text-blue-400 mr-2" />
                        {formatBroadcast(anime.broadcast)}
                      </div>
                    </div>
                  )}
                  
                  {anime.producers && anime.producers.length > 0 && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Producers</div>
                      <div className="w-2/3 font-medium">
                        {anime.producers.map(producer => producer.name).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {anime.licensors && anime.licensors.length > 0 && (
                    <div className="flex">
                      <div className="w-1/3 text-gray-400">Licensors</div>
                      <div className="w-2/3 font-medium">
                        {anime.licensors.map(licensor => licensor.name).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Classification Categories */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-4 border-b border-gray-800 pb-2">Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                {anime.genres && anime.genres.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map(genre => (
                        <span 
                          key={genre.mal_id}
                          className="px-3 py-1 bg-blue-900/50 text-sm rounded-full"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {anime.themes && anime.themes.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {anime.themes.map(theme => (
                        <span 
                          key={theme.mal_id}
                          className="px-3 py-1 bg-purple-900/50 text-sm rounded-full"
                        >
                          {theme.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {anime.demographics && anime.demographics.length > 0 && (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-gray-400 mb-2">Demographics</h4>
                    <div className="flex flex-wrap gap-2">
                      {anime.demographics.map(demographic => (
                        <span 
                          key={demographic.mal_id}
                          className="px-3 py-1 bg-green-900/50 text-sm rounded-full"
                        >
                          {demographic.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Background */}
            {anime.background && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4 border-b border-gray-800 pb-2">Background</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{anime.background}</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'voices' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Voice Actors</h2>
            {isStaffLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : staffError ? (
              <div className="text-red-500 text-center">Failed to load voice actor information.</div>
            ) : staffData?.data && staffData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffData.data.map((voiceActor) => (
                  <div key={`${voiceActor.person.mal_id}`} className="bg-gray-900 rounded-lg overflow-hidden flex">
                    <div className="w-20 h-20 bg-gray-800 overflow-hidden">
                      <img 
                        src={voiceActor.person.images?.jpg?.image_url || `https://via.placeholder.com/80?text=${encodeURIComponent(voiceActor.person.name.charAt(0))}`}
                        alt={voiceActor.person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                      <h3 className="font-medium text-white">{voiceActor.person.name}</h3>
                      <p className="text-sm text-gray-400">
                        {voiceActor.language ? `${voiceActor.language} Voice` : 'Voice Actor'}
                      </p>
                      {voiceActor.character && (
                        <p className="text-xs text-blue-400 mt-1">
                          Character: {voiceActor.character.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center">No voice actor information available.</div>
            )}
          </div>
        )}

        {selectedTab === 'related' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Related Anime</h2>
            
            {anime?.relations && Object.keys(relationsByType).length > 0 ? (
              Object.entries(relationsByType).map(([relationType, entries]) => (
                <div key={relationType} className="mb-8">
                  <h3 className="text-xl font-medium mb-4">{relationType}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(entries as any[]).map((entry) => (
                      <div key={entry.mal_id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                        <div className="p-4">
                          <h4 className="font-medium">
                            {entry.type === 'anime' ? (
                              <Link 
                                to={`/anime/${entry.mal_id}`}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                {entry.name}
                              </Link>
                            ) : (
                              <span>{entry.name}</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400">{entry.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              
              ))
            ) : (
              <div className="text-gray-400 text-center">No related anime information available.</div>
            )}
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Recommendations</h2>
            {isRecommendationsLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : recommendationsError ? (
              <div className="text-red-500 text-center">Failed to load recommendations.</div>
            ) : recommendationsData?.data && recommendationsData.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendationsData.data.map((recommendation) => (
                  <div key={recommendation.entry.mal_id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={recommendation.entry.images?.webp?.image_url || recommendation.entry.images?.jpg?.image_url || 'https://via.placeholder.com/225x320?text=No+Image'}
                        alt={recommendation.entry.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <Link 
                        to={`/anime/${recommendation.entry.mal_id}`}
                        className="font-medium text-blue-400 hover:text-blue-300 line-clamp-2 mb-2"
                      >
                        {recommendation.entry.title}
                      </Link>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{recommendation.votes} votes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center">No recommendations found for this anime.</div>
            )}
          </div>
        )}

        {selectedTab === 'characters' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Characters</h2>
            <p className="text-gray-400">Character information is not available in the current API response.</p>
          </div>
        )}
      </div>

      <Dialog
        open={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-4">Create New Collection</Dialog.Title>
            
            <div className="mb-4">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection Name"
                className="w-full p-2 border border-gray-600 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreateCollectionOpen(false)}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  </div>
  );
}

export default AnimeDetailsPage;