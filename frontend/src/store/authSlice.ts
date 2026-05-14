import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface Profile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  token: string | null;
  twoFactorRequired: boolean;
  twoFactorMethod: 'email' | 'sms' | null;
  twoFactorDestination: string | null;
  pendingUsername: string | null;
  twoFactorEnabled: boolean;
  registeredTwoFactorMethod: 'email' | 'sms' | null;
  registeredTwoFactorDestination: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  token: localStorage.getItem('authToken'),
  twoFactorRequired: false,
  twoFactorMethod: null,
  twoFactorDestination: null,
  pendingUsername: null,
  twoFactorEnabled: false,
  registeredTwoFactorMethod: null,
  registeredTwoFactorDestination: null,
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, username, password }: { email: string; username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.register(email, username, password);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.login(username, password);
      const { token, user, twoFactorRequired, method, destination } = response.data;
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
      return { token, user, twoFactorRequired, method, destination, username };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (
    { username, code }: { username: string; code: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.verifyTwoFactor(username, code);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Verification failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMe();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch current user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: { firstName?: string; lastName?: string; avatar?: string; bio?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.updateProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.token = null;
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.twoFactorEnabled = false;
        state.registeredTwoFactorMethod = null;
        state.registeredTwoFactorDestination = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.twoFactorRequired = false;
        state.twoFactorMethod = null;
        state.twoFactorDestination = null;
        state.pendingUsername = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.twoFactorRequired) {
          state.twoFactorRequired = true;
          state.twoFactorMethod = action.payload.method;
          state.twoFactorDestination = action.payload.destination;
          state.pendingUsername = action.payload.username || null;
          state.isAuthenticated = false;
          state.token = null;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.twoFactorRequired = false;
          state.twoFactorMethod = null;
          state.twoFactorDestination = null;
          state.pendingUsername = null;
          state.twoFactorEnabled = false;
          state.registeredTwoFactorMethod = null;
          state.registeredTwoFactorDestination = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.twoFactorRequired = false;
        state.twoFactorMethod = null;
        state.twoFactorDestination = null;
        state.pendingUsername = null;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.id,
          email: action.payload.email,
          username: action.payload.username,
          createdAt: action.payload.createdAt,
        };
        state.twoFactorEnabled = action.payload.twoFactorEnabled;
        state.registeredTwoFactorMethod = action.payload.twoFactorMethod || null;
        state.registeredTwoFactorDestination = action.payload.twoFactorMethod === 'sms'
          ? action.payload.twoFactorPhone
          : action.payload.twoFactorEmail;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('authToken');
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
