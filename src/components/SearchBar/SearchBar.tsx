import { useState } from 'react';
import type { FormEvent } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Enter city name...", 
  className = "" 
}: SearchBarProps) {
  const [city, setCity] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity(''); // Clear input after search
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="City name"
      />
      <button 
        type="submit" 
        className="search-button"
        disabled={!city.trim()}
      >
        Search
      </button>
    </form>
  );
} 