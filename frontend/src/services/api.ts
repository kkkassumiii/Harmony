import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
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

  // Auth endpoints
  async register(email: string, username: string, password: string) {
    return this.client.post('/auth/register', { email, username, password });
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  // Profile endpoints
  async getProfile() {
    return this.client.get('/profile');
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  }) {
    return this.client.put('/profile', data);
  }

  // Emotions endpoints
  async getEmotions() {
    return this.client.get('/emotions');
  }

  async createEmotion(data: {
    name: string;
    color: string;
    icon: string;
  }) {
    return this.client.post('/emotions', data);
  }

  async updateEmotion(id: string, data: any) {
    return this.client.put(`/emotions/${id}`, data);
  }

  async deleteEmotion(id: string) {
    return this.client.delete(`/emotions/${id}`);
  }

  // Emotion Entries endpoints
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
    return this.client.post('/emotion-entries', data);
  }

  async getEmotionEntry(id: string) {
    return this.client.get(`/emotion-entries/${id}`);
  }

  async updateEmotionEntry(id: string, data: any) {
    return this.client.put(`/emotion-entries/${id}`, data);
  }

  async deleteEmotionEntry(id: string) {
    return this.client.delete(`/emotion-entries/${id}`);
  }

  // Goals endpoints
  async getGoals() {
    return this.client.get('/goals');
  }

  async createGoal(data: {
    title: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate: string;
  }) {
    return this.client.post('/goals', data);
  }

  async getGoal(id: string) {
    return this.client.get(`/goals/${id}`);
  }

  async updateGoal(id: string, data: any) {
    return this.client.put(`/goals/${id}`, data);
  }

  async deleteGoal(id: string) {
    return this.client.delete(`/goals/${id}`);
  }

  // Habits endpoints
  async getHabits() {
    return this.client.get('/habits');
  }

  async createHabit(data: {
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }) {
    return this.client.post('/habits', data);
  }

  async getHabit(id: string) {
    return this.client.get(`/habits/${id}`);
  }

  async updateHabit(id: string, data: any) {
    return this.client.put(`/habits/${id}`, data);
  }

  async deleteHabit(id: string) {
    return this.client.delete(`/habits/${id}`);
  }
}

export default new ApiClient();
