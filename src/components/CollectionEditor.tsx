import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CollectionProps, CollectionItem } from './AnimeCollection';
import { Search, X, Plus, Save, Trash, Upload, AlertCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../lib/api';

const DEFAULT_COVER = "";

const CollectionEditor: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEditMode = Boolean(slug);
  
  const [collection, setCollection] = useState<CollectionProps>({
    title: '',
    slug: '',
    description: '',
    coverImage: DEFAULT_COVER,
    items: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Buscar dados existentes para edição
  useEffect(() => {
    if (isEditMode && slug) {
      try {
        const savedCollections = localStorage.getItem('userCollections');
        if (savedCollections) {
          const collections = JSON.parse(savedCollections) as CollectionProps[];
          const existingCollection = collections.find(c => c.slug === slug);
          
          if (existingCollection) {
            setCollection(existingCollection);
          } else {
            toast.error('Coleção não encontrada!');
            navigate('/collections/create');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar coleção:', error);
        toast.error('Erro ao carregar coleção para edição');
      }
    }
  }, [slug, isEditMode, navigate]);
  
  // Busca de anime
  const { data: searchResults, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['animeSearch', searchTerm],
    queryFn: () => searchAnime(searchTerm),
    enabled: false,
  });
  
  // Realizar busca
  const handleSearch = () => {
    if (searchTerm.trim().length < 3) {
      toast.warning('Digite pelo menos 3 caracteres para buscar');
      return;
    }
    
    setIsSearching(true);
    refetch().then(() => {
      setIsSearching(false);
    }).catch(() => {
      setIsSearching(false);
      toast.error('Erro ao buscar animes');
    });
  };
  
  // Gerar slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Atualizar título e gerar slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setCollection(prev => ({
      ...prev,
      title: newTitle,
      slug: isEditMode ? prev.slug : generateSlug(newTitle)
    }));
    
    // Limpar erro se existir
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };
  
  // Adicionar anime à coleção
  const addAnimeToCollection = (anime: any) => {
    // Verificar se já existe
    if (collection.items.some(item => item.id === anime.mal_id)) {
      toast.info('Este anime já está na coleção');
      return;
    }
    
    const newItem: CollectionItem = {
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      year: anime.year,
      score: anime.score,
      type: anime.type
    };
    
    setCollection(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // Remover anime da coleção
  const removeAnimeFromCollection = (id: number) => {
    setCollection(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Arrastar e soltar para reordenar
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDraggingOver(false);
  };
  
  const handleDrop = (targetIndex: number) => {
    if (draggedItem === null) return;
    
    const newItems = [...collection.items];
    const draggedItemValue = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(targetIndex, 0, draggedItemValue);
    
    setCollection(prev => ({
      ...prev,
      items: newItems
    }));
    
    setDraggedItem(null);
    setIsDraggingOver(false);
  };
  
  // Upload de imagem de capa
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamanho e tipo
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 2MB');
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WEBP');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverPreview(result);
      setCoverImageError(false);
      
      // Adicionar para o state principal quando usamos o arquivo
      // Vamos testar a URL antes
      const img = new Image();
      img.onload = () => {
        setCollection(prev => ({
          ...prev,
          coverImage: result
        }));
      };
      img.onerror = () => {
        setCoverImageError(true);
        toast.error('Erro ao carregar imagem de capa');
      };
      img.src = result;
    };
    
    reader.readAsDataURL(file);
  };
  
  // Validar e salvar a coleção
  const validateCollection = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!collection.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }
    
    if (collection.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um anime à coleção';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const saveCollection = async () => {
    if (!validateCollection()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Buscar coleções existentes
      const savedCollections = localStorage.getItem('userCollections');
      let collections: CollectionProps[] = savedCollections 
        ? JSON.parse(savedCollections) 
        : [];
      
      if (isEditMode) {
        // Atualizar coleção existente
        collections = collections.map(c => 
          c.slug === slug ? collection : c
        );
        toast.success('Coleção atualizada com sucesso!');
      } else {
        // Verificar se já existe uma coleção com o mesmo slug
        if (collections.some(c => c.slug === collection.slug)) {
          // Gerar um slug único adicionando um timestamp
          const uniqueSlug = `${collection.slug}-${Date.now()}`;
          setCollection(prev => ({ ...prev, slug: uniqueSlug }));
          collections.push({ ...collection, slug: uniqueSlug });
        } else {
          collections.push(collection);
        }
        toast.success('Coleção criada com sucesso!');
      }
      
      // Salvar no localStorage
      localStorage.setItem('userCollections', JSON.stringify(collections));
      
      // Redirecionar após salvar
      setTimeout(() => {
        navigate(`/collection/${isEditMode ? slug : collection.slug}`);
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar coleção:', error);
      toast.error('Erro ao salvar a coleção');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Excluir coleção
  const deleteCollection = () => {
    if (!isEditMode || !slug) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.')) {
      try {
        const savedCollections = localStorage.getItem('userCollections');
        if (savedCollections) {
          const collections = JSON.parse(savedCollections) as CollectionProps[];
          const updatedCollections = collections.filter(c => c.slug !== slug);
          
          localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
          toast.success('Coleção excluída com sucesso!');
          
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao excluir coleção:', error);
        toast.error('Erro ao excluir a coleção');
      }
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Editar Coleção' : 'Nova Coleção'}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {isEditMode && (
            <button
              onClick={deleteCollection}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
              disabled={isSaving}
            >
              <Trash className="w-5 h-5 mr-2" />
              Excluir
            </button>
          )}
          
          <button
            onClick={saveCollection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
            disabled={isSaving}
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado esquerdo: Detalhes da coleção */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título da Coleção*
            </label>
            <input
              type="text"
              id="title"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              value={collection.title}
              onChange={handleTitleChange}
              placeholder="Ex: Meus Animes Favoritos"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
              value={collection.description}
              onChange={(e) => setCollection(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua coleção..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagem de Capa
            </label>
            <div className="mt-1 flex flex-col items-center justify-center">
              <div className="w-full aspect-video relative overflow-hidden rounded-lg">
                <img 
                  src={coverPreview || collection.coverImage}
                  alt="Capa da coleção" 
                  className="w-full h-full object-cover"
                  onError={() => setCoverImageError(true)}
                />
                {coverImageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <label className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                <Upload className="w-4 h-4 mr-2" />
                Carregar imagem de capa
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverImageUpload}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Recomendado: 1280×720px. Máximo: 2MB.
              </p>
            </div>
          </div>
        </div>
        
        {/* Lado direito: Adicionar animes à coleção */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Animes na Coleção {collection.items.length > 0 && `(${collection.items.length})`}
            </h2>
            
            {errors.items && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex items-center text-red-800 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.items}
              </div>
            )}
            
            {/* Lista de animes na coleção */}
            <div 
              className={`bg-gray-50 dark:bg-gray-800/50 border-2 ${isDraggingOver ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700'} ${errors.items ? 'border-red-300 dark:border-red-800' : ''} border-dashed rounded-lg p-4 min-h-[200px]`}
              onDragOver={handleDragOver}
            >
              {collection.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                  <span className="text-lg mb-2">Nenhum anime adicionado</span>
                  <p className="text-sm text-center">
                    Busque e adicione animes à sua coleção
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {collection.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden relative group cursor-move ${draggedItem === index ? 'opacity-50' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={handleDragEnd}
                      onDrop={() => handleDrop(index)}
                    >
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeAnimeFromCollection(item.id)}
                            className="p-1.5 bg-red-600 rounded-full text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</h3>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{item.year || 'N/A'}</span>
                          {item.score && <span>★ {item.score}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Busca de animes */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar Animes
            </h2>
            
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título de anime..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-r-lg inline-flex items-center"
                disabled={isSearching || searchTerm.length < 3}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {/* Resultados da busca */}
            <div className="mt-4">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : searchResults?.data && searchResults.data.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.data.slice(0, 12).map((anime: any) => (
                    <div 
                      key={anime.mal_id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden relative group cursor-pointer"
                      onClick={() => addAnimeToCollection(anime)}
                    >
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={anime.images.jpg.image_url} 
                          alt={anime.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="p-1.5 bg-indigo-600 rounded-full text-white">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{anime.title}</h3>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{anime.year || 'N/A'}</span>
                          {anime.score && <span>★ {anime.score}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults?.data && searchResults.data.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum resultado encontrado para "{searchTerm}"
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditor; 