import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Anime {
  mal_id: number;
  title: string;
  images: {
    webp: {
      image_url: string;
    };
  };
  score: number;
  year: number;
}

interface AnimeStore {
  favorites: Anime[];
  watchlist: Anime[];
  watched: Anime[];
  addToFavorites: (anime: Anime) => void;
  removeFromFavorites: (animeId: number) => void;
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (animeId: number) => void;
  addToWatched: (anime: Anime) => void;
  removeFromWatched: (animeId: number) => void;
}

export const useAnimeStore = create<AnimeStore>()(
  persist(
    (set) => ({
      favorites: [],
      watchlist: [],
      watched: [],
      addToFavorites: (anime) =>
        set((state) => ({
          favorites: [...state.favorites, anime],
        })),
      removeFromFavorites: (animeId) =>
        set((state) => ({
          favorites: state.favorites.filter((a) => a.mal_id !== animeId),
        })),
      addToWatchlist: (anime) =>
        set((state) => ({
          watchlist: [...state.watchlist, anime],
        })),
      removeFromWatchlist: (animeId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((a) => a.mal_id !== animeId),
        })),
      addToWatched: (anime) =>
        set((state) => ({
          watched: [...state.watched, anime],
          watchlist: state.watchlist.filter((a) => a.mal_id !== anime.mal_id),
        })),
      removeFromWatched: (animeId) =>
        set((state) => ({
          watched: state.watched.filter((a) => a.mal_id !== animeId),
        })),
    }),
    {
      name: 'anime-storage',
    }
  )
);