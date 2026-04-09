import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  active: boolean;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
}

const initialState: HabitState = {
  habits: [],
  loading: false,
  error: null,
};

export const fetchHabits = createAsyncThunk(
  'habit/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getHabits();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch habits');
    }
  }
);

export const createHabit = createAsyncThunk(
  'habit/createHabit',
  async (
    data: {
      title: string;
      description?: string;
      frequency: 'daily' | 'weekly' | 'monthly';
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createHabit(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create habit');
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habit/updateHabit',
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.updateHabit(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update habit');
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habit/deleteHabit',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteHabit(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete habit');
    }
  }
);

const habitSlice = createSlice({
  name: 'habit',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload);
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter((h) => h.id !== action.payload);
      });
  },
});

export const { clearError } = habitSlice.actions;
export default habitSlice.reducer;
