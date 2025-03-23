import React, { useState, useEffect } from 'react';
import { getTopAnime } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Star, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimeCarousel: React.FC = () => {
    const { data: topAnime, isLoading: topLoading } = useQuery({
        queryKey: ['topAnime'],
        queryFn: () => getTopAnime(),
    });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    
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

    // Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isTransitioning && topAnime?.data.length) {
                handleNext();
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [isTransitioning, topAnime?.data.length]);

    const getCardStyle = (index) => {
        if (!topAnime?.data.length) return {};
        
        const count = Math.min(topAnime.data.length, 6);
        const relativeIndex = (index - currentIndex + count) % count;
        
        if (relativeIndex === 0) {
            return {
                zIndex: 30,
                transform: 'translateX(0%) rotate(0deg) scale(1)',
                opacity: 1,
                filter: 'brightness(1)'
            };
        } else if (relativeIndex === 1) {
            return {
                zIndex: 20,
                transform: 'translateX(40%) rotate(5deg) scale(0.9)',
                opacity: 0.9,
                filter: 'brightness(0.8)'
            };
        } else if (relativeIndex === 2) {
            return {
                zIndex: 10,
                transform: 'translateX(80%) rotate(10deg) scale(0.8)',
                opacity: 0.7,
                filter: 'brightness(0.6)'
            };
        } else if (relativeIndex === count - 1) {
            return {
                zIndex: 20,
                transform: 'translateX(-40%) rotate(-5deg) scale(0.9)',
                opacity: 0.9,
                filter: 'brightness(0.8)'
            };
        } else if (relativeIndex === count - 2) {
            return {
                zIndex: 10,
                transform: 'translateX(-80%) rotate(-10deg) scale(0.8)',
                opacity: 0.7,
                filter: 'brightness(0.6)'
            };
        } else {
            return {
                zIndex: 0,
                transform: 'translateX(120%) rotate(15deg) scale(0.7)',
                opacity: 0,
                filter: 'brightness(0.5)'
            };
        }
    };

    if (topLoading || !topAnime) { 
        return (
            <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden p-8 perspective-1000">
            <div className="absolute inset-0  rounded-xl backdrop-blur-sm z-0" />
            
            <div className="relative w-full h-full flex items-center justify-center z-10">
                {topAnime.data.slice(0, 6).map((anime, index) => {
                    const isActive = (index - currentIndex + 6) % 6 === 0;
                    const isHovered = hoveredCard === index;
                    
                    return (
                        <div
                            key={anime.mal_id}
                            className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${isActive ? 'hover:scale-105' : ''}`}
                            style={{
                                width: '280px',
                                height: '400px',
                                ...getCardStyle(index)
                            }}
                            onClick={() => {
                                if ((index - currentIndex + 6) % 6 === 1) handleNext();
                                else if ((index - currentIndex + 6) % 6 === 5) handlePrev();
                                else if ((index - currentIndex + 6) % 6 !== 0) setCurrentIndex(index);
                            }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <Link 
                                to={`/anime/${anime.mal_id}`} 
                                className="block w-full h-full rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl"
                                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={anime.images.jpg.large_image_url}
                                        alt={anime.title}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {isActive || isHovered ? (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
                                            <div className="flex items-center mb-2">
                                                <Star className="text-yellow-400 w-5 h-5 mr-1" />
                                                <span className="text-white font-semibold">{anime.score || '?'}</span>
                                                <span className="mx-2 text-white/60">•</span>
                                                <span className="text-white/80 text-sm">{anime.year || 'TBA'}</span>
                                            </div>
                                            
                                            <h3 className="text-xl text-white font-bold line-clamp-2 mb-2">{anime.title}</h3>
                                            
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {anime.genres?.slice(0, 3).map(genre => (
                                                    <span key={genre.mal_id} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <button className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors text-sm">
                                                    <PlayCircle className="w-4 h-4 mr-1" />
                                                    Ver detalhes
                                                </button>
                                                
                                                <span className="text-white/70 text-sm">
                                                    #{index + 1} Top
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
            
            <button 
                onClick={handlePrev}
                disabled={isTransitioning}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all z-40 shadow-lg"
                aria-label="Anime anterior"
            >
                <ArrowLeft size={20} />
            </button>
            
            <button 
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all z-40 shadow-lg"
                aria-label="Próximo anime"
            >
                <ArrowRight size={20} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                {topAnime.data.slice(0, 6).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Ver anime ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default AnimeCarousel;
