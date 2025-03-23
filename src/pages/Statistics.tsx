import React, { useMemo } from 'react';
import { useAnimeStore } from '../lib/store';
import { useUserDataStore } from '../lib/userDataStore';
import { Activity, Star, Clock, PlaySquare, Award } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';

export function Statistics() {
  const { watched, watching, watchlist, favorites } = useAnimeStore();
  const { animeData } = useUserDataStore();

  const totalEpisodesWatched = useMemo(() => {
    return Object.values(animeData).reduce((total, anime) => {
      return total + (anime.currentEpisode || 0);
    }, 0);
  }, [animeData]);

  const averageScore = useMemo(() => {
    const scores = Object.values(animeData)
      .filter(anime => anime.score !== null && anime.score !== undefined);
    
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((total, anime) => {
      return total + (anime.score || 0);
    }, 0);
    
    return (sum / scores.length).toFixed(1);
  }, [animeData]);

  const statusData = useMemo(() => {
    return [
      { name: 'Watching', value: watching.length, color: '#9333ea' },
      { name: 'Completed', value: watched.length, color: '#22c55e' },
      { name: 'Plan to watch', value: watchlist.length, color: '#3b82f6' },
      { name: 'Favorites', value: favorites.length, color: '#ef4444' }
    ];
  }, [watching, watched, watchlist, favorites]);

  const genreData = useMemo(() => {
    const genreCounts: { [key: string]: number } = {};
    
    const allAnime = [...watching, ...watched, ...watchlist, ...favorites];
    
    allAnime.forEach(anime => {
      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach(genre => {
          if (genre && genre.name) {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); 
  }, [watching, watched, watchlist, favorites]);

  const scoreDistribution = useMemo(() => {
    const distribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => ({
      score: score.toString(),
      count: 0
    }));
    
    Object.values(animeData).forEach(anime => {
      if (anime.score !== null && anime.score !== undefined) {
        const index = Math.min(Math.max(Math.floor(anime.score) - 1, 0), 9);
        distribution[index].count++;
      }
    });
    
    return distribution;
  }, [animeData]);

  const completionStats = useMemo(() => {
    const completedFromTracking = Object.values(animeData).filter(
      anime => anime.totalEpisodes && anime.currentEpisode && anime.currentEpisode >= anime.totalEpisodes
    ).length;
    
    const animeInWatched = watched.length;
    
    const watchedIds = new Set(watched.map(a => a.mal_id));
    const completedFromTrackingIds = new Set(
      Object.values(animeData)
        .filter(a => a.totalEpisodes && a.currentEpisode && a.currentEpisode >= a.totalEpisodes)
        .map(a => a.mal_id)
    );
    
    const totalCompleted = [...watchedIds, ...completedFromTrackingIds].length;
    
    const allTrackedIds = new Set([
      ...Object.values(animeData).map(a => a.mal_id),
      ...watched.map(a => a.mal_id),
      ...watching.map(a => a.mal_id),
      ...watchlist.map(a => a.mal_id)
    ]);
    
    const totalTracked = allTrackedIds.size;
    const completionRate = totalTracked > 0 ? (totalCompleted / totalTracked) * 100 : 0;
    
    return {
      completionRate,
      totalCompleted,
      totalTracked
    };
  }, [animeData, watched, watching, watchlist]);

  const totalWatchTimeHours = useMemo(() => {
    return (totalEpisodesWatched * 24) / 60;
  }, [totalEpisodesWatched]);

  const recentlyUpdatedAnime = useMemo(() => {
    return Object.values(animeData)
      .filter(anime => anime.title && anime.image) 
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5); 
  }, [animeData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4', '#3b82f6'];

  return (
    <div className="px-3 py-6 max-w-6xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-2xl font-medium mb-6">Your Anime Statistics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 ">
        <StatCard
          title="Total Anime"
          value={completionStats.totalTracked}
          icon={<PlaySquare className="w-5 h-5 text-blue-500" />}
          description="Anime tracked"
        />
        
        <StatCard
          title="Episodes"
          value={totalEpisodesWatched}
          icon={<Activity className="w-5 h-5 text-green-500" />}
          description="Watched"
        />
        
        <StatCard
          title="Avg. Score"
          value={averageScore}
          icon={<Star className="w-5 h-5 text-yellow-500" />}
          description="Rating"
        />
        
        <StatCard
          title="Hours"
          value={totalWatchTimeHours}
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          description="Watching time"
          format={(value) => Math.round(value).toLocaleString()}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h2 className="text-base font-medium mb-3">Anime Status</h2>
          <div className="grid grid-cols-2 gap-2">
            {statusData.map((status) => (
              <div key={status.name} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                <div>
                  <p className="text-sm font-medium">{status.name}</p>
                  <p className="text-xl font-medium">{status.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h2 className="text-base font-medium mb-3">Top Genres</h2>
          <div>
            {genreData.length > 0 ? (
              <div className="space-y-2">
                {genreData.slice(0, 5).map((genre, index) => (
                  <div key={genre.name} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">{genre.name}</span>
                    </div>
                    <span className="text-sm font-medium">{genre.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No genre data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-6">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h2 className="text-base font-medium mb-3">Recently Updated</h2>
          <div className="space-y-2">
            {recentlyUpdatedAnime.length > 0 ? (
              recentlyUpdatedAnime.slice(0, 4).map((anime) => (
                <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 rounded-md transition-colors">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={anime.image || 'https://via.placeholder.com/32'} 
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">
                      {anime.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ep {anime.currentEpisode || 0}
                      {anime.totalEpisodes ? `/${anime.totalEpisodes}` : ''}
                      {anime.score ? ` • ${anime.score}` : ''}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recently updated anime</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-6 shadow-sm">
        <h2 className="text-base font-medium mb-3">Watch Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs">Watch Time</h3>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-lg font-medium">{Math.round(totalWatchTimeHours)} hrs</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ~{Math.round(totalWatchTimeHours / 24)} days
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs">Episodes/Anime</h3>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-lg font-medium">
              {completionStats.totalTracked > 0 
                ? (totalEpisodesWatched / completionStats.totalTracked).toFixed(1) 
                : '0'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs">Completion</h3>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-lg font-medium">{Math.round(completionStats.completionRate)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completionStats.totalCompleted}/{completionStats.totalTracked}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
        <h2 className="text-base font-medium mb-2">Fan Level</h2>
        
        {(() => {
          let fanLevel = "Beginner";
          let fanColor = "text-blue-500";
          
          if (totalWatchTimeHours > 500) {
            fanLevel = "Anime Master";
            fanColor = "text-purple-500";
          } else if (totalWatchTimeHours > 200) {
            fanLevel = "Otaku";
            fanColor = "text-pink-500";
          } else if (totalWatchTimeHours > 100) {
            fanLevel = "Enthusiast";
            fanColor = "text-yellow-500";
          } else if (totalWatchTimeHours > 50) {
            fanLevel = "Devoted Viewer";
            fanColor = "text-green-500";
          }
          
          return (
            <div className="text-center">
              <h3 className={`text-xl font-medium ${fanColor}`}>{fanLevel}</h3>              
              <div className="mt-2 h-2 bg-gray-300 dark:bg-gray-800 rounded-full w-full max-w-xs mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, (totalWatchTimeHours / 500) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(Math.min(100, (totalWatchTimeHours / 500) * 100))}% to next level
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default Statistics;
