import React, { useState, useEffect } from 'react';
import { useUserDataStore } from '../lib/userDataStore';
import { Plus, Minus, Check, Save, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAnimeStore } from '../lib/store';

interface AnimeTrackerProps {
  animeId: number;
  totalEpisodes?: number;
  onUpdate?: (currentEpisode: number) => void;
  animeDetails?: any; 
}

export function AnimeTracker({ animeId, totalEpisodes, onUpdate, animeDetails }: AnimeTrackerProps) {
  const { animeData, updateAnimeData, incrementEpisode, markAsComplete } = useUserDataStore();
  const { addToWatched, watched } = useAnimeStore();
  
  const userData = animeData[animeId];
  
  const [notes, setNotes] = useState(userData?.notes || '');
  const [score, setScore] = useState<number | null>(userData?.score !== undefined ? userData.score : null);
  const [showNotes, setShowNotes] = useState(false);
  
  useEffect(() => {
    if (userData) {
      setNotes(userData.notes || '');
      setScore(userData.score !== undefined ? userData.score : null);
    }
  }, [userData]);

  useEffect(() => {
    if (animeDetails && animeId) {
      updateAnimeData(animeId, {
        title: animeDetails.title,
        image: animeDetails.images?.webp?.large_image_url || animeDetails.images?.jpg?.image_url,
      });
    }
  }, [animeDetails, animeId, updateAnimeData]);
  
  const currentEpisode = userData?.currentEpisode || 0;
  const isComplete = totalEpisodes && currentEpisode >= totalEpisodes;
  
  const handleIncrementEpisode = () => {
    incrementEpisode(animeId, totalEpisodes);
    if (onUpdate) {
      onUpdate(currentEpisode + 1);
    }
    
    if (totalEpisodes && currentEpisode + 1 >= totalEpisodes) {
      toast.success('Congratulations! You\'ve completed this anime!');
      if (animeDetails && !watched.some(a => a.mal_id === animeId)) {
        addToWatched(animeDetails);
      }
    } else {
      toast.success(`Updated to episode ${currentEpisode + 1}`);
    }
  };
  
  const handleDecrementEpisode = () => {
    if (currentEpisode <= 0) return;
    
    updateAnimeData(animeId, { 
      currentEpisode: currentEpisode - 1,
      finishDate: null  
    });
    
    if (onUpdate) {
      onUpdate(currentEpisode - 1);
    }
    
    toast.success(`Updated to episode ${currentEpisode - 1}`);
  };
  
  const handleSetEpisode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEpisode = parseInt(e.target.value, 10) || 0;
    const validEpisode = Math.max(0, Math.min(newEpisode, totalEpisodes || Infinity));
    
    updateAnimeData(animeId, { 
      currentEpisode: validEpisode,
      finishDate: totalEpisodes && validEpisode >= totalEpisodes 
        ? new Date().toISOString() 
        : userData?.finishDate
    });
    
    if (onUpdate) {
      onUpdate(validEpisode);
    }
  };
  
  const handleSaveNotes = () => {
    updateAnimeData(animeId, { notes });
    toast.success('Notes saved');
    setShowNotes(false);
  };
  
  const handleScoreChange = (newScore: number) => {
    updateAnimeData(animeId, { score: newScore });
    setScore(newScore);
    toast.success(`Rated ${newScore}/10`);
  };

  const handleMarkAsComplete = () => {
    if (!totalEpisodes) {
      toast.error('Cannot mark as complete: Unknown number of episodes');
      return;
    }

    markAsComplete(animeId, totalEpisodes, animeDetails);
    toast.success(`Marked all ${totalEpisodes} episodes as watched`);
    
    if (onUpdate) {
      onUpdate(totalEpisodes);
    }
  };
  
  const startDate = userData?.startDate ? new Date(userData.startDate) : null;
  const finishDate = userData?.finishDate ? new Date(userData.finishDate) : null;
  
  return (
    <div className="bg-card text-card-foreground rounded-lg p-6 space-y-6 border border-border">
      <h3 className="text-lg font-medium border-b border-border pb-2">Tracking</h3>
      
      {/* Episode Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">
            {currentEpisode}{totalEpisodes ? `/${totalEpisodes}` : ''} episodes
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrementEpisode}
            disabled={currentEpisode <= 0}
            className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease episode"
          >
            <Minus size={16} />
          </button>
          
          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
              style={{ 
                width: totalEpisodes 
                  ? `${Math.min(100, (currentEpisode / totalEpisodes) * 100)}%` 
                  : '0%' 
              }}
            />
          </div>
          
          <button
            onClick={handleIncrementEpisode}
            disabled={!!isComplete}
            className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase episode"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentEpisode}
            onChange={handleSetEpisode}
            min={0}
            max={totalEpisodes || undefined}
            className="w-20 px-2 py-1 bg-secondary text-secondary-foreground border border-border rounded-md text-center"
          />
          
          {isComplete && (
            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
              <Check size={14} className="mr-1" />
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          {!isComplete && totalEpisodes && (
            <button
              onClick={handleMarkAsComplete}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1"
            >
              <Check size={14} />
              Mark as Complete
            </button>
          )}
        </div>
      </div>
      
      {/* Dates */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground text-sm">
            {startDate 
              ? `Started on ${format(startDate, 'MMM d, yyyy')}` 
              : 'Not started yet'}
          </span>
        </div>
        
        {finishDate && (
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span className="text-muted-foreground text-sm">
              Completed on {format(finishDate, 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
      
      {/* Score */}
      <div className="space-y-2">
        <label className="block text-muted-foreground">Your Score</label>
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleScoreChange(value)}
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                score === value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      
      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-muted-foreground">Notes</label>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            {showNotes ? 'Hide' : 'Edit'}
          </button>
        </div>
        
        {showNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-md text-secondary-foreground"
              placeholder="Add your thoughts, reflections, or notes about this anime..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 flex items-center gap-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md text-sm"
              >
                <Save size={14} />
                Save Notes
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-secondary rounded-md p-3 min-h-[60px] text-sm">
            {notes ? (
              <p className="text-secondary-foreground whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeTracker;
