import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, getDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getSchedules } from '../lib/api';
import { useAnimeStore } from '../lib/store';
import { CalendarIcon, Clock, Calendar as CalendarLucide, ExternalLink } from 'lucide-react';
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

export function Calendar() {
  const [selectedView, setSelectedView] = useState<CalendarView>('releases');
  const [selectedDate] = useState<Date>(new Date());
  const [personalSchedule, setPersonalSchedule] = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay] = useState<DayFilter | null>(null);
  const [showSfw, setShowSfw] = useState<boolean>(true);
  const [showKids, setShowKids] = useState<boolean>(false);
  
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

  useEffect(() => {
    const schedule: Record<string, string[]> = {};
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    watchlist.forEach(anime => {
      const dayIndex = anime.mal_id % 7;
      const day = days[dayIndex];
      
      if (!schedule[day]) {
        schedule[day] = [];
      }
      
      schedule[day].push(anime.title);
    });
    
    setPersonalSchedule(schedule);
  }, [watchlist]); // Only depend on watchlist

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
    return (
      <div className="space-y-4">
        {Object.entries(personalSchedule).length > 0 ? (
          Object.entries(personalSchedule).map(([day, animes]) => (
            <div key={day} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">{day}</h3>
              <div className="space-y-2">
                {animes.map((title, index) => (
                  <div key={`${title}-${index}`} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <CalendarLucide className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Add anime to your watchlist to create a personal schedule</p>
            <p className="mt-2 text-sm">This feature assigns anime from your watchlist to days of the week</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-5 bg-gray-900 rounded-lg shadow-lg">
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
