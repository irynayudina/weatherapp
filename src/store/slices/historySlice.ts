import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { config } from '../../config/env';

const STORAGE_KEY = config.storage.key;
const MAX_HISTORY_ITEMS = config.storage.maxHistoryItems;

interface HistoryState {
  cities: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: HistoryState = {
  cities: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to load history from localStorage
export const loadHistoryFromStorage = createAsyncThunk(
  'history/loadHistoryFromStorage',
  async () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (!savedHistory) {
        return [];
      }

      const parsedHistory = JSON.parse(savedHistory);
      return Array.isArray(parsedHistory) ? parsedHistory : [];
    } catch (error) {
      console.error('Failed to parse search history from localStorage:', error);
      throw new Error('Failed to load history from storage');
    }
  }
);

// Async thunk to save history to localStorage
export const saveHistoryToStorage = createAsyncThunk(
  'history/saveHistoryToStorage',
  async (cities: string[]) => {
    try {
      // Validate input
      if (!Array.isArray(cities)) {
        throw new Error('Invalid cities array provided');
      }

      // Filter out empty strings and trim whitespace
      const validCities = cities
        .filter(city => city && typeof city === 'string')
        .map(city => city.trim())
        .filter(city => city.length > 0);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCities));
      return validCities;
    } catch (error) {
      console.error('Failed to save search history to localStorage:', error);
      throw new Error('Failed to save history to storage');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addCity: (state, action: PayloadAction<string>) => {
      const trimmedCity = action.payload.trim();
      if (!trimmedCity) return;

      // Remove the city if it already exists (case-insensitive)
      const filteredCities = state.cities.filter(item => 
        item.toLowerCase() !== trimmedCity.toLowerCase()
      );
      
      // Add to the beginning and limit to MAX_HISTORY_ITEMS
      state.cities = [trimmedCity, ...filteredCities].slice(0, MAX_HISTORY_ITEMS);
      state.lastUpdated = Date.now();
    },
    removeCity: (state, action: PayloadAction<string>) => {
      const trimmedCity = action.payload.trim();
      if (!trimmedCity) return;

      state.cities = state.cities.filter(item => item !== trimmedCity);
      state.lastUpdated = Date.now();
    },
    clearHistory: (state) => {
      state.cities = [];
      state.lastUpdated = Date.now();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear search history from localStorage:', error);
      }
    },
    setHistory: (state, action: PayloadAction<string[]>) => {
      state.cities = action.payload;
      state.lastUpdated = Date.now();
    },
    insertCityAtIndex: (state, action: PayloadAction<{ city: string; index: number }>) => {
      const { city, index } = action.payload;
      const newCities = [...state.cities];
      
      if (index >= newCities.length) {
        newCities.push(city);
      } else {
        newCities.splice(index, 0, city);
      }
      
      // Limit to MAX_HISTORY_ITEMS
      state.cities = newCities.slice(0, MAX_HISTORY_ITEMS);
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHistoryFromStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHistoryFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(loadHistoryFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load history';
      })
      .addCase(saveHistoryToStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveHistoryToStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(saveHistoryToStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save history';
      });
  },
});

export const { addCity, removeCity, clearHistory, setHistory, insertCityAtIndex } = historySlice.actions;
export default historySlice.reducer;

// Selectors
export const selectHistory = (state: { history: HistoryState }) => state.history.cities;
export const selectHistoryLoading = (state: { history: HistoryState }) => state.history.loading;
export const selectHistoryError = (state: { history: HistoryState }) => state.history.error;
export const selectHistoryLastUpdated = (state: { history: HistoryState }) => state.history.lastUpdated; 