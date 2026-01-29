import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/mobile';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getUser(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async setUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
};

// Add request interceptor for auth
api.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user ID header for development
    const user = await tokenManager.getUser();
    if (user) {
      config.headers['X-User-Id'] = user.id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = await tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth`,
            { refreshToken },
            { headers: { 'X-Auth-Action': 'refresh' } }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          await tokenManager.setAccessToken(accessToken);
          await tokenManager.setRefreshToken(newRefreshToken);

          // Retry original request
          const originalRequest = error.config;
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh failed, clear tokens
          await tokenManager.clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: { url: string } | null;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: { url: string } | null;
  pricing: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  stats: {
    enrollments: number;
    avgRating: number;
    totalDuration: number;
    lessonCount: number;
  };
  instructor?: {
    id: string;
    name?: string;
  } | null;
  level?: string;
  category?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: string;
  duration?: number;
  content?: string;
  video?: {
    url: string | null;
    duration?: number | null;
  } | null;
}

export interface Progress {
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
}

// API functions
export const authApi = {
  async login(email: string, password: string, deviceInfo?: {
    deviceId?: string;
    deviceName?: string;
    platform?: 'ios' | 'android';
    pushToken?: string;
  }) {
    const response = await api.post('/auth', {
      email,
      password,
      ...deviceInfo,
    });

    const { user, tokens } = response.data;
    await tokenManager.setAccessToken(tokens.accessToken);
    await tokenManager.setRefreshToken(tokens.refreshToken);
    await tokenManager.setUser(user);

    return { user, tokens };
  },

  async logout() {
    try {
      await api.delete('/auth');
    } finally {
      await tokenManager.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return tokenManager.getUser();
  },
};

export const coursesApi = {
  async list(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    enrolled?: boolean;
  }) {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/courses/${id}`);
    return response.data.course;
  },
};

export const lessonsApi = {
  async getById(id: string) {
    const response = await api.get(`/lessons/${id}`);
    return response.data.lesson;
  },
};

export const progressApi = {
  async get(courseId?: string) {
    const response = await api.get('/progress', {
      params: courseId ? { courseId } : undefined,
    });
    return response.data;
  },

  async update(data: {
    lessonId: string;
    courseId: string;
    watchTime?: number;
    lastPosition?: number;
    completed?: boolean;
  }) {
    const response = await api.post('/progress', data);
    return response.data;
  },
};

export default api;
