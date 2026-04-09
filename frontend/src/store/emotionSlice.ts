import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface Emotion {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

interface EmotionState {
  emotions: Emotion[];
  loading: boolean;
  error: string | null;
}

const initialState: EmotionState = {
  emotions: [],
  loading: false,
  error: null,
};

export const fetchEmotions = createAsyncThunk(
  'emotion/fetchEmotions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getEmotions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch emotions');
    }
  }
);

export const createEmotion = createAsyncThunk(
  'emotion/createEmotion',
  async (
    data: { name: string; color: string; icon: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createEmotion(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create emotion');
    }
  }
);

export const updateEmotion = createAsyncThunk(
  'emotion/updateEmotion',
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.updateEmotion(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update emotion');
    }
  }
);

export const deleteEmotion = createAsyncThunk(
  'emotion/deleteEmotion',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteEmotion(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete emotion');
    }
  }
);

const emotionSlice = createSlice({
  name: 'emotion',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmotions.fulfilled, (state, action) => {
        state.loading = false;
        state.emotions = action.payload;
      })
      .addCase(fetchEmotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmotion.fulfilled, (state, action) => {
        state.emotions.push(action.payload);
      })
      .addCase(updateEmotion.fulfilled, (state, action) => {
        const index = state.emotions.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.emotions[index] = action.payload;
        }
      })
      .addCase(deleteEmotion.fulfilled, (state, action) => {
        state.emotions = state.emotions.filter((e) => e.id !== action.payload);
      });
  },
});

export const { clearError } = emotionSlice.actions;
export default emotionSlice.reducer;
