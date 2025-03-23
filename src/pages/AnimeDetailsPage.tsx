import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftFromLine, Heart , Star, Play, Eye, BookmarkPlus, 
  Check, Loader, Award, TrendingUp,Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnimeDetails, getAnimeRecommendationsForDetails, getAnimeCharacters, getAnimeVoices } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { useUserDataStore } from '../lib/userDataStore';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnimeTracker from '../components/AnimeTracker';

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString; 
  }
};

const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

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
          ? ' border-b-2 border-blue-500 font-medium' 
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function AnimeDetailsPage() { 
  const { animeId: animeIdParam } = useParams();
  const animeId = animeIdParam ? parseInt(animeIdParam, 10) : null;

  const { 
    data: animeDetailsData, 
    isLoading 
  } = useQuery({
    queryKey: ['animeDetails', animeId],
    queryFn: () => getAnimeDetails(animeId as number),
    enabled: animeId !== null,
  });
  
  const anime = animeDetailsData?.data;

  const [selectedTab, setSelectedTab] = useState('overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAnimeData, setUserAnimeData] = useState<{
    episode?: number;
    notes?: string;
    rating?: number | null;
    watchHistory?: { startedAt?: string, lastWatchedAt?: string };
  }>({});

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
  
  const { animeData, updateAnimeData } = useUserDataStore();

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

  useEffect(() => {
    if (animeId === null) return;
    
    const storedData = JSON.parse(localStorage.getItem('userAnimeData') || '{}');
    storedData[animeId] = userAnimeData;
    localStorage.setItem('userAnimeData', JSON.stringify(storedData));
  }, [userAnimeData, animeId]);

  useEffect(() => {
    if (animeId && anime && !animeData[animeId]?.startDate) {
      updateAnimeData(animeId, {
        startDate: new Date().toISOString(),
        totalEpisodes: anime.episodes || undefined
      });
    }
  }, [animeId, anime, animeData, updateAnimeData]);

  useEffect(() => {
    if (animeId && anime) {
      updateAnimeData(animeId, {
        title: anime.title,
        image: anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url,
        totalEpisodes: anime.episodes || undefined
      });
    }
  }, [animeId, anime, updateAnimeData]);

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
  
  if (isLoading || animeId === null) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>No details available for this anime.</p>
          <Link to="/" className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner with background image */}
      <div 
        className="relative w-auto h-[450px] bg-cover bg-center" 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${anime.images?.jpg?.large_image_url})`,
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container mx-auto h-full px-4 relative pt-8">
          <Link to="/" className="inline-block p-2 50 rounded-full hover:75 transition-colors">
            <ArrowLeftFromLine className="w-6 h-6 " /> 
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
                <Play className="w-4 h-4" /> Veja o Trailer
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
                <h2 className="text-xl text-gray-500 mb-2">{anime.title_english}</h2>
              )}
              
              <div className="flex items-center gap-6 mb-6">
                {anime.score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-medium">{anime.score}</span>
                    <span className="text-sm text-gray-500">
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
                    isInWatching ? 'bg-purple-700' : ' hover:bg-gray-400'
                  } transition-colors`}
                >
                  <Eye className="w-4 h-4" /> 
                  {(isInWatching) ? 'Watching' : 'Watching'}
                </button>
                
                <button
                  onClick={handleWatchlistToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInWatchlist ? 'bg-blue-700' : ' hover:bg-gray-400'
                  } transition-colors`}
                >
                  <BookmarkPlus className="w-4 h-4" /> 
                  {isInWatchlist ? 'In Watchlist' : 'To Watchlist'}
                </button>
                
                <button
                  onClick={handleWatchedToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInWatched ? 'bg-green-700' : ' hover:bg-gray-400'
                  } transition-colors`}
                >
                  <Check className="w-4 h-4" /> 
                  {isInWatched ? 'Completed' : 'Completed'}
                </button>
                
                <button
                  onClick={handleFavoriteToggle}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isInFavorites ? 'bg-red-700' : ' hover:bg-gray-400'
                  } transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-white' : ''}`} /> 
                  {isInFavorites ? 'Favorited' : 'Favorites'}
                </button>
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
            Visão geral
          </TabButton>
          <TabButton
            active={selectedTab === 'characters'}
            onClick={() => setSelectedTab('characters')}
          >
            Personagens
          </TabButton>
          <TabButton
            active={selectedTab === 'voices'}
            onClick={() => setSelectedTab('voices')}
          >
            Vozes
          </TabButton>
          <TabButton
            active={selectedTab === 'related'}
            onClick={() => setSelectedTab('related')}
          >
            Relacionados
          </TabButton>
          <TabButton
            active={selectedTab === 'recommendations'}
            onClick={() => setSelectedTab('recommendations')}
          >
            Recomendações
          </TabButton>
          <TabButton
            active={selectedTab === 'tracking'}
            onClick={() => setSelectedTab('tracking')}
          >
            Tracking
          </TabButton>
        </div>

      {/* Tab Content */}
      <div className="mx-auto">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              

                <div className="md:col-span-1 p-6 rounded-lg">
                  <h3 className='text-lg font-bold mb-4'>Detalhes</h3>
                {anime.type && (
                  <div className="mb-4 flex">
                  <h3 className="text-gray-500 text-sm ">Tipo</h3>
                  <p className="font-medium ml-20">{anime.type}</p>
                  </div>
                )}
                
                {anime.episodes !== null && (
                  <div className="mb-4">
                  <h3 className="text-gray-500 text-sm">Episodios</h3>
                  <p className="font-medium">{anime.episodes || 'Unknown'}</p>
                  </div>
                )}

                {anime.duration && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Duração</div>
                    <div className=" font-medium">{formatDuration(anime.duration)}</div>
                  </div>
                )}
                
                {anime.status && (
                  <div className="mb-4">
                  <h3 className="text-gray-500 text-sm">Status</h3>
                  <p className="font-medium">{anime.status}</p>
                  </div>
                )}
                
                {anime.aired && anime.aired.from && (
                  <div className="mb-4">
                  <h3 className="text-gray-500 text-sm">Lançamento</h3>
                  <p className="font-medium">{formatDate(anime.aired.from)}</p>
                  </div>
                )}
                
                {anime.season && anime.year && (
                  <div className="mb-4">
                  <h3 className="text-gray-500 text-sm">Season</h3>
                  <p className="font-medium">{capitalize(anime.season)} {anime.year}</p>
                  </div>
                )}
                
                {anime.studios && anime.studios.length > 0 && (
                  <div className="mb-4">
                  <h3 className="text-gray-500 text-sm">Studio</h3>
                  <p className="font-medium">{anime.studios[0].name}</p>
                  </div>
                )}

                {anime.broadcast && (anime.broadcast.day || anime.broadcast.time) && (
                  <div className="mb-4">
                  <div className="text-sm text-gray-500">Horarios</div>
                  <div className="font-medium flex items-center">
                    {formatBroadcast(anime.broadcast)}
                  </div>
                  </div>
                )}

                <div className="mt-2">
                  <h3 className="text-gray-500 text-sm mb-2">Generos</h3>
                  <div className="flex flex-wrap gap-2">
                  {anime.genres && anime.genres.map(genre => (
                    <span 
                    key={genre.mal_id}
                    className="py-1 text-sm"
                    >
                    {genre.name}
                    </span>
                  ))}
                  </div>
                </div>

                  {/* External Links */}
            {anime.external && anime.external.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-semibold">Links Externos</h3>
                <div>
                  {anime.external.slice(0,3).map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-3 hover:bg-gray-500 transition-colors"
                    >
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {anime.streaming && anime.streaming.length > 0 && (
              <div className="space-y-4 max-w-6xl mt-6">
                <h3 className="text-xl font-semibold">Onde Assistir</h3>
                <div>
                  {anime.streaming.map((service, index) => (
                    <a
                      key={index}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-3 rounded-md hover:bg-gray-500 transition-colors"
                    >
                      <span>{service.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
              
              <div className="md:col-span-2 p-6 rounded-lg">
                <h3 className="text-sm mb-2">Descrição</h3>
                <p className="leading-relaxed">{anime.synopsis}</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'voices' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mt-3">Vozes dos Personagens</h2>
            {isStaffLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : staffError ? (
              <div className="text-red-500 text-center">Failed to load voice actor information.</div>
            ) : staffData?.data && staffData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffData.data.map((voiceActor) => (
                  <div key={`${voiceActor.person.mal_id}`} className="bg-gray-300 rounded-lg overflow-hidden flex">
                    <div className="w-20 h-20 bg-gray-200 overflow-hidden">
                      <img 
                        src={voiceActor.person.images?.jpg?.image_url || `https://via.placeholder.com/80?text=${encodeURIComponent(voiceActor.person.name.charAt(0))}`}
                        alt={voiceActor.person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                      <h3 className="font-medium ">{voiceActor.person.name}</h3>
                      <p className="text-sm text-gray-500">
                        {voiceActor.language ? `${voiceActor.language} Voice` : 'Voice Actor'}
                      </p>
                      {voiceActor.character && (
                        <p className="text-xs text-blue-400">
                          Character: {voiceActor.character.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center">No voice actor information available.</div>
            )}
          </div>
        )}

        {selectedTab === 'related' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mt-3">Animes Relacionados</h2>
            
            {anime?.relations && Object.keys(relationsByType).length > 0 ? (
              Object.entries(relationsByType).map(([relationType, entries]) => (
                <div key={relationType} className="mb-8">
                  <h3 className="text-xl font-medium mb-4">{relationType}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(entries as any[]).map((entry) => (
                      <div key={entry.mal_id} className="rounded-lg overflow-hidden flex flex-col">
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
                          <p className="text-sm text-gray-500">{entry.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              
              ))
            ) : (
              <div className="text-gray-500 text-center">No related anime information available.</div>
            )}
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mt-3">Recomendações</h2>
            {isRecommendationsLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : recommendationsError ? (
              <div className="text-red-500 text-center">Failed to load recommendations.</div>
            ) : recommendationsData?.data && recommendationsData.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendationsData.data.map((recommendation) => (
                  <div key={recommendation.entry.mal_id} className="rounded-lg overflow-hidden flex flex-col">
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
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{recommendation.votes} votes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center">No recommendations found for this anime.</div>
            )}
          </div>
        )}

        {selectedTab === 'characters' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mt-3">Personagens</h2>
            {isCharactersLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : charactersError ? (
              <div className="text-red-500 text-center">Failed to load character information.</div>
            ) : charactersData?.data && charactersData.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {charactersData.data.map((character) => (
                  <div key={character.character.mal_id} className="rounded-lg overflow-hidden flex flex-col">
                    <div className="relative  overflow-hidden">
                      <img
                        src={character.character.images?.webp?.image_url || character.character.images?.jpg?.image_url || 'https://via.placeholder.com/225x320?text=No+Image'}
                        alt={character.character.name}
                        className="w-full h-52 object-contain hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{character.character.name}</h3>
                      {character.role && (
                        <p className="text-sm text-blue-400">{character.role}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {character.favorites ? `${character.favorites} favorites` : 'No favorites data'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center">No character information available for this anime.</div>
            )}
          </div>
        )}
     
            {selectedTab === 'tracking' && (
              <div className="my-10">
                <AnimeTracker 
                  animeId={animeId} 
                  totalEpisodes={anime?.episodes} 
                  animeDetails={anime}
                />
              </div>
            )}
      </div>
    </div>
  </div>
  );
}

export default AnimeDetailsPage;