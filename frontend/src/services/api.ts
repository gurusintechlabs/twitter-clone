import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username: string, password: string) => {
  return api.post('/auth/login', { username, password });
};

export const register = (name: string, username: string, email: string, password: string) => {
  return api.post('/auth/register', { name, username, email, password });
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

export const createTweet = (content: string, media: string[] = []) => {
  return api.post('/tweets', { content, media });
};

export const getFeedTweets = (page = 1, limit = 10) => {
  return api.get(`/tweets?page=${page}&limit=${limit}`);
};

export const getUserTweets = (username: string, page = 1, limit = 10) => {
  return api.get(`/tweets/user/${username}?page=${page}&limit=${limit}`);
};

export const likeTweet = (tweetId: string) => {
  return api.post(`/tweets/${tweetId}/like`);
};

export const retweetTweet = (tweetId: string) => {
  return api.post(`/tweets/${tweetId}/retweet`);
};

export const commentOnTweet = (tweetId: string, content: string) => {
  return api.post(`/tweets/${tweetId}/comment`, { content });
};

export const getTrendingHashtags = (limit = 10) => {
  return api.get(`/tweets/hashtags/trending?limit=${limit}`);
};

export const getTweetsByHashtag = (tag: string, page = 1, limit = 10) => {
  return api.get(`/tweets/hashtags/${tag}?page=${page}&limit=${limit}`);
};

export const getUserProfile = (username: string) => {
  return api.get(`/users/${username}`);
};

export const updateUserProfile = (profileData: any) => {
  return api.put('/users/profile', profileData);
};

export const followUser = (userId: string) => {
  return api.post(`/users/follow/${userId}`);
};

export const unfollowUser = (userId: string) => {
  return api.post(`/users/unfollow/${userId}`);
};

export default api;
