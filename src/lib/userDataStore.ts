import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAnimeStore } from './store';

export interface AnimeUserData {
  mal_id: number;
  currentEpisode?: number;
  totalEpisodes?: number;
  notes?: string;
  score?: number | null;
  startDate?: string | null;
  finishDate?: string | null;
  lastUpdated: string;
  title?: string;
  image?: string;
}

interface UserDataStore {
  animeData: Record<number, AnimeUserData>;
  updateAnimeData: (animeId: number, data: Partial<AnimeUserData>) => void;
  incrementEpisode: (animeId: number, totalEpisodes?: number) => void;
  resetAnimeData: (animeId: number) => void;
  bulkUpdateAnimeData: (data: Record<number, Partial<AnimeUserData>>) => void;
  markAsComplete: (animeId: number, totalEpisodes: number, animeDetails?: any) => void;
  updateAnimeMetadata: (animeId: number, title: string, imageUrl: string) => void;
}

export const useUserDataStore = create<UserDataStore>()(
  persist(
    (set, get) => ({
      animeData: {},
      
      updateAnimeData: (animeId, data) => 
        set((state) => {
          const existingData = state.animeData[animeId] || {
            mal_id: animeId,
            lastUpdated: new Date().toISOString()
          };
          
          return {
            animeData: {
              ...state.animeData,
              [animeId]: {
                ...existingData,
                ...data,
                lastUpdated: new Date().toISOString()
              }
            }
          };
        }),
      
      incrementEpisode: (animeId, totalEpisodes) =>
        set((state) => {
          const existingData = state.animeData[animeId] || {
            mal_id: animeId,
            currentEpisode: 0,
            totalEpisodes,
            lastUpdated: new Date().toISOString()
          };
          
          const newEpisode = (existingData.currentEpisode || 0) + 1;
          const isCompleted = totalEpisodes && newEpisode >= totalEpisodes;
          
          // If completed, also add to watched list in AnimeStore
          if (isCompleted) {
            const animeStore = useAnimeStore.getState();
            const animeInLists = [
              ...animeStore.watching,
              ...animeStore.watchlist,
              ...animeStore.favorites
            ].find(a => a.mal_id === animeId);
            
            if (animeInLists && !animeStore.watched.some(a => a.mal_id === animeId)) {
              animeStore.addToWatched(animeInLists);
            }
          }
          
          return {
            animeData: {
              ...state.animeData,
              [animeId]: {
                ...existingData,
                currentEpisode: newEpisode,
                totalEpisodes: totalEpisodes || existingData.totalEpisodes,
                finishDate: isCompleted ? new Date().toISOString() : existingData.finishDate,
                lastUpdated: new Date().toISOString()
              }
            }
          };
        }),
      
      resetAnimeData: (animeId) =>
        set((state) => {
          const { [animeId]: _, ...restData } = state.animeData;
          return { animeData: restData };
        }),
        
      bulkUpdateAnimeData: (data) =>
        set((state) => ({
          animeData: {
            ...state.animeData,
            ...Object.entries(data).reduce((acc, [animeId, animeData]) => {
              const id = parseInt(animeId, 10);
              const existingData = state.animeData[id] || {
                mal_id: id,
                lastUpdated: new Date().toISOString()
              };
              
              acc[id] = {
                ...existingData,
                ...animeData,
                lastUpdated: new Date().toISOString()
              };
              
              return acc;
            }, {} as Record<number, AnimeUserData>)
          }
        })),

      markAsComplete: (animeId, totalEpisodes, animeDetails) =>
        set((state) => {
          const existingData = state.animeData[animeId] || {
            mal_id: animeId,
            lastUpdated: new Date().toISOString()
          };

          // If animeDetails is provided, update title and image
          let updatedData = {
            ...existingData,
            currentEpisode: totalEpisodes,
            totalEpisodes,
            finishDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };

          if (animeDetails) {
            updatedData.title = animeDetails.title;
            updatedData.image = animeDetails.images?.webp?.image_url || 
                               animeDetails.images?.jpg?.image_url;
          }
          
          // Also add to watched list in AnimeStore
          const animeStore = useAnimeStore.getState();
          const animeInLists = [
            ...animeStore.watching,
            ...animeStore.watchlist,
            ...animeStore.favorites
          ].find(a => a.mal_id === animeId);
          
          if (animeInLists && !animeStore.watched.some(a => a.mal_id === animeId)) {
            animeStore.addToWatched(animeInLists);
          }
          
          return {
            animeData: {
              ...state.animeData,
              [animeId]: updatedData
            }
          };
        }),

      updateAnimeMetadata: (animeId, title, imageUrl) =>
        set((state) => {
          // Only update if the anime exists in the store
          if (!state.animeData[animeId]) return state;
          
          return {
            animeData: {
              ...state.animeData,
              [animeId]: {
                ...state.animeData[animeId],
                title,
                image: imageUrl,
                lastUpdated: state.animeData[animeId].lastUpdated // Don't update lastUpdated for metadata updates
              }
            }
          };
        })
    }),
    {
      name: 'anime-user-data',
    }
  )
);
