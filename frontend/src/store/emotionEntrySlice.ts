import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface EmotionData {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface EmotionEntry {
  id: string;
  userId: string;
  emotionId: string;
  content: string;
  moodLevel: number;
  tags: string | null;
  emotion: EmotionData;
  createdAt: string;
  updatedAt: string;
}

interface EmotionEntryState {
  entries: EmotionEntry[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmotionEntryState = {
  entries: [],
  currentPage: 0,
  pageSize: 20,
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchEmotionEntries = createAsyncThunk(
  'emotionEntry/fetchEntries',
  async (
    { skip = 0, take = 20 }: { skip?: number; take?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.getEmotionEntries(skip, take);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch entries');
    }
  }
);

export const createEmotionEntry = createAsyncThunk(
  'emotionEntry/createEntry',
  async (
    data: {
      emotionId: string;
      content: string;
      moodLevel: number;
      tags?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createEmotionEntry(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create entry');
    }
  }
);

export const updateEmotionEntry = createAsyncThunk(
  'emotionEntry/updateEntry',
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.updateEmotionEntry(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update entry');
    }
  }
);

export const deleteEmotionEntry = createAsyncThunk(
  'emotionEntry/deleteEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteEmotionEntry(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete entry');
    }
  }
);

const emotionEntrySlice = createSlice({
  name: 'emotionEntry',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmotionEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmotionEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries || action.payload;
        state.totalCount = action.payload.total || action.payload.length;
      })
      .addCase(fetchEmotionEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmotionEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      .addCase(updateEmotionEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(deleteEmotionEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentPage } = emotionEntrySlice.actions;
export default emotionEntrySlice.reducer;
