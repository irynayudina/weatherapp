# Weather App

A modern weather application built with React, TypeScript, and Vite. Get current weather information for any city using the OpenWeatherMap API.

## Features

### Core Functionality
- **Weather Search**: Search for current weather by city name
- **Real-time Weather Data**: Display current temperature, humidity, wind speed, and pressure
- **Weather Icons**: Visual weather condition icons from OpenWeatherMap
- **Temperature Range**: Show minimum and maximum temperatures
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### User Experience Features
- **Search History**: Automatically saves and displays recent searches
- **History Management**: 
  - Click on history items to quickly search again
  - Remove individual items from history
  - Clear all history with one click
  - Undo functionality for deleted history items
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages with retry options
- **Welcome State**: Helpful guidance for new users

### Technical Features
- **React Query Integration**: Efficient data fetching with caching and background updates
- **Redux State Management**: Centralized state management for search history
- **TypeScript**: Full type safety throughout the application
- **Environment Configuration**: Flexible configuration via environment variables
- **Development Tools**: React Query DevTools in development mode

## Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Redux Toolkit for global state
- **Data Fetching**: TanStack React Query for API calls
- **Styling**: CSS modules with responsive design
- **Testing**: Jest with React Testing Library
- **E2E Testing**: Playwright

### Project Structure
```
src/
├── api/
│   └── weatherApi.ts          # OpenWeatherMap API integration
├── components/
│   ├── SearchBar.tsx          # City search input component
│   ├── WeatherCard.tsx        # Weather display component
│   ├── HistoryList.tsx        # Search history management
│   └── UndoSnackbar.tsx      # Undo notification component
├── config/
│   └── env.ts                 # Environment configuration
├── store/
│   ├── index.ts               # Redux store setup
│   ├── hooks.ts               # Redux hooks
│   └── slices/
│       └── historySlice.ts    # Search history state management
├── types/
│   └── weather.ts             # TypeScript type definitions
└── App.tsx                    # Main application component
```

### Key Components

#### WeatherCard Component
- Displays current weather information including temperature, humidity, wind speed, and pressure
- Shows weather condition icons from OpenWeatherMap
- Responsive design with temperature range display

#### SearchBar Component
- Handles city name input and form submission
- Validates input before triggering search
- Clears input after successful search

#### HistoryList Component
- Manages search history with Redux integration
- Provides undo functionality for deleted items
- Supports individual item removal and bulk clear operations

#### API Integration
- Uses OpenWeatherMap API for weather data
- Implements proper error handling for API failures
- Supports metric units for temperature and measurements

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weatherapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeatherMap API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

4. **Get an OpenWeatherMap API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/)
   - Sign up for a free account
   - Generate an API key
   - Add the key to your `.env` file

### Running the Application

#### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

#### Production Build
```bash
npm run build
npm run preview
```

#### Linting
```bash
npm run lint
```

## 🧪 Testing

### Unit Tests
Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Structure
- **Integration Tests**: Located in `src/__tests__/` - Test complete user workflows and component interactions (e.g., `App.test.tsx`)
- **Component Tests**: Located in `src/components/__tests__/` - Test individual React components in isolation with mocked dependencies
- **API Tests**: Located in `src/api/__tests__/` - Test the weather API function with various scenarios including success, error handling, and edge cases
- **Unit Tests**: Individual function and utility tests (currently covered within component and API tests)

## Configuration

### Environment Variables
The app uses the following environment variables (all prefixed with `VITE_`):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key | Required |
| `VITE_OPENWEATHER_API_BASE_URL` | API base URL | `https://api.openweathermap.org/data/2.5` |
| `VITE_APP_NAME` | Application name | `Weather App` |
| `VITE_APP_DESCRIPTION` | App description | `Get current weather information for any city` |
| `VITE_QUERY_RETRY_COUNT` | API retry attempts | `1` |
| `VITE_QUERY_STALE_TIME` | Cache stale time (ms) | `300000` (5 min) |
| `VITE_STORAGE_KEY` | LocalStorage key | `weather_search_history` |
| `VITE_MAX_HISTORY_ITEMS` | Max history items | `10` |
| `VITE_ENABLE_DEVTOOLS` | Enable React Query DevTools | `true` |

### Development Tools
- **React Query DevTools**: Available in development mode
- **Redux DevTools**: Available in development mode
- **ESLint**: Code linting and formatting

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License
This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

**API Key Error**
- Ensure your OpenWeatherMap API key is correctly set in `.env`
- Verify the API key is valid and has the necessary permissions

**Build Errors**
- Clear node_modules and reinstall
- Check TypeScript configuration in `tsconfig.json`

**Test Failures**
- Ensure all dependencies are installed: `npm install`
- Check that test environment is properly configured

**Development Server Issues**
- Try clearing the Vite cache: `npm run dev -- --force`
- Check for port conflicts and change if necessary