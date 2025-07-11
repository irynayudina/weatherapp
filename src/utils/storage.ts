import { config } from '../config/env';

const STORAGE_KEY = config.storage.key;
const MAX_HISTORY_ITEMS = config.storage.maxHistoryItems;

/**
 * Retrieves the search history from localStorage
 * @returns Array of city names, or empty array if no history exists
 */
export function getHistory(): string[] {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (!savedHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch (error) {
    console.error('Failed to parse search history from localStorage:', error);
    return [];
  }
}

/**
 * Adds a city to the search history
 * @param city - The city name to add
 * @returns The updated history array
 */
export function addCity(city: string): string[] {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    return getHistory();
  }

  const currentHistory = getHistory();
  
  // Remove the city if it already exists (case-insensitive)
  const filteredHistory = currentHistory.filter(item => 
    item.toLowerCase() !== trimmedCity.toLowerCase()
  );
  
  // Add to the beginning and limit to MAX_HISTORY_ITEMS
  const newHistory = [trimmedCity, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
  
  // Save to localStorage
  saveHistory(newHistory);
  
  return newHistory;
}

/**
 * Removes a city from the search history
 * @param city - The city name to remove
 * @returns The updated history array
 */
export function removeCity(city: string): string[] {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    return getHistory();
  }

  const currentHistory = getHistory();
  const newHistory = currentHistory.filter(item => item !== trimmedCity);
  
  // Save to localStorage
  saveHistory(newHistory);
  
  return newHistory;
}

/**
 * Saves the search history to localStorage
 * @param cities - Array of city names to save
 */
export function saveHistory(cities: string[]): void {
  try {
    // Validate input
    if (!Array.isArray(cities)) {
      console.error('Invalid cities array provided to saveHistory');
      return;
    }

    // Filter out empty strings and trim whitespace
    const validCities = cities
      .filter(city => city && typeof city === 'string')
      .map(city => city.trim())
      .filter(city => city.length > 0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validCities));
  } catch (error) {
    console.error('Failed to save search history to localStorage:', error);
  }
}

/**
 * Clears all search history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear search history from localStorage:', error);
  }
}

/**
 * Gets the maximum number of history items allowed
 * @returns The maximum number of history items
 */
export function getMaxHistoryItems(): number {
  return MAX_HISTORY_ITEMS;
}

/**
 * Gets the storage key used for localStorage
 * @returns The storage key string
 */
export function getStorageKey(): string {
  return STORAGE_KEY;
} 