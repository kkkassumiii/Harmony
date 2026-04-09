import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import emotionReducer from './emotionSlice';
import emotionEntryReducer from './emotionEntrySlice';
import goalReducer from './goalSlice';
import habitReducer from './habitSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emotion: emotionReducer,
    emotionEntry: emotionEntryReducer,
    goal: goalReducer,
    habit: habitReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
