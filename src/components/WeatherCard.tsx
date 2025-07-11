import type { CurrentWeatherResponse } from '../types/weather';
import './WeatherCard.css';

interface WeatherCardProps {
  weatherData: CurrentWeatherResponse;
  className?: string;
}

export default function WeatherCard({ weatherData, className = "" }: WeatherCardProps) {
  const { main, weather, wind, name } = weatherData;
  const weatherCondition = weather[0]; // Get the first weather condition

  return (
    <div className={`weather-card ${className}`}>
      <div className="weather-card-header">
        <h2 className="city-name">{name}</h2>
        <div className="weather-icon">
          <img 
            src={`https://openweathermap.org/img/wn/${weatherCondition.icon}@2x.png`}
            alt={weatherCondition.description}
            width="50"
            height="50"
          />
        </div>
      </div>

      <div className="weather-card-body">
        <div className="temperature-section">
          <div className="current-temp">
            <span className="temp-value">{Math.round(main.temp)}°</span>
            <span className="temp-unit">C</span>
          </div>
          <div className="temp-range">
            <span className="temp-min">Min: {Math.round(main.temp_min)}°</span>
            <span className="temp-max">Max: {Math.round(main.temp_max)}°</span>
          </div>
        </div>

        <div className="weather-description">
          <p className="description-text">{weatherCondition.description}</p>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Wind Speed:</span>
            <span className="detail-value">{wind.speed} m/s</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{main.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pressure:</span>
            <span className="detail-value">{main.pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
} 