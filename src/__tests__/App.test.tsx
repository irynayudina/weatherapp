import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import { getCurrentWeather } from '../api/weatherApi';
import { useAppSelector } from '../store/hooks';
import '@testing-library/jest-dom';

// Mock the config module to avoid import.meta issues
jest.mock('../config/env', () => ({
  config: {
    openWeather: {
      apiKey: 'test-api-key',
      apiBaseUrl: 'https://api.openweathermap.org/data/2.5',
    },
    app: {
      name: 'Weather App',
      description: 'Get current weather information for any city',
      version: '1.0.0',
    },
    query: {
      retryCount: 3,
      staleTime: 5 * 60 * 1000,
    },
    storage: {
      key: 'weather_search_history',
      maxHistoryItems: 10,
    },
    dev: {
      mode: true,
      enableDevtools: false,
    },
  },
  isDevelopment: () => true,
  shouldEnableDevtools: () => false,
}));

// Mock the weather API
jest.mock('../api/weatherApi', () => ({
  getCurrentWeather: jest.fn(),
}));

jest.mock('../store/hooks', () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: jest.fn(),
}));

const mockWeatherData = {
  name: 'Kyiv',
  main: {
    temp: 21.7,
    temp_min: 18.5,
    temp_max: 24.3,
    humidity: 63,
    pressure: 1012,
  },
  weather: [
    {
      description: 'clear sky',
      icon: '01d',
    },
  ],
  wind: {
    speed: 3.2,
  },
};

describe('Weather App - User Story 1', () => {
  beforeEach(() => {
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);
    (useAppSelector as jest.Mock).mockReturnValue([]);
  });

  it('displays weather information for a submitted city', async () => {
    render(<App />);

    // Find the input and button
    const input = screen.getByLabelText(/city name/i);
    const button = screen.getByRole('button', { name: /search/i });

    // Simulate user typing and submitting
    fireEvent.change(input, { target: { value: 'Kyiv' } });
    fireEvent.click(button);

    // Wait for weather info to show
    await waitFor(() => {
      expect(screen.getByText(/Kyiv/i)).toBeInTheDocument();
    });

    // Check weather data
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText(/22°/)).toBeInTheDocument();         // Current temp
    expect(screen.getByText(/Min: 19°/)).toBeInTheDocument();    // Rounded 18.5
    expect(screen.getByText(/Max: 24°/)).toBeInTheDocument();    // Rounded 24.3
    expect(screen.getByText(/3.2 m\/s/)).toBeInTheDocument();    // Wind speed
  });
});

describe('Weather App - User Story 2', () => {
  beforeEach(() => {
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);
  });

  it('displays search history of previously searched cities', () => {
    // Mock history with some cities
    const mockHistory = ['London', 'Paris', 'Tokyo'];
    (useAppSelector as jest.Mock).mockReturnValue(mockHistory);

    render(<App />);

    // Check that history section is displayed
    expect(screen.getByText('Search History')).toBeInTheDocument();

    // Check that all cities in history are displayed
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Check that clear all button is present
    expect(screen.getByRole('button', { name: /clear all search history/i })).toBeInTheDocument();
  });

  it('shows empty state when no search history exists', () => {
    // Mock empty history
    (useAppSelector as jest.Mock).mockReturnValue([]);

    render(<App />);

    // Check that history section is displayed
    expect(screen.getByText('Search History')).toBeInTheDocument();

    // Check that empty state message is shown
    expect(screen.getByText(/no search history yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start searching for cities/i)).toBeInTheDocument();
  });

  it('allows clicking on history items to search for that city', async () => {
    // Mock history with cities
    const mockHistory = ['London', 'Paris'];
    (useAppSelector as jest.Mock).mockReturnValue(mockHistory);

    render(<App />);

    // Find and click on a history item
    const londonButton = screen.getByRole('button', { name: /search weather for london/i });
    fireEvent.click(londonButton);

    // Wait for weather info to show (the search should be triggered automatically)
    await waitFor(() => {
      expect(screen.getByText(/London/i)).toBeInTheDocument();
    });

    // Verify that the weather data is displayed for London
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText(/22°/)).toBeInTheDocument();
  });
});
