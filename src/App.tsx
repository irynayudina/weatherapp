import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { SearchBar, WeatherCard, HistoryList } from './components';
import { getCurrentWeather } from './api/weatherApi';
import { config } from './config/env';
import { shouldEnableDevtools } from './config/env';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { addCity } from './store/slices/historySlice';
import './App.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: config.query.retryCount,
      staleTime: config.query.staleTime,
    },
  },
});

function WeatherApp() {
  const [currentCity, setCurrentCity] = useState<string>('');
  const dispatch = useAppDispatch();

  const {
    data: weatherData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['weather', currentCity],
    queryFn: () => getCurrentWeather(currentCity),
    enabled: !!currentCity,
  });

  const handleSearch = (city: string) => {
    setCurrentCity(city);
    // Add city to search history using Redux action
    dispatch(addCity(city));
  };

  const handleCitySelect = (city: string) => {
    setCurrentCity(city);
  };

  return (
    <div className="weather-app">
      <header className="app-header">
        <h1>{config.app.name}</h1>
        <p>{config.app.description}</p>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="content-section">
          <div className="weather-section">
            {isLoading && currentCity && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading weather data for {currentCity}...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p className="error-message">
                  {error instanceof Error ? error.message : 'An error occurred while fetching weather data'}
                </p>
                <button 
                  className="retry-button"
                  onClick={() => refetch()}
                >
                  Try Again
                </button>
              </div>
            )}

            {weatherData && !isLoading && (
              <WeatherCard weatherData={weatherData} />
            )}

            {!currentCity && !isLoading && !error && (
              <div className="welcome-state">
                <h2>Welcome to Weather App</h2>
                <p>Search for a city to get current weather information</p>
              </div>
            )}
          </div>

          <div className="history-section">
            <HistoryList 
              onCitySelect={handleCitySelect} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WeatherApp />
        {shouldEnableDevtools() && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
