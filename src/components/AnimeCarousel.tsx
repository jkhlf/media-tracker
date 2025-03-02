import React, { useState } from 'react';
import { getTopAnime } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const AnimeCards = () => {
    const { data: topAnime, isLoading: topLoading } = useQuery({
        queryKey: ['topAnime'],
        queryFn: () => getTopAnime(),
    });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const maxVisible = 3;
    
    const handleNext = () => {
        if (isTransitioning || !topAnime?.data.length) return;
        
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % Math.min(topAnime.data.length, 6));
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    };
    
    const handlePrev = () => {
        if (isTransitioning || !topAnime?.data.length) return;
        
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + Math.min(topAnime.data.length, 6)) % Math.min(topAnime.data.length, 6));
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    };

    const getCardStyle = (index) => {
        if (!topAnime?.data.length) return {};
        
        const count = Math.min(topAnime.data.length, 6);
        const relativeIndex = (index - currentIndex + count) % count;
        
        if (relativeIndex === 0) {
            return {
                zIndex: 30,
                transform: 'translateX(0%) rotate(0deg) scale(1)',
                opacity: 1
            };
        } else if (relativeIndex === 1) {
            return {
                zIndex: 20,
                transform: 'translateX(30%) rotate(5deg) scale(0.9)',
                opacity: 0.9
            };
        } else if (relativeIndex === 2) {
            return {
                zIndex: 10,
                transform: 'translateX(60%) rotate(10deg) scale(0.8)',
                opacity: 0.7
            };
        } else if (relativeIndex === count - 1) {
            return {
                zIndex: 20,
                transform: 'translateX(-30%) rotate(-5deg) scale(0.9)',
                opacity: 0.9
            };
        } else if (relativeIndex === count - 2) {
            return {
                zIndex: 10,
                transform: 'translateX(-60%) rotate(-10deg) scale(0.8)',
                opacity: 0.7
            };
        } else {
            return {
                zIndex: 0,
                transform: 'translateX(120%) rotate(15deg) scale(0.7)',
                opacity: 0
            };
        }
    };

    if (topLoading || !topAnime) { 
        return (
            <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800"> 
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden p-8">
            <div className="relative w-full h-full flex items-center justify-center">
                {topAnime.data.slice(0, 6).map((anime, index) => (
                    <div
                        key={anime.mal_id}
                        className="absolute transition-all duration-500 ease-in-out cursor-pointer"
                        style={{
                            width: '240px',
                            height: '350px',
                            ...getCardStyle(index)
                        }}
                        onClick={() => {
                            if ((index - currentIndex + 6) % 6 === 1) handleNext();
                            else if ((index - currentIndex + 6) % 6 === 5) handlePrev();
                            else if ((index - currentIndex + 6) % 6 !== 0) setCurrentIndex(index);
                        }}
                    >
                        <a href={`/anime/${anime.mal_id}`} className="w-full h-full rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                            <img
                                src={anime.images.jpg.large_image_url}
                                alt={anime.title}
                                className="w-full h-full object-cover"
                            />
                        </a>
                        
                        {(index - currentIndex + 6) % 6 === 0 && (
                            <div className="absolute -bottom-16 left-0 right-0 text-center">
                                <h3 className="text-xl text-black/80 dark:text-white font-medium mb-1">{anime.title}</h3>
                                <p className="text-sm text-black/70 dark:text-white">
                                    {anime.year ? `${anime.year}` : ''} 
                                    {anime.year && anime.genres?.length ? ' • ' : ''}
                                    {anime.genres?.slice(0, 1).map(g => g.name).join('')}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <button 
                onClick={handlePrev}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-all z-40"
                aria-label="Previous anime"
            >
                <ArrowLeft size={20} />
            </button>
            
            <button 
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-all z-40"
                aria-label="Next anime"
            >
                <ArrowRight size={20} />
            </button>
        </div>
    );
};

export default AnimeCards;
