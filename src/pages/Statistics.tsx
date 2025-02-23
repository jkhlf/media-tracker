import React from 'react';
import { useAnimeStore, Anime } from '../lib/store';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function Statistics() {
  const { watched, favorites, watchlist } = useAnimeStore();

  // Calcular estatísticas
  const totalWatched = watched.length;
  const totalFavorites = favorites.length;
  const totalWatchlist = watchlist.length;

  const genres = watched.reduce((acc, anime: Anime) => {
    anime.genres.forEach((genre) => {
      acc[genre.name] = (acc[genre.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const genreLabels = Object.keys(genres);
  const genreData = Object.values(genres);

  const totalEpisodesWatched = watched.reduce((acc, anime: Anime) => acc + (anime.episodes || 0), 0);
  const totalTimeSpent = totalEpisodesWatched * 24; // Assumindo que cada episódio tem 24 minutos

  const completionRate = (totalWatched / (totalWatched + totalWatchlist)) * 100;

  return (
    <div className="space-y-10 pt-8 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6">Statistics Dashboard</h2>

      <div className="flex flex-wrap justify-between gap-10">
        {/* Watching Habits */}
        <div className="space-y-20 w-full max-w-xl">
          <h3 className="text-xl font-semibold">Watching Habits</h3>
          <Bar
            data={{
              labels: ['Watched', 'Favorites', 'Watchlist'],
              datasets: [
                {
                  label: 'Count',
                  data: [totalWatched, totalFavorites, totalWatchlist],
                  backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Watching Habits',
                },
              },
            }}
          />
        </div>

        {/* Favorite Genres */}
        <div className="space-y-6 w-full max-w-md">
          <h3 className="text-xl font-semibold">Favorite Genres</h3>
          <Pie
            data={{
              labels: genreLabels,
              datasets: [
                {
                  label: 'Genres',
                  data: genreData,
                  backgroundColor: genreLabels.map((_, index) => `hsl(${index * 30}, 70%, 50%)`),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Favorite Genres',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Time Spent Watching */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Time Spent Watching</h3>
        <p className="text-lg">{totalTimeSpent} minutes</p>
      </div>

      {/* Completion Rate */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Completion Rate</h3>
        <p className="text-lg">{completionRate.toFixed(2)}%</p>
      </div>
    </div>
  );
}

export default Statistics;
