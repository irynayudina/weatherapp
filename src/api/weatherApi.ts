import type { CurrentWeatherResponse } from '../types/weather';
import { config } from '../config/env';

// Type alias for backward compatibility
export type WeatherData = CurrentWeatherResponse;

/**
 * Fetches current weather data for a given city using the OpenWeatherMap API
 * @param city - The city name to get weather data for
 * @returns Promise<WeatherData> - The weather data for the specified city
 * @throws Error if the API key is not configured or if the API request fails
 */
export async function getCurrentWeather(city: string): Promise<WeatherData> {
  if (!config.openWeather.apiKey) {
    throw new Error('OpenWeatherMap API key is not configured. Please set VITE_OPENWEATHER_API_KEY in your environment variables.');
  }

  const url = `${config.openWeather.apiBaseUrl}/weather?q=${encodeURIComponent(city)}&appid=${config.openWeather.apiKey}&units=metric`;
  // lat={lat}&lon={lon}&appid={
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`City "${city}" not found. Please check the city name and try again.`);
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      } else {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch weather data. Please check your internet connection and try again.');
  }
} 