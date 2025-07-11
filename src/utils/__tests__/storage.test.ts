import {
  getHistory,
  addCity,
  removeCity,
  saveHistory,
  clearHistory,
  getMaxHistoryItems,
  getStorageKey
} from '../storage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getHistory', () => {
    it('returns empty array when no history exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getHistory();
      
      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('weather_search_history');
    });

    it('returns parsed history when it exists', () => {
      const mockHistory = ['London', 'Paris', 'Berlin'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const result = getHistory();
      
      expect(result).toEqual(mockHistory);
    });

    it('returns empty array when stored data is not an array', () => {
      localStorageMock.getItem.mockReturnValue('{"invalid": "data"}');
      
      const result = getHistory();
      
      expect(result).toEqual([]);
    });

    it('returns empty array when localStorage.getItem throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = getHistory();
      
      expect(result).toEqual([]);
    });

    it('returns empty array when JSON.parse throws error', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = getHistory();
      
      expect(result).toEqual([]);
    });
  });

  describe('addCity', () => {
    it('adds city to beginning of history', () => {
      const existingHistory = ['Paris', 'Berlin'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('London');
      
      expect(result).toEqual(['London', 'Paris', 'Berlin']);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_search_history',
        JSON.stringify(['London', 'Paris', 'Berlin'])
      );
    });

    it('moves existing city to beginning if already in history', () => {
      const existingHistory = ['Paris', 'London', 'Berlin'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('London');
      
      expect(result).toEqual(['London', 'Paris', 'Berlin']);
    });

    it('handles case-insensitive city names', () => {
      const existingHistory = ['Paris', 'london', 'Berlin'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('London');
      
      expect(result).toEqual(['London', 'Paris', 'Berlin']);
    });

    it('limits history to maximum items', () => {
      const existingHistory = Array.from({ length: 10 }, (_, i) => `City${i}`);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('NewCity');
      
      expect(result).toHaveLength(10);
      expect(result[0]).toBe('NewCity');
      expect(result).not.toContain('City9');
    });

    it('trims whitespace from city name', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const result = addCity('  London  ');
      
      expect(result).toEqual(['London']);
    });

    it('does not add empty city names', () => {
      const existingHistory = ['Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('');
      
      expect(result).toEqual(existingHistory);
    });

    it('does not add city names with only whitespace', () => {
      const existingHistory = ['Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = addCity('   ');
      
      expect(result).toEqual(existingHistory);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = addCity('London');
      
      expect(result).toEqual([]);
    });
  });

  describe('removeCity', () => {
    it('removes city from history', () => {
      const existingHistory = ['London', 'Paris', 'Berlin'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = removeCity('Paris');
      
      expect(result).toEqual(['London', 'Berlin']);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_search_history',
        JSON.stringify(['London', 'Berlin'])
      );
    });

    it('returns unchanged history if city not found', () => {
      const existingHistory = ['London', 'Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = removeCity('Berlin');
      
      expect(result).toEqual(existingHistory);
    });

    it('trims whitespace from city name', () => {
      const existingHistory = ['London', 'Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = removeCity('  London  ');
      
      expect(result).toEqual(['Paris']);
    });

    it('does not remove anything for empty city name', () => {
      const existingHistory = ['London', 'Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      const result = removeCity('');
      
      expect(result).toEqual(existingHistory);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = removeCity('London');
      
      expect(result).toEqual([]);
    });
  });

  describe('saveHistory', () => {
    it('saves valid history to localStorage', () => {
      const history = ['London', 'Paris', 'Berlin'];
      
      saveHistory(history);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_search_history',
        JSON.stringify(history)
      );
    });

    it('filters out invalid entries', () => {
      const invalidHistory = ['London', '', 'Paris', null, 'Berlin', undefined, '   '];
      
      saveHistory(invalidHistory as any);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_search_history',
        JSON.stringify(['London', 'Paris', 'Berlin'])
      );
    });

    it('trims whitespace from city names', () => {
      const history = ['  London  ', '  Paris  ', 'Berlin'];
      
      saveHistory(history);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_search_history',
        JSON.stringify(['London', 'Paris', 'Berlin'])
      );
    });

    it('handles non-array input gracefully', () => {
      saveHistory(null as any);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => {
        saveHistory(['London']);
      }).not.toThrow();
    });
  });

  describe('clearHistory', () => {
    it('removes history from localStorage', () => {
      clearHistory();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('weather_search_history');
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => {
        clearHistory();
      }).not.toThrow();
    });
  });

  describe('getMaxHistoryItems', () => {
    it('returns the maximum number of history items', () => {
      const result = getMaxHistoryItems();
      
      expect(result).toBe(10);
    });
  });

  describe('getStorageKey', () => {
    it('returns the storage key', () => {
      const result = getStorageKey();
      
      expect(result).toBe('weather_search_history');
    });
  });

  describe('integration tests', () => {
    it('maintains history order correctly', () => {
      // Start with empty history
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      // Add cities in order
      let result = addCity('London');
      expect(result).toEqual(['London']);
      
      result = addCity('Paris');
      expect(result).toEqual(['Paris', 'London']);
      
      result = addCity('Berlin');
      expect(result).toEqual(['Berlin', 'Paris', 'London']);
      
      // Add London again (should move to front)
      result = addCity('London');
      expect(result).toEqual(['London', 'Berlin', 'Paris']);
    });

    it('handles rapid additions and removals', () => {
      const existingHistory = ['London', 'Paris'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      // Remove Paris
      let result = removeCity('Paris');
      expect(result).toEqual(['London']);
      
      // Add Berlin
      result = addCity('Berlin');
      expect(result).toEqual(['Berlin', 'London']);
      
      // Remove London
      result = removeCity('London');
      expect(result).toEqual(['Berlin']);
    });

    it('enforces maximum history limit', () => {
      // Start with 10 cities
      const existingHistory = Array.from({ length: 10 }, (_, i) => `City${i}`);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));
      
      // Add 11th city
      const result = addCity('NewCity');
      
      expect(result).toHaveLength(10);
      expect(result[0]).toBe('NewCity');
      expect(result).not.toContain('City9');
    });
  });
}); 