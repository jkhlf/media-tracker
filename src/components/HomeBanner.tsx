import React from 'react';
import AnimeCarousel from './AnimeCarousel';
import { Search, ListChecks, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeBanner: React.FC = () => {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96  rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Novidade! Acompanhe seus animes favoritos
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">jornada anime</span> começa aqui
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 text-xl max-w-lg">
              Descubra, acompanhe e explore seus animes favoritos em um único lugar com recursos projetados para fãs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                to="/catalog" 
                className="inline-flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-indigo-500/30"
              >
                <Search className="mr-2 w-5 h-5" />
                Explorar Catálogo
              </Link>
              
              <Link 
                to="statistics"
                className="inline-flex items-center justify-center text-indigo-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ListChecks className="mr-2 w-5 h-5" />
                Iniciar Rastreamento
              </Link>
            </div>
            
            {/* Feature bullets */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Rastreamento Fácil</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mantenha-se organizado com sua lista personalizada</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Descobertas</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Recomendações baseadas nos seus gostos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Coleções</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Crie e compartilhe coleções temáticas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <span className="text-pink-600 dark:text-pink-400 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Estatísticas</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Visualize seu progresso e hábitos de visualização</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Carousel */}
          <div className="w-full lg:w-1/2">
            <AnimeCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;