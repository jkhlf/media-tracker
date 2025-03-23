import React, { useState } from 'react';
import { Star, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export interface CollectionItem {
  id: number;
  title: string;
  image: string;
  year?: number;
  score?: number;
  type?: string;
}

export interface CollectionProps {
  title: string;
  slug: string;
  coverImage: string;
  items: CollectionItem[];
  description?: string;
  isEditable?: boolean;
}

const AnimeCollection: React.FC<CollectionProps> = ({
  title,
  slug,
  coverImage,
  items,
  description,
  isEditable = false
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Fallback image handler
  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback para imagens de itens
  const handleItemImageError = (itemId: number) => {
    // Aqui poderíamos atualizar um estado para controlar quais imagens falharam
    console.log(`Imagem do item ${itemId} falhou ao carregar`);
  };

  const fallbackCoverImage = "";
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/collection/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || `Confira esta coleção: ${title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam a Web Share API
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Link copiado para a área de transferência!');
      }).catch(err => {
        console.error('Erro ao copiar link:', err);
        toast.error('Erro ao copiar link');
      });
    }
  };

  const handleFavorite = () => {
    toast.info('Funcionalidade de favoritar em desenvolvimento!');
    
    // Adicionar animação ao coração
    const heart = document.getElementById(`heart-${slug}`);
    if (heart) {
      heart.classList.add('heart-animation');
      setTimeout(() => heart.classList.remove('heart-animation'), 1000);
    }
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <Link to={`/collection/${slug}`} className="block">
        <div className="relative aspect-video">
          <img 
            src={imageError ? fallbackCoverImage : coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 fade-in">
            <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{title}</h3>
            {description && (
              <p className="text-white/80 text-sm mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {items.length} animes
            </span>
            {items.length > 0 && items[0].score && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="mx-1.5">•</span>
                <Star className="w-3.5 h-3.5 text-yellow-500 mr-0.5" />
                <span>{items[0].score}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleFavorite}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Favoritar coleção"
            >
              <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" id={`heart-${slug}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Compartilhar coleção"
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex overflow-x-auto pb-1 gap-1.5 scrollbar-thin">
          {items.slice(0, 5).map((anime, index) => (
            <Link 
              key={anime.id}
              to={`/anime/${anime.id}`}
              className="flex-shrink-0 relative w-14 h-20 rounded-md overflow-hidden"
            >
              <img 
                src={anime.image} 
                alt={anime.title} 
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                }}
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
            </Link>
          ))}
          {items.length > 5 && (
            <Link 
              to={`/collection/${slug}`}
              className="flex-shrink-0 relative w-14 h-20 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium text-sm"
            >
              +{items.length - 5}
            </Link>
          )}
        </div>
        
        <Link 
          to={`/collection/${slug}`}
          className="mt-3 inline-flex w-full items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-400 font-medium text-sm rounded-lg transition-colors btn-hover-effect"
        >
          Ver coleção completa
        </Link>
      </div>
      
      {/* Botão de editar (só aparece se isEditable for true) */}
      {isEditable && (
        <Link 
          to={`/collection/${slug}/edit`}
          className="absolute top-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Editar
        </Link>
      )}
    </div>
  );
};

export default AnimeCollection; 