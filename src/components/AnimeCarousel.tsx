import React, { useEffect, useRef, useState } from 'react'
import { getTopAnime } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const AnimeCarousel = () => {
    const { data: topAnime, isLoading: topLoading } = useQuery({
        queryKey: ['topAnime'],
        queryFn: () => getTopAnime(),
    });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (!topLoading && topAnime?.data.length) {
            restartTimer();
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [topAnime, topLoading]);

    const restartTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (topAnime && topAnime.data.length > 0) {
                handleSlideChange((currentIndex + 1) % topAnime.data.length);
            }
        }, 7000);
    }

    const handleSlideChange = (newIndex: number) => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setCurrentIndex(newIndex);
        
        // Reset transitioning state after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 700); // Match the duration in the CSS transition
        
        restartTimer();
    }

    const goToSlide = (index: number) => handleSlideChange(index);
    const goToNextSlide = () => {
        if (topAnime && topAnime.data.length > 0) {
            handleSlideChange((currentIndex + 1) % topAnime.data.length);
        }
    }
    const goToPrevSlide = () => {
        if (topAnime && topAnime.data.length > 0) {
            handleSlideChange((currentIndex - 1 + topAnime.data.length) % topAnime.data.length);
        }
    }

    if (topLoading || !topAnime) { 
        return (
            <div className='flex items-center justify-center h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl'> 
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative h-[400px] overflow-hidden rounded-xl group">
            {topAnime.data.slice(0, 6).map((anime, index) => (
                <div
                    key={anime.mal_id}
                    className={cn(
                        "absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out",
                        index === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
                    )}
                >
                    <img
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end text-white p-8">
                        <div className="w-full max-w-[80%] text-center">
                            
                            <h2 className={cn(
                                "text-2xl md:text-4xl font-semibold text-center tracking-tight line-clamp-2 transition-all duration-700 delay-200",
                                index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                            )}>
                                {anime.title}
                            </h2>
                            
                            <p className={cn(
                                "text-lg font-light opacity-90 line-clamp-2 transition-all duration-700 delay-300 py-2",
                                index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                            )}>
                                {anime.year ? `${anime.year}, ` : ''} 
                                {anime.genres?.slice(0, 1).map(g => g.name).join(' • ')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Navigation Arrows */}
            <button 
                onClick={goToPrevSlide}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-90 transition-all z-20 hover:bg-black/60 hover:scale-110 disabled:opacity-30"
                aria-label="Previous slide"
            >
                <ChevronLeft size={20} />
            </button>
            
            <button 
                onClick={goToNextSlide}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-90 transition-all z-20 hover:bg-black/60 hover:scale-110 disabled:opacity-30"
                aria-label="Next slide"
            >
                <ChevronRight size={20} />
            </button>

            {/* Progress Indicators */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                {topAnime.data.slice(0, 6).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => !isTransitioning && goToSlide(idx)}
                        disabled={isTransitioning}
                        className={cn(
                            "group/indicator transition-all duration-300",
                            isTransitioning && "cursor-not-allowed"
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                    >
                        <div className={cn(
                            "h-1 w-12 rounded-full transition-all duration-500",
                            currentIndex === idx 
                                ? "bg-white w-16" 
                                : "bg-white/40 group-hover/indicator:bg-white/60"
                        )}></div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default AnimeCarousel;