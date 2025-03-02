import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, getDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getSchedules, getAnimeDetails } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { CalendarIcon, Clock, Calendar as CalendarLucide, ExternalLink, MonitorPlay, PauseCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type CalendarView = 'releases' | 'personal';
type DayFilter = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'unknown' | 'other';

const dayMapping: Record<number, DayFilter> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// New interface for anime in personal schedule
interface PersonalCalendarAnime {
  id: number;
  title: string;
  imageUrl?: string;
  status?: string;
  airingTime?: string;
  airingDay?: string;
  platforms: string[];
  isAiring: boolean;
}

export function Calendar() {
  const [selectedView, setSelectedView] = useState<CalendarView>('releases');
  const [selectedDate] = useState<Date>(new Date());
  const [personalSchedule, setPersonalSchedule] = useState<Record<string, PersonalCalendarAnime[]>>({});
  const [selectedDay, setSelectedDay] = useState<DayFilter | null>(null);
  const [showSfw, setShowSfw] = useState<boolean>(true);
  const [showKids, setShowKids] = useState<boolean>(false);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState<boolean>(false);
  
  const { watchlist } = useAnimeStore();
  
  const { data: scheduleData, isLoading, error } = useQuery({
    queryKey: ['schedules', selectedDay, showSfw, showKids],
    queryFn: async () => {
      const result = await getSchedules({
        filter: selectedDay || undefined,
        sfw: showSfw,
        kids: showKids,
        limit: 20 // Fixed limit
      });
      return result;
    },
    enabled: selectedView === 'releases',
  });

  const startOfTheWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }); 
  const daysOfWeek = [...Array(7)].map((_, i) => addDays(startOfTheWeek, i));

  useEffect(() => {
    const today = new Date();
    const dayIndex = getDay(today);
    setSelectedDay(dayMapping[dayIndex]);
  }, []);

  // Enhanced personal schedule with detailed anime information
  useEffect(() => {
    const loadPersonalSchedule = async () => {
      if (watchlist.length === 0 || selectedView !== 'personal') return;
      
      setIsLoadingPersonal(true);
      
      try {
        const schedule: Record<string, PersonalCalendarAnime[]> = {
          'Monday': [],
          'Tuesday': [],
          'Wednesday': [],
          'Thursday': [],
          'Friday': [],
          'Saturday': [],
          'Sunday': []
        };
        
        // Get detailed information for each anime in watchlist
        const animeDetailsPromises = watchlist.map(anime => 
          getAnimeDetails(anime.mal_id)
            .then(details => {
              const animeData = details.data;
              
              // Check if anime is currently airing
              const isAiring = animeData.status === 'Currently Airing';
              
              // If not currently airing, don't add to schedule
              if (!isAiring) return null;
              
              // Get broadcast day and time
              let airingDay = '';
              let airingTime = '';
              
              if (animeData.broadcast?.day) {
                airingDay = animeData.broadcast.day;
              } else {
                // If no broadcast info, assign to a day based on ID
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                airingDay = days[anime.mal_id % 7];
              }
              
              if (animeData.broadcast?.time) {
                airingTime = animeData.broadcast.time;
              }
              
              // Get streaming platforms
              const platforms = animeData.streaming?.map((platform: any) => platform.name) || [];
              
              return {
                id: anime.mal_id,
                title: anime.title,
                imageUrl: anime.images?.webp?.image_url || '',
                status: animeData.status,
                airingTime,
                airingDay,
                platforms,
                isAiring
              };
            })
            .catch(() => null) // Handle errors for individual anime
        );
        
        const animeDetails = await Promise.all(animeDetailsPromises);
        
        // Filter out null values and add to schedule
        animeDetails
          .filter(Boolean)
          .forEach(anime => {
            if (anime && anime.airingDay) {
              // Make sure day exists in schedule
              if (!schedule[anime.airingDay]) {
                schedule[anime.airingDay] = [];
              }
              
              schedule[anime.airingDay].push(anime);
            }
          });
        
        // Sort anime in each day by airing time
        Object.keys(schedule).forEach(day => {
          schedule[day].sort((a, b) => {
            if (!a.airingTime) return 1;
            if (!b.airingTime) return -1;
            return a.airingTime.localeCompare(b.airingTime);
          });
        });
        
        setPersonalSchedule(schedule);
      } catch (error) {
        console.error("Error loading personal schedule:", error);
      } finally {
        setIsLoadingPersonal(false);
      }
    };
    
    loadPersonalSchedule();
  }, [watchlist, selectedView]);

  const renderReleases = () => {
    if (isLoading) {
      return <div className="text-center p-4">Loading releases...</div>;
    }
    
    if (error) {
      return (
        <div className="text-center text-red-400 p-4">
          Error loading schedule data. Please try again later.
        </div>
      );
    }

    let animeList: any[] = [];
    
    if (scheduleData?.data) {
      if (selectedDay && Array.isArray(scheduleData.data[selectedDay])) {
        animeList = scheduleData.data[selectedDay];
      } 
      // If we have a direct array response
      else if (Array.isArray(scheduleData.data)) {
        animeList = scheduleData.data;
      }
      // If we have a general schedule object
      else if (typeof scheduleData.data === 'object') {
        // Try to find any day with data
        for (const day of Object.values(dayMapping)) {
          if (Array.isArray(scheduleData.data[day]) && scheduleData.data[day].length > 0) {
            animeList = scheduleData.data[day];
            break;
          }
        }
      }
    }
    
    return (
      <>
        {/* Day filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {Object.values(dayMapping).map((day) => (
            <button
              key={day}
              className={`px-3 py-1 text-sm capitalize whitespace-nowrap rounded-md ${
                selectedDay === day ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          {animeList.length > 0 ? (
            // Use index as part of the key to ensure uniqueness
            animeList.map((anime: any, index) => (
              <Link 
                key={`${anime.mal_id}-${index}`} 
                to={`/anime/${anime.mal_id}`} 
                className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {anime.images?.jpg?.image_url && (
                  <img 
                    src={anime.images.jpg.image_url} 
                    alt={anime.title} 
                    className="w-16 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium mb-1">{anime.title}</h4>
                    <div className="text-blue-400">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                  {anime.broadcast?.time && (
                    <p className="text-sm text-blue-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {anime.broadcast.time}
                    </p>
                  )}
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {anime.genres.slice(0, 3).map((genre: any, genreIndex: number) => (
                        <span key={`${genre.mal_id}-${genreIndex}`} className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-gray-400 py-6">
              <p>No releases found for {selectedDay}</p>
              <p className="text-sm mt-2">Try selecting a different day or adjusting filters</p>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPersonalSchedule = () => {
    if (isLoadingPersonal) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your personal schedule...</p>
        </div>
      );
    }
    
    // Check if there are any airing anime in the schedule
    const hasAiringAnime = Object.values(personalSchedule).some(anime => anime.length > 0);
    
    if (!hasAiringAnime) {
      return (
        <div className="text-center text-gray-400 py-8">
          <CalendarLucide className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No currently airing anime in your watchlist</p>
          <p className="mt-2 text-sm">Add some currently airing anime to your watchlist to see them here</p>
          <div className="mt-4">
            <Link to="/" className="text-blue-500 hover:underline">Browse anime</Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {Object.entries(personalSchedule).map(([day, animes]) => (
          animes.length > 0 && (
            <div key={day} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">{day}</h3>
              <div className="space-y-3">
                {animes.map((anime) => (
                  <Link 
                    to={`/anime/${anime.id}`}
                    key={anime.id} 
                    className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {anime.imageUrl && (
                      <img 
                        src={anime.imageUrl} 
                        alt={anime.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{anime.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                        {anime.airingTime && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Clock className="w-3 h-3" />
                            <span>{anime.airingTime} JST</span>
                          </div>
                        )}
                        
                        {anime.status && (
                          <div className="flex items-center gap-1 text-green-400">
                            {anime.isAiring ? (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Airing</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3 h-3" />
                                <span>{anime.status}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {anime.platforms && anime.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {anime.platforms.map((platform, index) => (
                            <span key={index} className="flex items-center gap-1 bg-gray-800 text-xs px-2 py-0.5 rounded">
                              <MonitorPlay className="w-3 h-3 text-blue-400" />
                              {platform}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Anime Calendar</h2>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${selectedView === 'releases' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setSelectedView('releases')}
          >
            Daily Releases
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${selectedView === 'personal' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setSelectedView('personal')}
          >
            My Schedule
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span className="font-medium">
            {format(startOfTheWeek, "MMMM d")} - {format(addDays(startOfTheWeek, 6), "MMMM d, yyyy")}
          </span>
        </div>
        
        {/* Filters */}
        {selectedView === 'releases' && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">SFW</label>
              <div className={`relative w-9 h-5 rounded-full ${showSfw ? 'bg-blue-600' : 'bg-gray-600'}`}>
                <input
                  type="checkbox"
                  className="opacity-0 absolute w-full h-full cursor-pointer"
                  checked={showSfw}
                  onChange={() => setShowSfw(!showSfw)}
                />
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${showSfw ? 'left-5' : 'left-1'}`}></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Kids</label>
              <div className={`relative w-9 h-5 rounded-full ${showKids ? 'bg-blue-600' : 'bg-gray-600'}`}>
                <input
                  type="checkbox"
                  className="opacity-0 absolute w-full h-full cursor-pointer"
                  checked={showKids}
                  onChange={() => setShowKids(!showKids)}
                />
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${showKids ? 'left-5' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {selectedView === 'releases' && renderReleases()}
        {selectedView === 'personal' && renderPersonalSchedule()}
      </div>
    </div>
  );
}

export default Calendar;
