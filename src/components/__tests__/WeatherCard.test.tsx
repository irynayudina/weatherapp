import { render, screen } from '@testing-library/react';
import WeatherCard from '../WeatherCard/WeatherCard';
import type { CurrentWeatherResponse } from '../../types/weather';
import '@testing-library/jest-dom';


// Mock the config module to avoid import.meta issues
jest.mock('../../config/env', () => ({
  config: {
    app: {
      name: 'Weather App',
      description: 'Get current weather information for any city',
    },
    api: {
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      apiKey: 'test-api-key',
    },
    query: {
      retryCount: 3,
      staleTime: 5 * 60 * 1000,
    },
    dev: {
      mode: false,
      enableDevtools: false,
    },
  },
  isDevelopment: () => false,
  shouldEnableDevtools: () => false,
}));

const mockWeatherData: CurrentWeatherResponse = {
  coord: { lon: 30.5167, lat: 50.4333 },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  base: 'stations',
  main: {
    temp: 21.7,
    feels_like: 20.2,
    temp_min: 18.5,
    temp_max: 24.3,
    pressure: 1012,
    humidity: 63,
  },
  visibility: 10000,
  wind: {
    speed: 3.2,
    deg: 280,
  },
  clouds: {
    all: 0,
  },
  dt: 1640995200,
  sys: {
    type: 2,
    id: 2003742,
    country: 'UA',
    sunrise: 1640952000,
    sunset: 1640984400,
  },
  timezone: 7200,
  id: 703448,
  name: 'Kyiv',
  cod: 200,
};

describe('WeatherCard', () => {
  it('renders weather information correctly', () => {
    render(<WeatherCard weatherData={mockWeatherData} />);

    // Check city name
    expect(screen.getByText('Kyiv')).toBeInTheDocument();

    // Check temperature (rounded to 22°)
    expect(screen.getByText('22°')).toBeInTheDocument();

    // Check temperature range
    expect(screen.getByText('Min: 19°')).toBeInTheDocument(); // 18.5 rounded to 19
    expect(screen.getByText('Max: 24°')).toBeInTheDocument(); // 24.3 rounded to 24

    // Check weather description
    expect(screen.getByText('clear sky')).toBeInTheDocument();

    // Check weather details
    expect(screen.getByText('Wind Speed:')).toBeInTheDocument();
    expect(screen.getByText('3.2 m/s')).toBeInTheDocument();
    expect(screen.getByText('Humidity:')).toBeInTheDocument();
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('Pressure:')).toBeInTheDocument();
    expect(screen.getByText('1012 hPa')).toBeInTheDocument();
  });

  it('renders weather icon with correct attributes', () => {
    render(<WeatherCard weatherData={mockWeatherData} />);

    const weatherIcon = screen.getByAltText('clear sky');
    expect(weatherIcon).toBeInTheDocument();
    expect(weatherIcon).toHaveAttribute('src', 'https://openweathermap.org/img/wn/01d@2x.png');
    expect(weatherIcon).toHaveAttribute('width', '50');
    expect(weatherIcon).toHaveAttribute('height', '50');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-weather-card';
    render(<WeatherCard weatherData={mockWeatherData} className={customClass} />);

    const weatherCard = screen.getByText('Kyiv').closest('.weather-card');
    expect(weatherCard).toHaveClass('weather-card', customClass);
  });

  it('handles decimal temperatures correctly', () => {
    const weatherDataWithDecimals = {
      ...mockWeatherData,
      main: {
        ...mockWeatherData.main,
        temp: 21.4, // Should round to 21
        temp_min: 18.9, // Should round to 19
        temp_max: 24.6, // Should round to 25
      },
    };

    render(<WeatherCard weatherData={weatherDataWithDecimals} />);

    expect(screen.getByText('21°')).toBeInTheDocument();
    expect(screen.getByText('Min: 19°')).toBeInTheDocument();
    expect(screen.getByText('Max: 25°')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const weatherDataWithZeros = {
      ...mockWeatherData,
      main: {
        ...mockWeatherData.main,
        temp: 0,
        temp_min: 0,
        temp_max: 0,
        humidity: 0,
        pressure: 0,
      },
      wind: {
        ...mockWeatherData.wind,
        speed: 0,
      },
    };

    render(<WeatherCard weatherData={weatherDataWithZeros} />);

    expect(screen.getByText('0°')).toBeInTheDocument();
    expect(screen.getByText('Min: 0°')).toBeInTheDocument();
    expect(screen.getByText('Max: 0°')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 hPa')).toBeInTheDocument();
    expect(screen.getByText('0 m/s')).toBeInTheDocument();
  });

  it('handles negative temperatures correctly', () => {
    const weatherDataWithNegatives = {
      ...mockWeatherData,
      main: {
        ...mockWeatherData.main,
        temp: -5.7, // Should round to -6
        temp_min: -8.3, // Should round to -8
        temp_max: -2.1, // Should round to -2
      },
    };

    render(<WeatherCard weatherData={weatherDataWithNegatives} />);

    expect(screen.getByText('-6°')).toBeInTheDocument();
    expect(screen.getByText('Min: -8°')).toBeInTheDocument();
    expect(screen.getByText('Max: -2°')).toBeInTheDocument();
  });

  it('handles multiple weather conditions by using the first one', () => {
    const weatherDataWithMultipleConditions = {
      ...mockWeatherData,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
        {
          id: 801,
          main: 'Clouds',
          description: 'few clouds',
          icon: '02d',
        },
      ],
    };

    render(<WeatherCard weatherData={weatherDataWithMultipleConditions} />);

    // Should display the first weather condition
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByAltText('clear sky')).toHaveAttribute('src', 'https://openweathermap.org/img/wn/01d@2x.png');
  });

  it('renders with empty className by default', () => {
    render(<WeatherCard weatherData={mockWeatherData} />);

    const weatherCard = screen.getByText('Kyiv').closest('.weather-card');
    expect(weatherCard).toHaveClass('weather-card');
    expect(weatherCard).not.toHaveClass('undefined');
  });
}); 