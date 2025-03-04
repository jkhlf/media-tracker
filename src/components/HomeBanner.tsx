import React from 'react';
import AnimeCarousel from './AnimeCarousel';
import { ArrowRight } from 'lucide-react';

const HomeBanner: React.FC = () => {
  return (
    <section className="rounded-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 ">
        {/* Left side: Content */}
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-3xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Your Anime Journey Starts Here
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Track, discover, and explore your favorite anime in one place.
          </p>
          
          <a 
            href="/catalog" 
            className="inline-flex items-center text-white bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Explore Anime
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
        
        {/* Right side: Carousel */}
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden">
            <AnimeCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;