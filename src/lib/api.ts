import axios from 'axios';
import axiosRetry from 'axios-retry'; 

// --- Rate Limiting ---
let requestQueue: (() => void)[] = [];
let isProcessingQueue = false;
const MAX_REQUESTS_PER_MINUTE = 60; 
const TIME_WINDOW_MS = 60000; 
let requestCount = 0;
let resetTime = Date.now() + TIME_WINDOW_MS;

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const now = Date.now();
    if (now > resetTime) {
      requestCount = 0;
      resetTime = now + TIME_WINDOW_MS;
    }

    if (requestCount < MAX_REQUESTS_PER_MINUTE) {
      const nextRequest = requestQueue.shift();
      if (nextRequest) {
        requestCount++;
        nextRequest(); // Execute the request
      }
    } else {
      // Wait until the next reset window
      const waitTime = resetTime - now;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  isProcessingQueue = false;
};

const enqueueRequest = (requestFn: () => Promise<any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const response = await requestFn();
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        if (!isProcessingQueue) {
          processQueue(); 
        }
      }
    });
    if (!isProcessingQueue) {
      processQueue(); 
    }
  });
};


// --- Caching ---
const cache = new Map();
const CACHE_EXPIRATION_TIME_MS = 60 * 1000; // 1 minute cache expiration

const getCache = (url: string) => {
  const cachedData = cache.get(url);
  if (cachedData) {
    if (Date.now() < cachedData.expiry) {
      return cachedData.data;
    } else {
      cache.delete(url);
    }
  }
  return null;
};

const setCache = (url: string, data: any) => {
  const expiry = Date.now() + CACHE_EXPIRATION_TIME_MS;
  cache.set(url, { data, expiry });
};


// --- Axios Instance with Error Handling and Retry Logic ---
const api = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
});

axiosRetry(api, {
  retries: 3, 
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // 1s, 2s, 3s retry delay
  },
  retryCondition: (error) => {
    return error.response?.status === 429 || axiosRetry.isNetworkOrIdempotentRequestError(error);
    // Retry on 429 (Too Many Requests) or network errors or idempotent request errors.
  },
});


// --- API Functions with Rate Limiting, Caching, and Error Handling ---
const fetchData = async (url: string, useCache = true) => {
  const cachedResponse = useCache ? getCache(url) : null;
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await enqueueRequest(() => api.get(url)); // Enqueue the request for rate limiting

    if (response.status >= 200 && response.status < 300) {
      if (useCache) {
        setCache(url, response.data);
      }
      return response.data;
    } else {
      // Handle non-2xx HTTP errors here if needed, or let axios-retry handle it if it's a retryable error.
      throw new Error(`API Error: ${response.status} - ${response.statusText} for URL: ${url}`);
    }
  } catch (error: any) {
    console.error('API request failed:', error);

    if (axios.isAxiosError(error)) {
      // Handle Axios specific errors (e.g., network errors, timeouts, specific status codes)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`); // Or customize error message
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request:', error.request);
        throw new Error('API Error: No response received from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up the request:', error.message);
        throw new Error(`API Error: Request setup error - ${error.message}`);
      }
    } else {
      throw new Error(`API Error: An unexpected error occurred - ${error.message}`);
    }
  }
};


// --- API Functions ---
export const getTopAnime = async (page = 1) => {
  return fetchData(`/top/anime?page=${page}`);
};

export const getSeasonNow = async (page = 1) => {
  return fetchData(`/seasons/now?page=${page}`);
};

export const getTopCharacters = async (page = 1) => {
  return fetchData(`/top/characters?page=${page}`);
};

export const searchAnime = async (query: string, page = 1) => {
  return fetchData(`/anime?q=${query}&page=${page}`);
};

export const searchManga = async (query: string, page = 1) => {
  return fetchData(`/manga?q=${query}&page=${page}`);
};

interface ScheduleParams {
  filter?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'unknown' | 'other';
  kids?: boolean;
  sfw?: boolean;
  unapproved?: boolean;
  page?: number;
  limit?: number;
}

export const getSchedules = async (params: ScheduleParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.filter) {
    queryParams.append('filter', params.filter);
  }
  
  if (params.kids !== undefined) {
    // The API expects string values "true" or "false"
    queryParams.append('kids', params.kids ? "true" : "false");
  }
  
  if (params.sfw !== undefined) {
    // The API expects string values "true" or "false"
    queryParams.append('sfw', params.sfw ? "true" : "false");
  }
  
  if (params.unapproved) {
    queryParams.append('unapproved', '');
  }
  
  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  console.log(`Fetching schedules with query: ${queryString}`); // Log API call for debugging
  return fetchData(`/schedules${queryString}`);
};

export const getAnimeRecommendations = async () => {
  return fetchData('/recommendations/anime');
};

export const getAnimeRecommendationsForDetails = async (id: number) => { 
  return fetchData(`/anime/${id}/recommendations`);
};

export const getAnimeDetails = async (id: number) => {
  return fetchData(`/anime/${id}/full`);
};

