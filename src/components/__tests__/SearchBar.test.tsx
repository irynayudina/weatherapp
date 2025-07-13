import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

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

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input and button', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByRole('textbox', { name: /city name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted with valid city', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /city name/i });
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'London');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('London');
  });

  it('clears input after successful search', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /city name/i });
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'Paris');
    await user.click(button);
    
    expect(input).toHaveValue('');
  });

  it('does not call onSearch when input is empty', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /search/i });
    
    // Button should be disabled when input is empty
    expect(button).toBeDisabled();
    
    await user.click(button);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('does not call onSearch when input is only whitespace', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /city name/i });
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, '   ');
    await user.click(button);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('trims whitespace from input before calling onSearch', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /city name/i });
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, '  New York  ');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('New York');
  });

  it('calls onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /city name/i });
    
    await user.type(input, 'Tokyo');
    await user.keyboard('{Enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('Tokyo');
  });

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = 'Enter your city here...';
    render(<SearchBar onSearch={mockOnSearch} placeholder={customPlaceholder} />);
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-search-bar';
    render(<SearchBar onSearch={mockOnSearch} className={customClass} />);
    
    const form = screen.getByDisplayValue('').closest('form');
    expect(form).toHaveClass('search-bar', customClass);
  });
}); 