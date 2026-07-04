import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to every request if available
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login on auth failure
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  async getMe() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // Calendar endpoints
  async getCalendarEvents(userId: string, limit: number = 10) {
    const { data } = await this.client.get('/calendar/events', {
      params: { userId, limit },
    });
    return data;
  }

  async syncCalendar(userId: string) {
    const { data } = await this.client.get('/calendar/sync', {
      params: { userId },
    });
    return data;
  }

  // Notes endpoints
  async createNote(noteData: { calendarEventId: string; userId: string; rawNotes: string }) {
    const { data } = await this.client.post('/notes', noteData);
    return data;
  }

  async getNotes(userId: string, limit: number = 20, skip: number = 0) {
    const { data } = await this.client.get('/notes', {
      params: { userId, limit, skip },
    });
    return data;
  }

  async getNote(noteId: string) {
    const { data } = await this.client.get(`/notes/${noteId}`);
    return data;
  }

  async deleteNote(noteId: string) {
    const { data } = await this.client.delete(`/notes/${noteId}`);
    return data;
  }

  // Summaries endpoints (THE STAR)
  async generateSummary(noteId: string, notes: string, userId?: string) {
    const { data } = await this.client.post('/summaries/generate', {
      noteId,
      notes,
      userId,
    });
    return data;
  }

  async getSummary(summaryId: string) {
    const { data } = await this.client.get(`/summaries/${summaryId}`);
    return data;
  }

  async getSummaries(userId: string, limit: number = 10, skip: number = 0, query?: string) {
    const { data } = await this.client.get('/summaries', {
      params: { userId, limit, skip, q: query },
    });
    return data;
  }

  async searchSummaries(userId: string, query: string) {
    return this.getSummaries(userId, 10, 0, query);
  }
}

export const apiClient = new ApiClient();
