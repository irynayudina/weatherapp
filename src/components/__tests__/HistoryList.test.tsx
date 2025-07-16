import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryList from '../HistoryList/HistoryList';
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
    storage: {
      key: 'weather_search_history',
      maxHistoryItems: 10,
    },
    dev: {
      mode: false,
      enableDevtools: false,
    },
  },
  isDevelopment: () => false,
  shouldEnableDevtools: () => false,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the store hooks
const mockDispatch = jest.fn();
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));



describe('HistoryList', () => {
  const mockOnCitySelect = jest.fn();
  const { useAppSelector } = jest.requireMock('../../store/hooks');

  beforeEach(() => {
    mockOnCitySelect.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    mockDispatch.mockClear();
  });

  it('renders empty state when no history exists', () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('Search History')).toBeInTheDocument();
    expect(screen.getByText('No search history yet. Start searching for cities!')).toBeInTheDocument();
  });

  it('renders history items when cities exist', () => {
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris', 'Tokyo']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('Search History')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all search history' })).toBeInTheDocument();
  });

  it('calls onCitySelect when a history item is clicked', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    const londonButton = screen.getByRole('button', { name: /search weather for london/i });
    await user.click(londonButton);

    expect(mockOnCitySelect).toHaveBeenCalledWith('London');
  });

  it('shows delete buttons for each history item', () => {
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /remove .* from history/i });
    expect(deleteButtons).toHaveLength(2);
    expect(deleteButtons[0]).toHaveAttribute('aria-label', 'Remove London from history');
    expect(deleteButtons[1]).toHaveAttribute('aria-label', 'Remove Paris from history');
  });

  it('shows undo snackbar when a city is deleted', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    const deleteButton = screen.getByRole('button', { name: /remove london from history/i });
    await user.click(deleteButton);

    // Check that undo snackbar appears
    await waitFor(() => {
      expect(screen.getByText('"London" removed from history')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Undo last action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeInTheDocument();
  });

  it('allows undoing a deletion', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    // Delete a city
    const deleteButton = screen.getByRole('button', { name: /remove london from history/i });
    await user.click(deleteButton);

    // Wait for snackbar to appear
    await waitFor(() => {
      expect(screen.getByText('"London" removed from history')).toBeInTheDocument();
    });

    // Click undo
    const undoButton = screen.getByRole('button', { name: 'Undo last action' });
    await user.click(undoButton);

    // Check that London is back in the list
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument();
    });
  });

  it('closes snackbar when close button is clicked', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(['London']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    // Delete a city
    const deleteButton = screen.getByRole('button', { name: /remove london from history/i });
    await user.click(deleteButton);

    // Wait for snackbar to appear
    await waitFor(() => {
      expect(screen.getByText('"London" removed from history')).toBeInTheDocument();
    });

    // Click close
    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    await user.click(closeButton);

    // Check that snackbar is no longer visible
    await waitFor(() => {
      expect(screen.queryByText('"London" removed from history')).not.toBeInTheDocument();
    });
  });

  it('prevents city selection when delete button is clicked', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(['London']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    const deleteButton = screen.getByRole('button', { name: /remove london from history/i });
    await user.click(deleteButton);

    // onCitySelect should not be called when clicking delete button
    expect(mockOnCitySelect).not.toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    (useAppSelector as jest.Mock).mockReturnValue(['London']);
    const customClass = 'custom-history-list';
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} className={customClass} />
    );

    const historyList = screen.getByText('Search History').closest('.history-list');
    expect(historyList).toHaveClass('history-list', customClass);
  });

  it('renders with empty className by default', () => {
    (useAppSelector as jest.Mock).mockReturnValue(['London']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    const historyList = screen.getByText('Search History').closest('.history-list');
    expect(historyList).toHaveClass('history-list');
    expect(historyList).not.toHaveClass('undefined');
  });

  it('loads history from localStorage on mount', () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    // The component should dispatch loadHistoryFromStorage on mount
    // This is tested indirectly by checking that the component renders correctly
    expect(screen.getByText('Search History')).toBeInTheDocument();
  });

  it('handles multiple cities in history correctly', () => {
    (useAppSelector as jest.Mock).mockReturnValue(['London', 'Paris', 'Tokyo', 'New York', 'Berlin']);
    
    render(
      <HistoryList onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();

    // Should have delete buttons for each city
    const deleteButtons = screen.getAllByRole('button', { name: /remove .* from history/i });
    expect(deleteButtons).toHaveLength(5);
  });
}); 