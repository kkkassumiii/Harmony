import axios, { AxiosInstance, AxiosError } from 'axios';
import { apiCache, deduplicateRequest } from '../utils/performance';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Cache configuration (TTL in milliseconds)
const CACHE_CONFIG = {
  EMOTIONS: 10 * 60 * 1000, // 10 minutes
  GOALS: 10 * 60 * 1000, // 10 minutes
  HABITS: 10 * 60 * 1000, // 10 minutes
  PROFILE: 30 * 60 * 1000, // 30 minutes
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method for cached GET requests
  private async getCached<T>(url: string, cacheKey: string, ttl: number) {
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return Promise.resolve({ data: cached });
    }

    // Deduplicate concurrent requests
    return deduplicateRequest(cacheKey, async () => {
      const response = await this.client.get<T>(url);
      // Cache the response
      apiCache.set(cacheKey, response.data, ttl);
      return response;
    });
  }

  // Invalidate cache
  invalidateCache(pattern?: string) {
    if (pattern) {
      // Simple pattern matching - in production, use more sophisticated approach
      apiCache.clear(pattern);
    } else {
      apiCache.clear();
    }
  }

  // Auth endpoints (no caching for auth)
  async register(email: string, username: string, password: string) {
    return this.client.post('/auth/register', { email, username, password });
  }

  async login(username: string, password: string) {
    return this.client.post('/auth/login', { username, password });
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  async verifyTwoFactor(username: string, code: string) {
    return this.client.post('/auth/2fa/verify', { username, code });
  }

  async setupTwoFactor(method: 'email' | 'sms', phone?: string) {
    return this.client.post('/auth/2fa/setup', { method, phone });
  }

  async confirmTwoFactor(code: string) {
    return this.client.post('/auth/2fa/confirm', { code });
  }

  async disableTwoFactor() {
    return this.client.post('/auth/2fa/disable');
  }

  // Profile endpoints (cached)
  async getProfile() {
    return this.getCached('/profile', 'profile', CACHE_CONFIG.PROFILE);
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  }) {
    const result = this.client.put('/profile', data);
    this.invalidateCache('profile');
    return result;
  }

  // Emotions endpoints (cached)
  async getEmotions() {
    return this.getCached('/emotions', 'emotions', CACHE_CONFIG.EMOTIONS);
  }

  async createEmotion(data: {
    name: string;
    color: string;
    icon: string;
  }) {
    const result = this.client.post('/emotions', data);
    this.invalidateCache('emotions');
    return result;
  }

  async updateEmotion(id: string, data: any) {
    const result = this.client.put(`/emotions/${id}`, data);
    this.invalidateCache('emotions');
    return result;
  }

  async deleteEmotion(id: string) {
    const result = this.client.delete(`/emotions/${id}`);
    this.invalidateCache('emotions');
    return result;
  }

  // Emotion Entries endpoints (no caching due to frequent updates)
  async getEmotionEntries(skip: number = 0, take: number = 20) {
    return this.client.get('/emotion-entries', {
      params: { skip, take },
    });
  }

  async createEmotionEntry(data: {
    emotionId: string;
    content: string;
    moodLevel: number;
    tags?: string;
  }) {
    const result = this.client.post('/emotion-entries', data);
    this.invalidateCache('analytics');
    return result;
  }

  async getEmotionEntry(id: string) {
    return this.client.get(`/emotion-entries/${id}`);
  }

  async updateEmotionEntry(id: string, data: any) {
    const result = this.client.put(`/emotion-entries/${id}`, data);
    this.invalidateCache('analytics');
    return result;
  }

  async deleteEmotionEntry(id: string) {
    const result = this.client.delete(`/emotion-entries/${id}`);
    this.invalidateCache('analytics');
    return result;
  }

  // Analytics endpoints (cached)
  async getAnalytics() {
    return this.getCached('/analytics', 'analytics', CACHE_CONFIG.ANALYTICS);
  }

  async getRecommendations() {
    return this.getCached('/analytics/recommendations', 'recommendations', CACHE_CONFIG.ANALYTICS);
  }

  // Goals endpoints (cached)
  async getGoals() {
    return this.getCached('/goals', 'goals', CACHE_CONFIG.GOALS);
  }

  async createGoal(data: {
    title: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate: string;
  }) {
    const result = this.client.post('/goals', data);
    this.invalidateCache('goals');
    this.invalidateCache('analytics');
    return result;
  }

  async getGoal(id: string) {
    return this.client.get(`/goals/${id}`);
  }

  async updateGoal(id: string, data: any) {
    const result = this.client.put(`/goals/${id}`, data);
    this.invalidateCache('goals');
    this.invalidateCache('analytics');
    return result;
  }

  async deleteGoal(id: string) {
    const result = this.client.delete(`/goals/${id}`);
    this.invalidateCache('goals');
    this.invalidateCache('analytics');
    return result;
  }

  // Habits endpoints (cached)
  async getHabits() {
    return this.getCached('/habits', 'habits', CACHE_CONFIG.HABITS);
  }

  async createHabit(data: {
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }) {
    const result = this.client.post('/habits', data);
    this.invalidateCache('habits');
    this.invalidateCache('analytics');
    return result;
  }

  async getHabit(id: string) {
    return this.client.get(`/habits/${id}`);
  }

  async updateHabit(id: string, data: any) {
    const result = this.client.put(`/habits/${id}`, data);
    this.invalidateCache('habits');
    this.invalidateCache('analytics');
    return result;
  }

  async deleteHabit(id: string) {
    const result = this.client.delete(`/habits/${id}`);
    this.invalidateCache('habits');
    this.invalidateCache('analytics');
    return result;
  }
}

const apiClient = new ApiClient();

export default apiClient;
