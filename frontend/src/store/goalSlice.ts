import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  'goal/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getGoals();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goal/createGoal',
  async (
    data: {
      title: string;
      description?: string;
      category?: string;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createGoal(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goal/updateGoal',
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.updateGoal(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goal/deleteGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteGoal(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete goal');
    }
  }
);

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload);
      });
  },
});

export const { clearError } = goalSlice.actions;
export default goalSlice.reducer;
