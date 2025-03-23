import React, { useRef, useState } from 'react';
import AnimeCollection, { CollectionProps } from './AnimeCollection';
import { ArrowLeft, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CollectionsGridProps {
  title: string;
  collections: CollectionProps[];
  description?: string;
  showAddButton?: boolean;
  isEditable?: boolean;
}

const CollectionsGrid: React.FC<CollectionsGridProps> = ({ 
  title, 
  collections,
  description,
  showAddButton = false,
  isEditable = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth - 10); // 10px de margem
      setContainerWidth(clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current: container } = scrollRef;
      const scrollAmount = container.clientWidth * 0.75;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      
      // Atualizar estado após scroll
      setTimeout(updateScrollState, 500);
    }
  };

  // Inicializar estado de scroll quando o componente montar
  React.useEffect(() => {
    if (scrollRef.current) {
      updateScrollState();
      // Adicionar listener para resize da janela
      window.addEventListener('resize', updateScrollState);
      
      // Observer para mudanças no conteúdo
      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(scrollRef.current);
      
      return () => {
        window.removeEventListener('resize', updateScrollState);
        resizeObserver.disconnect();
      };
    }
  }, [collections.length]);

  // Handler para eventos de scroll
  const handleScroll = () => {
    updateScrollState();
  };

  return (
    <section className="py-10 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Descubra
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {showAddButton && (
              <Link
                to="/collections/create"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova coleção
              </Link>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('left')}
                disabled={scrollPosition <= 0}
                className={`p-2 rounded-full transition-colors ${
                  scrollPosition <= 0 
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                aria-label="Rolar para a esquerda"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={scrollPosition >= maxScroll}
                className={`p-2 rounded-full transition-colors ${
                  scrollPosition >= maxScroll 
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                aria-label="Rolar para a direita"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Container com scrollbar escondida */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
        >
          {collections.map((collection) => (
            <div 
              key={collection.slug} 
              className="w-72 sm:w-80 md:w-[340px] snap-start" 
            >
              <AnimeCollection {...collection} isEditable={isEditable} />
            </div>
          ))}
          
          {showAddButton && (
            <div className="w-72 sm:w-80 md:w-[340px] snap-start">
              <Link 
                to="/collections/create"
                className="flex flex-col items-center justify-center h-full min-h-[200px] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-8"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">Criar Coleção</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  Crie sua própria coleção de animes favoritos
                </p>
              </Link>
            </div>
          )}
        </div>
        
        {/* Indicadores de página para telas pequenas */}
        <div className="flex justify-center mt-6 md:hidden">
          <div className="inline-flex items-center space-x-1">
            {[...Array(Math.ceil(collections.length / 2))].map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  scrollPosition >= (i * containerWidth) && 
                  scrollPosition < ((i + 1) * containerWidth)
                    ? 'bg-indigo-600 dark:bg-indigo-500' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      left: i * containerWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid; 