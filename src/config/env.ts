/**
 * Environment configuration for the Weather App
 * All environment variables are prefixed with VITE_ for Vite compatibility
 */

// Helper function to safely get environment variables
function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    return (import.meta.env as any)[key] || defaultValue;
  } catch {
    return defaultValue;
  }
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  try {
    const value = getEnvVar(key);
    return value ? parseInt(value, 10) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function getEnvVarBoolean(key: string, defaultValue: boolean): boolean {
  try {
    const value = getEnvVar(key);
    return value ? value === 'true' : defaultValue;
  } catch {
    return defaultValue;
  }
}

export const config = {
  // OpenWeatherMap API Configuration
  openWeather: {
    apiKey: getEnvVar('VITE_OPENWEATHER_API_KEY'),
    apiBaseUrl: getEnvVar('VITE_OPENWEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5'),
  },

  // App Configuration
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Weather App'),
    description: getEnvVar('VITE_APP_DESCRIPTION', 'Get current weather information for any city'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },

  // React Query Configuration
  query: {
    retryCount: getEnvVarNumber('VITE_QUERY_RETRY_COUNT', 1),
    staleTime: getEnvVarNumber('VITE_QUERY_STALE_TIME', 300000), // 5 minutes in milliseconds
  },

  // Storage Configuration
  storage: {
    key: getEnvVar('VITE_STORAGE_KEY', 'weather_search_history'),
    maxHistoryItems: getEnvVarNumber('VITE_MAX_HISTORY_ITEMS', 10),
  },

  // Development Configuration
  dev: {
    mode: getEnvVarBoolean('VITE_DEV_MODE', false),
    enableDevtools: getEnvVarBoolean('VITE_ENABLE_DEVTOOLS', true),
  },
} as const;

/**
 * Type for the config object
 */
export type Config = typeof config;

/**
 * Helper function to get a specific config value
 */
export function getConfig<T extends keyof Config>(key: T): Config[T] {
  return config[key];
}

/**
 * Helper function to check if we're in development mode
 */
export function isDevelopment(): boolean {
  try {
    return config.dev.mode || (import.meta.env as any).DEV === true;
  } catch {
    return config.dev.mode;
  }
}

/**
 * Helper function to check if devtools should be enabled
 */
export function shouldEnableDevtools(): boolean {
  try {
    return config.dev.enableDevtools && (isDevelopment() || (import.meta.env as any).DEV === true);
  } catch {
    return config.dev.enableDevtools && isDevelopment();
  }
} 