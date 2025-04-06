import { CollectionProps } from '../components/AnimeCollection';

// Define collection skeletons that will be populated with API data
export const romanceCollection: CollectionProps = {
  title: 'Romances Favoritos',
  slug: 'romance-favorites',
  description: 'Uma coletânea dos melhores animes românticos que vão te fazer suspirar',
  coverImage: '',
  items: []
};

export const sliceOfLifeCollection: CollectionProps = {
  title: 'Slice of Life Favoritos',
  slug: 'slice-of-life-favorites',
  description: 'Relaxe com estes animes que retratam o cotidiano de maneira encantadora',
  coverImage: '',
  items: []
};

export const isekaiCollection: CollectionProps = {
  title: 'Isekais Favoritos',
  slug: 'isekai-favorites',
  description: 'Aventuras em mundos fantásticos e protagonistas transportados para realidades alternativas',
  coverImage: '',
  items: []
};

// Initial empty collections array
export let allCollections: CollectionProps[] = [
  romanceCollection,
  sliceOfLifeCollection,
  isekaiCollection
];

// Romance anime IDs
const romanceAnimeIds = [14813, 23273, 37999, 28851, 5081, 25397, 2167, 38000, 2966, 45726];

// Slice of Life anime IDs
const sliceOfLifeAnimeIds = [21922, 37450, 1210, 2167, 36038, 32901, 20583, 431, 11887, 47917];

// Isekai anime IDs
const isekaiAnimeIds = [31240, 28891, 31240, 52991, 37991, 30831, 5781, 2001, 41461, 35790];

// Helper function to find highest rated anime in a collection
const findHighestRatedAnime = (items: any[]) => {
  if (items.length === 0) return null;
  return items.reduce((prev, current) => {
    return (prev.score || 0) > (current.score || 0) ? prev : current;
  });
};

// Function to fetch anime data for a collection
const fetchAnimeForCollection = async (
  collection: CollectionProps, 
  animeIds: number[]
): Promise<CollectionProps> => {
  try {
    const animeItems = await Promise.all(animeIds.map(async (id) => {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const data = await response.json();
        const anime = data.data;

        if (!anime) return null;

        return {
          id: anime.mal_id,
          title: anime.title,
          image: anime.images.jpg.image_url,
          score: anime.score,
          year: anime.year,
          type: anime.type
        };
      } catch (error) {
        console.error(`Failed to fetch anime with ID ${id}:`, error);
        return null;
      }
    }));

    // Filter out any failed requests
    const validAnimeItems = animeItems.filter(item => item !== null);

    // Get highest rated anime for the cover image
    const highestRated = findHighestRatedAnime(validAnimeItems);
    
    // Return updated collection
    return {
      ...collection,
      items: validAnimeItems,
      coverImage: highestRated?.image || ''
    };
  } catch (error) {
    console.error(`Failed to fetch anime for collection ${collection.title}:`, error);
    return collection;
  }
};

// Initialize collections with API data
export const initializeCollections = async () => {
  try {
    // Fetch with delay between requests to avoid rate limiting
    const updatedRomance = await fetchAnimeForCollection(romanceCollection, romanceAnimeIds);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    const updatedSliceOfLife = await fetchAnimeForCollection(sliceOfLifeCollection, sliceOfLifeAnimeIds);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    const updatedIsekai = await fetchAnimeForCollection(isekaiCollection, isekaiAnimeIds);
    
    allCollections = [updatedRomance, updatedSliceOfLife, updatedIsekai];
    
    return allCollections;
  } catch (error) {
    console.error('Failed to initialize collections:', error);
    return allCollections;
  }
};

export default allCollections;