// HomeBanner.tsx
import React from 'react';
import AnimeCarousel from './AnimeCarousel';
import { ArrowRight } from 'lucide-react';

const HomeBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-[#212121] dark:to-gray-800 rounded-xl shadow-lg mb-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-12 lg:px-16 py-12 relative z-10">
        {/* Left side: Title, description, button */}
        <div className="w-full md:w-5/12 mt-10 md:mt-0 md:pr-6 lg:pr-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
            Your Anime Journey <br />Starts Here
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
            Tracking your anime journey has never been easier. Discover new anime, rate your favorites, and explore seasonal picks.
            <br className="hidden md:block" />
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">
             Developed by Fans for Fans.
            </span>
          </p>
          <a href='/library' className="flex w-52 items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl">
            Explore Anime
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Right side: Carousel */}
        <div className="w-full md:w-7/12 lg:w-1/2">
          <div className="rounded-xl overflow-hidden shadow-2xl transform md:translate-y-0 transition-all">
            <AnimeCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
