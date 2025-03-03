import React, { useMemo } from 'react';
import { useAnimeStore } from '../lib/store';
import { useUserDataStore } from '../lib/userDataStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Star, Clock, PlaySquare, Award, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';

export function Statistics() {
  const { watched, watching, watchlist, favorites } = useAnimeStore();
  const { animeData } = useUserDataStore();

  // Calculate total episodes watched
  const totalEpisodesWatched = useMemo(() => {
    return Object.values(animeData).reduce((total, anime) => {
      return total + (anime.currentEpisode || 0);
    }, 0);
  }, [animeData]);

  // Calculate average score given by the user
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

  // Calculate score distribution
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

  // Calculate completion rate - FIXED
  const completionStats = useMemo(() => {
    // Count user-tracked completion (from episode tracking)
    const completedFromTracking = Object.values(animeData).filter(
      anime => anime.totalEpisodes && anime.currentEpisode && anime.currentEpisode >= anime.totalEpisodes
    ).length;
    
    // Count anime marked as "watched" in library
    const animeInWatched = watched.length;
    
    // Combine the two counts (remove duplicates)
    const watchedIds = new Set(watched.map(a => a.mal_id));
    const completedFromTrackingIds = new Set(
      Object.values(animeData)
        .filter(a => a.totalEpisodes && a.currentEpisode && a.currentEpisode >= a.totalEpisodes)
        .map(a => a.mal_id)
    );
    
    // Total unique completed anime
    const totalCompleted = [...watchedIds, ...completedFromTrackingIds].length;
    
    // Total tracked anime (from both systems)
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

  // Calculate watch time (estimating 24 minutes per episode)
  const totalWatchTimeHours = useMemo(() => {
    return (totalEpisodesWatched * 24) / 60;
  }, [totalEpisodesWatched]);

  // Calculate most recently updated anime - FIXED
  const recentlyUpdatedAnime = useMemo(() => {
    // Get recent updates from tracking data with valid metadata
    return Object.values(animeData)
      .filter(anime => anime.title && anime.image) // Only include anime with title and image
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5); // Take top 5 most recently updated
  }, [animeData]);

  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4', '#3b82f6'];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Anime Statistics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Anime"
          value={completionStats.totalTracked}
          icon={<PlaySquare className="w-8 h-8 text-blue-500" />}
          description="Anime tracked"
        />
        
        <StatCard
          title="Episodes Watched"
          value={totalEpisodesWatched}
          icon={<Activity className="w-8 h-8 text-green-500" />}
          description="Total episodes"
        />
        
        <StatCard
          title="Average Score"
          value={averageScore}
          icon={<Star className="w-8 h-8 text-yellow-500" />}
          description="Your ratings"
        />
        
        <StatCard
          title="Hours Spent"
          value={totalWatchTimeHours}
          icon={<Clock className="w-8 h-8 text-purple-500" />}
          description="Est. hours watching"
          format={(value) => Math.round(value).toLocaleString()}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Anime Status</h2>
          <div className="aspect-square max-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} anime`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Distribution - FIXED */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Top Genres</h2>
          <div className="aspect-square max-h-[400px]">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} anime`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No genre data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution}>
              <XAxis dataKey="score" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} anime`, 'Count']} />
              <Legend />
              <Bar dataKey="count" name="Number of Anime" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Rate - FIXED */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-current text-gray-700"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  className="stroke-current text-green-500"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${completionStats.completionRate}, 100`}
                />
                <text x="18" y="22" className="text-[10px] font-bold fill-current text-white text-center" textAnchor="middle">
                  {Math.round(completionStats.completionRate)}%
                </text>
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">Completion Rate</p>
              <p className="text-gray-400">
                You've completed {completionStats.totalCompleted} out of {completionStats.totalTracked} tracked anime.
              </p>
            </div>
          </div>
        </div>

        {/* Recently Updated - FIXED */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recently Updated</h2>
          <div className="space-y-4">
            {recentlyUpdatedAnime.length > 0 ? (
              recentlyUpdatedAnime.map((anime) => (
                <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-md transition-colors">
                  <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={anime.image || 'https://via.placeholder.com/48'} 
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {anime.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      Ep {anime.currentEpisode || 0}
                      {anime.totalEpisodes ? `/${anime.totalEpisodes}` : ''}
                      {anime.score ? ` • Rated ${anime.score}/10` : ''}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400">No recently updated anime</p>
            )}
          </div>
        </div>
      </div>

      {/* Watch Time Analysis */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Watch Time Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400">Total Watch Time</h3>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{Math.round(totalWatchTimeHours)} hours</p>
            <p className="text-sm text-gray-400">
              That's about {Math.round(totalWatchTimeHours / 24)} days of anime!
            </p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400">Episodes per Anime</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-2">
              {completionStats.totalTracked > 0 
                ? (totalEpisodesWatched / completionStats.totalTracked).toFixed(1) 
                : '0'}
            </p>
            <p className="text-sm text-gray-400">Average episodes watched per anime</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400">Completion Percentage</h3>
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{Math.round(completionStats.completionRate)}%</p>
            <p className="text-sm text-gray-400">
              {completionStats.completionRate > 75 
                ? "You're an excellent anime completer!"
                : completionStats.completionRate > 50
                ? "You finish most anime you start."
                : completionStats.completionRate > 25
                ? "You're selective about finishing anime."
                : "You start more than you finish."}
            </p>
          </div>
        </div>
      </div>
      
      {/* Fan Level */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Your Anime Fan Level</h2>
        
        {(() => {
          let fanLevel = "Beginner";
          let fanDescription = "You're just getting started on your anime journey.";
          let fanColor = "text-blue-400";
          
          if (totalWatchTimeHours > 500) {
            fanLevel = "Anime Master";
            fanDescription = "You've seen it all and know the medium deeply.";
            fanColor = "text-purple-400";
          } else if (totalWatchTimeHours > 200) {
            fanLevel = "Otaku";
            fanDescription = "A serious fan with extensive anime knowledge.";
            fanColor = "text-pink-400";
          } else if (totalWatchTimeHours > 100) {
            fanLevel = "Enthusiast";
            fanDescription = "Your love for anime is well established!";
            fanColor = "text-yellow-400";
          } else if (totalWatchTimeHours > 50) {
            fanLevel = "Devoted Viewer";
            fanDescription = "You're developing a good taste for anime.";
            fanColor = "text-green-400";
          }
          
          return (
            <div>
              <h3 className={`text-3xl font-bold ${fanColor}`}>{fanLevel}</h3>
              <p className="text-gray-400 mt-2 max-w-lg mx-auto">{fanDescription}</p>
              
              <div className="mt-4 h-3 bg-gray-800 rounded-full w-full max-w-md mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, (totalWatchTimeHours / 500) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
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
