// Coordinates interface
export interface Coordinates {
  lon: number;
  lat: number;
}

// Weather condition interface
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// Main weather data interface
export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

// Wind data interface
export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

// Cloud coverage interface
export interface CloudData {
  all: number;
}

// Rain data interface (optional)
export interface RainData {
  '1h'?: number;
  '3h'?: number;
}

// Snow data interface (optional)
export interface SnowData {
  '1h'?: number;
  '3h'?: number;
}

// System information interface
export interface SystemInfo {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
  message?: number;
}

// Current weather response interface
export interface CurrentWeatherResponse {
  coord: Coordinates;
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  clouds: CloudData;
  rain?: RainData;
  snow?: SnowData;
  dt: number;
  sys: SystemInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Error response interface
export interface WeatherApiError {
  cod: string;
  message: string;
}

// Union type for API response
export type WeatherApiResponse = CurrentWeatherResponse | WeatherApiError;

// Helper type to check if response is successful
export function isWeatherResponse(response: WeatherApiResponse): response is CurrentWeatherResponse {
  return typeof response.cod === 'number' && response.cod === 200;
}

// Helper type to check if response is an error
export function isWeatherError(response: WeatherApiResponse): response is WeatherApiError {
  return typeof response.cod === 'string';
}

// Temperature unit types
export type TemperatureUnit = 'metric' | 'imperial' | 'kelvin';

// Weather units configuration
export interface WeatherUnits {
  temperature: TemperatureUnit;
  windSpeed: 'm/s' | 'mph' | 'km/h';
  pressure: 'hPa' | 'mmHg' | 'inHg';
  visibility: 'm' | 'km' | 'mi';
} 