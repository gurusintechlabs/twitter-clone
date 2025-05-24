// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Adjust if your backend runs elsewhere

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces for expected data structures (optional but good practice)
export interface User {
  _id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface Tweet {
  _id: string;
  content: string;
  user: User;
  createdAt: string;
  likes: string[]; // Array of user IDs
  retweets: string[]; // Array of user IDs
  comments: any[]; // Define further if needed
  media?: string[];
  hashtags?: string[];
  liked?: boolean; // Frontend state
  retweeted?: boolean; // Frontend state
  likeCount?: number;
  retweetCount?: number;
  commentCount?: number;
}

export interface Hashtag {
    _id: string;
    tag: string;
    count: number;
    createdAt: string;
    updatedAt: string;
}

interface PaginatedTweets {
  tweets: Tweet[];
  totalPages: number;
  currentPage: number;
  hashtag?: string;
}

interface LikeResponse {
    liked: boolean;
    likeCount: number;
}

interface RetweetResponse {
    retweeted: boolean;
    retweetCount: number;
}

interface CommentResponse {
    comment: any; // Define if needed
    commentCount: number;
}

// Tweet Endpoints
export const createTweet = async (data: { content: string; media?: string[] }): Promise<{ tweet: Tweet }> => {
  const response = await api.post('/tweets', data);
  return response.data;
};

export const getTweets = async (page = 1, limit = 10): Promise<PaginatedTweets> => {
  const response = await api.get('/tweets', { params: { page, limit } });
  return response.data;
};

export const getTweetsByUser = async (username: string, page = 1, limit = 10): Promise<PaginatedTweets> => {
  const response = await api.get(`/tweets/user/${username}`, { params: { page, limit } });
  return response.data;
};

export const getTweetById = async (id: string): Promise<{ tweet: Tweet }> => {
  const response = await api.get(`/tweets/${id}`);
  return response.data;
};

export const likeTweet = async (id: string): Promise<LikeResponse> => {
  const response = await api.post(`/tweets/${id}/like`);
  return response.data;
};

// Note: Unlike is often handled by the same 'like' endpoint toggling state, 
// but if you have a separate unlike endpoint, define it.
// For this plan, we assume the /like endpoint toggles.

export const retweetTweet = async (id: string): Promise<RetweetResponse> => {
  const response = await api.post(`/tweets/${id}/retweet`);
  return response.data;
};

// Similar to like, unretweet is often handled by the same endpoint.

export const addComment = async (id: string, content: string): Promise<CommentResponse> => {
  const response = await api.post(`/tweets/${id}/comment`, { content });
  return response.data;
};

export const deleteTweet = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/tweets/${id}`);
  return response.data;
};

// Hashtag Endpoints
export const getTrendingHashtags = async (): Promise<{ hashtags: Hashtag[] }> => {
  const response = await api.get('/tweets/hashtags/trending');
  return response.data;
};

export const getTweetsByHashtag = async (tag: string, page = 1, limit = 10): Promise<PaginatedTweets> => {
  const response = await api.get(`/tweets/hashtags/${tag}`, { params: { page, limit } });
  return response.data;
};

// Auth Endpoints (Example, add if not present or if they need to be in this service)
// export const login = async (credentials) => { ... };
// export const register = async (userData) => { ... };
// export const getCurrentUser = async () => { ... };

export default api;
