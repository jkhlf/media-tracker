import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Genre {
  mal_id: number;
  name: string;
}

export interface Anime {
  mal_id: number;
  title: string;
  images: {
    webp: {
      image_url: string;
    };
  };
  score: number;
  year?: number;
  genres: Genre[];
  episodes?: number;
}

export interface Collection {
  name: string;
  animes: Anime[];
}

interface AnimeStore {
  favorites: Anime[];
  watchlist: Anime[];
  watched: Anime[];
  watching: Anime[];
  collections: Collection[];
  addToFavorites: (anime: Anime) => void;
  removeFromFavorites: (animeId: number) => void;
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (animeId: number) => void;
  addToWatched: (anime: Anime) => void;
  removeFromWatched: (animeId: number) => void;
  addToWatching: (anime: Anime) => void;
  removeFromWatching: (animeId: number) => void;
  addToCollection: (anime: Anime, collectionName: string) => void;
  removeFromCollection: (animeId: number, collectionName: string) => void;
  createCollection: (name: string) => void;
  deleteCollection: (name: string) => void; // New function
}

export const useAnimeStore = create<AnimeStore>()(
  persist(
    (set) => ({
      favorites: [],
      watchlist: [],
      watched: [],
      watching: [],
      collections: [],
      
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
          watching: state.watching.filter((a) => a.mal_id !== anime.mal_id),
        })),
        
      removeFromWatched: (animeId) =>
        set((state) => ({
          watched: state.watched.filter((a) => a.mal_id !== animeId),
        })),

      addToWatching: (anime) =>
        set((state) => ({
          watching: [...state.watching, anime],
          watchlist: state.watchlist.filter((a) => a.mal_id !== anime.mal_id),
        })),
        
      removeFromWatching: (animeId) =>
        set((state) => ({
          watching: state.watching.filter((a) => a.mal_id !== animeId),
        })),
        
      addToCollection: (anime, collectionName) =>
        set((state) => {
          const collectionIndex = state.collections.findIndex(c => c.name === collectionName);
          
          if (collectionIndex >= 0) {
            // Check if anime already exists in the collection
            if (!state.collections[collectionIndex].animes.some(a => a.mal_id === anime.mal_id)) {
              state.collections[collectionIndex].animes.push(anime);
            }
          } else {
            state.collections.push({ name: collectionName, animes: [anime] });
          }
          
          return { collections: [...state.collections] };
        }),
        
      removeFromCollection: (animeId, collectionName) =>
        set((state) => {
          const collectionIndex = state.collections.findIndex(c => c.name === collectionName);
          
          if (collectionIndex >= 0) {
            state.collections[collectionIndex].animes = 
              state.collections[collectionIndex].animes.filter(a => a.mal_id !== animeId);
          }
          
          return { collections: [...state.collections] };
        }),
        
      createCollection: (name) =>
        set((state) => {
          if (!state.collections.some(c => c.name === name)) {
            state.collections.push({ name, animes: [] });
          }
          return { collections: [...state.collections] };
        }),
        
      // Add new function to delete a collection
      deleteCollection: (name) =>
        set((state) => ({
          collections: state.collections.filter(c => c.name !== name)
        })),
    }),
    {
      name: 'anime-storage',
    }
  )
);