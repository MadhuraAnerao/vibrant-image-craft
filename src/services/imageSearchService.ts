
import { Preferences } from '@capacitor/preferences';

interface SearchImage {
  id: string;
  url: string;
  title: string;
  source: string;
}

/**
 * Search for images from Unsplash API
 * We're using a mock implementation here since we don't have an actual API key
 */
export const searchImages = async (query: string, page: number = 1, perPage: number = 10): Promise<SearchImage[]> => {
  try {
    if (!query) return [];

    // Generate deterministic but diverse results
    const queryHash = hashString(query);
    
    const images: SearchImage[] = [];
    
    for (let i = 0; i < perPage; i++) {
      const imageNumber = (page - 1) * perPage + i + 1;
      const imageId = `${queryHash}-${imageNumber}`;
      
      images.push({
        id: imageId,
        // Use unique parameters to avoid caching issues
        url: `https://source.unsplash.com/random/800x600?${query}&sig=${imageId}`,
        title: `${query} image ${imageNumber}`,
        source: 'Unsplash',
      });
    }
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return images;
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};

// Simple hash function for query strings
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Get recently searched queries
 */
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const { value } = await Preferences.get({ key: 'recentImageSearches' });
    if (value) {
      return JSON.parse(value);
    }
    return [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

/**
 * Save a search query to recent searches
 */
export const saveSearchQuery = async (query: string): Promise<void> => {
  try {
    const recentSearches = await getRecentSearches();
    
    // Remove if exists and add to beginning (most recent)
    const updatedSearches = [
      query,
      ...recentSearches.filter(q => q !== query)
    ].slice(0, 10); // Keep only 10 most recent
    
    await Preferences.set({
      key: 'recentImageSearches',
      value: JSON.stringify(updatedSearches),
    });
  } catch (error) {
    console.error('Error saving search query:', error);
  }
};
