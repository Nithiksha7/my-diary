/**
 * Centralized API Client Service for My Diary
 * Communicates with the Express backend using HttpOnly cookie authentication
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_API_URL.replace(/\/$/, '');

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  [key: string]: any;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures HttpOnly auth cookies are always sent
  };

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (netErr) {
    console.error(`[API] Network error fetching ${endpoint}:`, netErr);
    const error: any = new Error('Unable to connect to My Diary right now. Please try again.');
    error.status = 0;
    throw error;
  }

  const data = await res.json().catch(() => ({
    success: false,
    message: res.status >= 500
      ? 'Unable to connect to My Diary right now. Please try again.'
      : `Request failed (${res.status})`,
  }));

  if (!res.ok) {
    const errorMsg = data.message && !data.message.includes('valid JSON')
      ? data.message
      : 'Unable to connect to My Diary right now. Please try again.';
    const error: any = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Authentication APIs
  auth: {
    register: (data: { name: string; email: string; password: string; settings?: any }) =>
      request<{ success: boolean; user: any; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ success: boolean; user: any; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMe: () =>
      request<{ success: boolean; user: any }>('/auth/me', {
        method: 'GET',
      }),

    logout: () =>
      request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      }),

    updateSettings: (settings: any) =>
      request<{ success: boolean; user: any }>('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),

    migrateLocalData: (payload: { entries: any; settings?: any }) =>
      request<{ success: boolean; message: string; migratedCount: number }>('/auth/migrate-local-data', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Diary APIs
  diary: {
    getEntry: (date: string) =>
      request<{ success: boolean; entry: any }>(`/diary/${date}`, {
        method: 'GET',
      }),

    saveEntry: (date: string, entryData: any) =>
      request<{ success: boolean; entry: any; message?: string }>(`/diary/${date}`, {
        method: 'PUT',
        body: JSON.stringify(entryData),
      }),

    deleteEntry: (date: string) =>
      request<{ success: boolean; message: string; date: string }>(`/diary/${date}`, {
        method: 'DELETE',
      }),

    getMonthEntries: (year: string | number, month: string | number) =>
      request<{ success: boolean; year: string; month: string; entries: Record<string, any> }>(
        `/diary/month/${year}/${month}`,
        { method: 'GET' }
      ),

    getYearEntries: (year: string | number) =>
      request<{ success: boolean; year: string; entries: any[] }>(`/diary/year/${year}`, {
        method: 'GET',
      }),

    getOnThisDay: (month: string | number, day: string | number) =>
      request<{ success: boolean; entries: any[] }>(`/diary/on-this-day/${month}/${day}`, {
        method: 'GET',
      }),
  },

  // Upload APIs (Multipart/form-data)
  upload: {
    uploadPhoto: async (file: File): Promise<{ success: boolean; id: string; url: string; storageKey: string; file?: any }> => {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({
        success: false,
        message: 'Invalid response from upload service',
      }));

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    },
    image: async (file: File): Promise<{ success: boolean; id: string; url: string; storageKey: string; file?: any }> => {
      return api.upload.uploadPhoto(file);
    },
  },

  // Memories APIs
  memories: {
    getMemories: () =>
      request<{ success: boolean; memories: any[] }>('/memories', {
        method: 'GET',
      }),

    getAll: () =>
      request<{ success: boolean; memories: any[] }>('/memories', {
        method: 'GET',
      }),

    createMemory: (data: { photoUrl: string; storageKey?: string; caption: string; date: string; location?: string; notes?: string; song?: string }) =>
      request<{ success: boolean; memory: any; message?: string }>('/memories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    create: (data: { photoUrl: string; storageKey?: string; caption: string; date: string; location?: string; notes?: string; song?: string }) =>
      api.memories.createMemory(data),

    updateMemory: (id: string, data: any) =>
      request<{ success: boolean; memory: any; message?: string }>(`/memories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      api.memories.updateMemory(id, data),

    deleteMemory: (id: string) =>
      request<{ success: boolean; message: string; id: string }>(`/memories/${id}`, {
        method: 'DELETE',
      }),

    delete: (id: string) =>
      api.memories.deleteMemory(id),
  },

  // Someday Dreams APIs
  someday: {
    getSomedayDreams: () =>
      request<{ success: boolean; dreams: any[] }>('/someday', {
        method: 'GET',
      }),

    getAll: () =>
      request<{ success: boolean; dreams: any[] }>('/someday', {
        method: 'GET',
      }),

    createSomedayDream: (data: { title: string; description?: string; category: string; imageUrl?: string; storageKey?: string; targetDate?: string }) =>
      request<{ success: boolean; dream: any; message?: string }>('/someday', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    create: (data: { title: string; description?: string; category: string; imageUrl?: string; storageKey?: string; targetDate?: string }) =>
      api.someday.createSomedayDream(data),

    toggleSomedayDream: (id: string, notes?: string) =>
      request<{ success: boolean; dream: any; message?: string }>(`/someday/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      }),

    toggle: (id: string, notes?: string) =>
      api.someday.toggleSomedayDream(id, notes),

    updateSomedayDream: (id: string, data: any) =>
      request<{ success: boolean; dream: any; message?: string }>(`/someday/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      api.someday.updateSomedayDream(id, data),

    deleteSomedayDream: (id: string) =>
      request<{ success: boolean; message: string; id: string }>(`/someday/${id}`, {
        method: 'DELETE',
      }),

    delete: (id: string) =>
      api.someday.deleteSomedayDream(id),
  },

  // Future Me Letters APIs
  futureMe: {
    getLetters: () =>
      request<{ success: boolean; letters: any[] }>('/future-me', {
        method: 'GET',
      }),

    getLetterById: (id: string) =>
      request<{ success: boolean; letter: any }>(`/future-me/${id}`, {
        method: 'GET',
      }),

    createLetter: (data: {
      title: string;
      content: string;
      unlockAt?: string;
      unlockDate?: string;
      timezone?: string;
      sealColor?: string;
      recipientNote?: string;
    }) =>
      request<{ success: boolean; letter: any; message?: string }>('/future-me', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    openLetter: (id: string) =>
      request<{ success: boolean; letter: any; message?: string }>(`/future-me/${id}/open`, {
        method: 'PATCH',
      }),

    deleteLetter: (id: string) =>
      request<{ success: boolean; message: string; id: string }>(`/future-me/${id}`, {
        method: 'DELETE',
      }),
  },

  // Scheduled & Recipient Letters APIs
  letters: {
    getLetters: () =>
      request<{ success: boolean; letters: any[] }>('/letters', {
        method: 'GET',
      }),

    getLetterById: (id: string) =>
      request<{ success: boolean; letter: any }>(`/letters/${id}`, {
        method: 'GET',
      }),

    createLetter: (data: any) =>
      request<{ success: boolean; letter: any; message?: string }>('/letters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteLetter: (id: string) =>
      request<{ success: boolean; message: string; id: string }>(`/letters/${id}`, {
        method: 'DELETE',
      }),

    retryDelivery: (id: string) =>
      request<{ success: boolean; letter: any; message?: string }>(`/letters/${id}/retry`, {
        method: 'POST',
      }),

    updateRecipient: (id: string, contact: string, name?: string) =>
      request<{ success: boolean; letter: any; message?: string }>(`/letters/${id}/recipient`, {
        method: 'PATCH',
        body: JSON.stringify({ recipientContact: contact, recipientName: name }),
      }),

    getPublicLetter: (token: string) =>
      request<{ success: boolean; letter: any }>(`/letters/public/${token}`, {
        method: 'GET',
      }),

    openPublicLetter: (token: string) =>
      request<{ success: boolean; letter: any; message?: string }>(`/letters/public/${token}/open`, {
        method: 'POST',
      }),

    fastForwardPublicLetter: (token: string) =>
      request<{ success: boolean; letter: any }>(`/letters/public/${token}/fast-forward`, {
        method: 'POST',
      }),
  },
};
