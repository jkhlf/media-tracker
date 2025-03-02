import React, { useState } from 'react';
import { useAnimeStore } from '../lib/store';
import { AnimeCard } from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { PlusCircle, X, Trash2, Eye, BookMarked, Check, Heart, Folder } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export function Library() {
  const { 
    watching, 
    watched, 
    favorites, 
    watchlist, 
    collections, 
    addToWatchlist, 
    addToFavorites, 
    addToWatching, 
    removeFromWatchlist, 
    removeFromFavorites, 
    removeFromWatched,
    removeFromWatching,
    addToCollection, 
    removeFromCollection,
    createCollection,
    deleteCollection
  } = useAnimeStore();
  
  const [selectedTab, setSelectedTab] = useState<'watching' | 'to-watch' | 'watched' | 'favorites' | 'collections'>('watching');
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isDeleteCollectionOpen, setIsDeleteCollectionOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  const handleRemoveFromWatched = (anime) => {
    removeFromWatched(anime.mal_id);
    toast.success('Anime removed from watched list');
  };

  const handleRemoveFromWatching = (anime) => {
    removeFromWatching(anime.mal_id);
    toast.success('Anime removed from watching list');
  };

  const handleRemoveFromWatchlist = (anime) => {
    removeFromWatchlist(anime.mal_id);
    toast.success('Anime removed from to-watch list');
  };

  const handleRemoveFromFavorites = (anime) => {
    removeFromFavorites(anime.mal_id);
    toast.success('Anime removed from favorites');
  };

  const handleRemoveFromCollection = (anime, collectionName) => {
    removeFromCollection(anime.mal_id, collectionName);
    toast.success(`Anime removed from ${collectionName}`);
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    
    if (collections.some(c => c.name === newCollectionName)) {
      toast.error('Collection with this name already exists');
      return;
    }
    
    createCollection(newCollectionName);
    toast.success(`Collection "${newCollectionName}" created`);
    setNewCollectionName('');
    setIsCreateCollectionOpen(false);
  };

  const handleDeleteCollection = (collectionName: string) => {
    setCollectionToDelete(collectionName);
    setIsDeleteCollectionOpen(true);
  };

  const confirmDeleteCollection = () => {
    if (collectionToDelete) {
      deleteCollection(collectionToDelete);
      toast.success(`Collection "${collectionToDelete}" deleted`);
      setCollectionToDelete(null);
      setIsDeleteCollectionOpen(false);
    }
  };

  const renderAnimeList = (animeList: any[], emptyMessage: string, onRemove: (anime: any) => void) => {
    if (animeList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <h2 className="text-2xl font-bold mb-2">{emptyMessage}</h2>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animeList.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} onRemove={() => onRemove(anime)} showRemoveButton={true} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 pt-8 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Your Library</h2>
      </div>
      
      <div className="border-b border-gray-800">
        <div className="flex overflow-x-auto gap-8 pb-1">
          <TabButton
            active={selectedTab === 'watching'}
            onClick={() => setSelectedTab('watching')}
          >
            <Eye size={18} />
            Watching
          </TabButton>
          <TabButton
            active={selectedTab === 'to-watch'}
            onClick={() => setSelectedTab('to-watch')}
          >
            <BookMarked size={18} />
            To Watch
          </TabButton>
          <TabButton
            active={selectedTab === 'watched'}
            onClick={() => setSelectedTab('watched')}
          >
            <Check size={18} />
            Watched
          </TabButton>
          <TabButton
            active={selectedTab === 'favorites'}
            onClick={() => setSelectedTab('favorites')}
          >
            <Heart size={18} />
            Favorites
          </TabButton>
          <TabButton
            active={selectedTab === 'collections'}
            onClick={() => setSelectedTab('collections')}
          >
            <Folder size={18} />
            Collections
          </TabButton>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pb-12"
      >
        {selectedTab === 'watching' && renderAnimeList(watching, 'You are not watching any anime', handleRemoveFromWatching)}
        {selectedTab === 'to-watch' && renderAnimeList(watchlist, 'Your to-watch list is empty', handleRemoveFromWatchlist)}
        {selectedTab === 'watched' && renderAnimeList(watched, 'No watched anime yet', handleRemoveFromWatched)}
        {selectedTab === 'favorites' && renderAnimeList(favorites, 'No favorites yet', handleRemoveFromFavorites)}
        
        {selectedTab === 'collections' && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateCollectionOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} />
                Create Collection
              </button>
            </div>
            
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                <h2 className="text-2xl font-bold mb-2">No collections yet</h2>
                <p>Create your first collection to organize your anime</p>
              </div>
            ) : (
              <div className="space-y-12">
                {collections.map(collection => (
                  <div key={collection.name} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <h3 className="text-2xl font-bold py-2">{collection.name}</h3>
                      <button 
                        onClick={() => handleDeleteCollection(collection.name)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete collection"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {renderAnimeList(
                      collection.animes, 
                      `No anime in "${collection.name}" collection`, 
                      (anime) => handleRemoveFromCollection(anime, collection.name)
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Create Collection Dialog */}
      <Dialog
        open={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold">Create New Collection</Dialog.Title>
              <button 
                onClick={() => setIsCreateCollectionOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="collection-name" className="block text-sm font-medium mb-2">
                Collection Name
              </label>
              <input
                type="text"
                id="collection-name"
                placeholder="e.g., My Top 10 Anime"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreateCollectionOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Collection Confirmation Dialog */}
      <Dialog
        open={isDeleteCollectionOpen}
        onClose={() => setIsDeleteCollectionOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-4">
              <Dialog.Title className="text-lg font-bold">Delete Collection</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete "{collectionToDelete}"? This action cannot be undone.
              </Dialog.Description>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteCollectionOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCollection}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 relative flex items-center gap-2 whitespace-nowrap ${
        active ? 'text-white' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        />
      )}
    </button>
  );
}

export default Library;
