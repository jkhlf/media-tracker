import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
});

export const getTopAnime = async (page = 1) => {
  const { data } = await api.get(`/top/anime?page=${page}`);
  return data;
};

export const getSeasonNow = async (page = 1) => {
  const { data } = await api.get(`/seasons/now?page=${page}`);
  return data;
};

export const getTopCharacters = async (page = 1) => {
  const { data } = await api.get(`/top/characters?page=${page}`);
  return data;
};

export const searchAnime = async (query: string, page = 1) => {
  const { data } = await api.get(`/anime?q=${query}&page=${page}`);
  return data;
};

export const searchManga = async (query: string, page = 1) => {
  const { data } = await api.get(`/manga?q=${query}&page=${page}`);
  return data;
};

export const getSchedules = async () => {
  const { data } = await api.get('/schedules');
  return data;
};

export const getAnimeRecommendations = async () => {
  const { data } = await api.get('/recommendations/anime');
  return data;
};

export const getAnimeDetails = async (id: number) => {
  const { data } = await api.get(`/anime/${id}/full`);
  return data;
};