import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allCollections } from '../data/collections';
import { CollectionProps } from '../components/AnimeCollection';
import { ArrowLeft, Star, Clock, Calendar, Share2, Link, Edit, Heart, Download } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';

const CollectionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionProps | null>(null);
  const [isUserCollection, setIsUserCollection] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Coleção | Anime Tracker`;
    setShareUrl(window.location.href);
    
    // Buscar a coleção
    const findCollection = async () => {
      setIsLoading(true);
      
      // Primeiro, verificar nas coleções predefinidas
      const predefinedCollection = allCollections.find(col => col.slug === slug);
      
      if (predefinedCollection) {
        setCollection(predefinedCollection);
        setIsUserCollection(false);
        setIsLoading(false);
        document.title = `${predefinedCollection.title} | Anime Tracker`;
        return;
      }
      
      // Se não encontrar, buscar nas coleções do usuário
      try {
        const savedCollections = localStorage.getItem('userCollections');
        if (savedCollections) {
          const userCollections = JSON.parse(savedCollections) as CollectionProps[];
          const userCollection = userCollections.find(col => col.slug === slug);
          
          if (userCollection) {
            setCollection(userCollection);
            setIsUserCollection(true);
            document.title = `${userCollection.title} | Anime Tracker`;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar coleções do usuário:', error);
      }
      
      setIsLoading(false);
    };
    
    findCollection();
  }, [slug]);

  // Compartilhar via navegador
  const shareCollection = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection?.title || 'Coleção de Anime',
          text: collection?.description || 'Confira esta coleção de anime!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam a Web Share API
      setIsShareMenuOpen(true);
    }
  };

  // Copiar link para a área de transferência
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Link copiado para a área de transferência!');
      setIsShareMenuOpen(false);
    }).catch(err => {
      console.error('Erro ao copiar link:', err);
      toast.error('Erro ao copiar link');
    });
  };

  // Compartilhar em redes sociais
  const shareOnSocialMedia = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    let url = '';
    const text = encodeURIComponent(`Confira esta coleção de anime: ${collection?.title || 'Coleção'}`);
    const shareUrl = encodeURIComponent(window.location.href);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${text}%20${shareUrl}`;
        break;
    }
    
    window.open(url, '_blank');
    setIsShareMenuOpen(false);
  };

  // Baixar coleção como JSON
  const downloadCollection = () => {
    if (!collection) return;
    
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileName = `${collection.slug}-collection.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast.success('Coleção baixada com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shimmer loading skeleton */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          {/* Banner shimmer */}
          <div className="aspect-[3/1] sm:aspect-[21/9] w-full bg-gray-200 dark:bg-gray-800 shimmer"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {/* Título shimmer */}
            <div className="h-10 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md shimmer mb-4"></div>
            {/* Descrição shimmer */}
            <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md shimmer"></div>
          </div>
        </div>
        
        {/* Grid de Animes shimmer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array(12).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 shimmer"></div>
              <div className="p-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded shimmer mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Coleção não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            A coleção que você está procurando não existe ou foi removida.
          </p>
          <RouterLink 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a página inicial
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 fade-in">
      {/* Header da Coleção */}
      <div className="relative">
        <div className="aspect-[3/1] sm:aspect-[21/9] w-full">
          <img 
            src={collection.coverImage} 
            alt={collection.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
            }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full mb-6">
            <RouterLink 
              to="/" 
              className="inline-flex items-center text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </RouterLink>
            
            <div className="flex items-center gap-2">
              {isUserCollection && (
                <RouterLink 
                  to={`/collection/${slug}/edit`}
                  className="inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Editar
                </RouterLink>
              )}
              
              <div className="relative">
                <button
                  onClick={shareCollection}
                  className="inline-flex items-center text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium transition-colors"
                  aria-label="Compartilhar coleção"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Compartilhar
                </button>
                
                {isShareMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden share-menu-animation">
                    <div className="py-1">
                      <button
                        onClick={copyLinkToClipboard}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Link className="w-4 h-4 mr-3" />
                        Copiar link
                      </button>
                      
                      <button
                        onClick={() => shareOnSocialMedia('twitter')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </button>
                      
                      <button
                        onClick={() => shareOnSocialMedia('facebook')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      
                      <button
                        onClick={() => shareOnSocialMedia('whatsapp')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                      
                      <button
                        onClick={downloadCollection}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Baixar como JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{collection.title}</h1>
            
            {collection.description && (
              <p className="text-white/80 text-lg md:text-xl max-w-3xl mb-4">{collection.description}</p>
            )}
            
            <div className="flex items-center text-white/70 space-x-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {collection.items.length} animes
              </span>
              
              <button 
                className="flex items-center hover:text-red-400 transition-colors"
                onClick={() => {
                  toast.info('Funcionalidade em desenvolvimento!');
                  const heart = document.getElementById('favorite-heart');
                  if (heart) {
                    heart.classList.add('heart-animation');
                    setTimeout(() => heart.classList.remove('heart-animation'), 1000);
                  }
                }}
              >
                <Heart id="favorite-heart" className="w-4 h-4 mr-1.5" />
                Favoritar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Animes */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {collection.items.map((anime) => (
            <RouterLink 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow card-hover-effect"
            >
              <div className="relative aspect-[2/3] img-hover-zoom">
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
                {anime.score && (
                  <div className="absolute top-2 right-2 flex items-center bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    {anime.score}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 h-10">
                  {anime.title}
                </h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {anime.year && (
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {anime.year}
                    </span>
                  )}
                  {anime.type && (
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {anime.type || 'TV'}
                    </span>
                  )}
                </div>
              </div>
            </RouterLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage; 