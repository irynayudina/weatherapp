import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UndoSnackbar from '../UndoSnackbar';
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

describe('UndoSnackbar', () => {
  const mockOnUndo = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnUndo.mockClear();
    mockOnClose.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders with message and action buttons', () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo last action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeInTheDocument();
  });

  it('calls onUndo when undo button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    const undoButton = screen.getByRole('button', { name: 'Undo last action' });
    await user.click(undoButton);

    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    await user.click(closeButton);

    // Wait for the delay before onClose is called
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-hides after default duration (5000ms)', async () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    // Initially visible
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time to trigger auto-hide
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Wait for the close callback to be called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('auto-hides after custom duration', async () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={3000}
      />
    );

    // Initially visible
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time to trigger auto-hide
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Wait for the close callback to be called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-snackbar';
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        className={customClass}
      />
    );

    const snackbar = screen.getByText('Test message').closest('.undo-snackbar');
    expect(snackbar).toHaveClass('undo-snackbar', 'visible', customClass);
  });

  it('renders with empty className by default', () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    const snackbar = screen.getByText('Test message').closest('.undo-snackbar');
    expect(snackbar).toHaveClass('undo-snackbar', 'visible');
    expect(snackbar).not.toHaveClass('undefined');
  });

  it('shows progress bar that shrinks over time', () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={1000}
      />
    );

    // Find the progress bar element (no role attribute in actual implementation)
    const progressBar = screen.getByText('Test message').closest('.undo-snackbar')?.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();

    // Initially should be at 0% (since timeLeft = duration, so progressPercentage = 0)
    expect(progressBar).toHaveStyle({ width: '0%' });

    // After 500ms should be at 50%
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(progressBar).toHaveStyle({ width: '50%' });

    // After 1000ms should be at 100%
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('handles long messages correctly', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the snackbar without breaking the layout or causing any issues with the component rendering';
    
    render(
      <UndoSnackbar
        message={longMessage}
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo last action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeInTheDocument();
  });

  it('handles special characters in message', () => {
    const specialMessage = 'Test message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    
    render(
      <UndoSnackbar
        message={specialMessage}
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('calls onClose with delay when undo is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    const undoButton = screen.getByRole('button', { name: 'Undo last action' });
    await user.click(undoButton);

    expect(mockOnUndo).toHaveBeenCalledTimes(1);

    // onClose should be called after 300ms delay
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose with delay when close is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    await user.click(closeButton);

    // onClose should be called after 300ms delay
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('stops countdown when component unmounts', () => {
    const { unmount } = render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={1000}
      />
    );

    // Unmount before timer completes
    unmount();

    // onClose should not be called after unmount
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles very short duration correctly', async () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={100}
      />
    );

    // Initially visible
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time to trigger auto-hide
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Wait for the close callback to be called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('handles zero duration correctly', async () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={0}
      />
    );

    // Should auto-hide immediately
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates progress bar every 100ms', () => {
    render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={1000}
      />
    );

    const progressBar = screen.getByText('Test message').closest('.undo-snackbar')?.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();

    // Initially at 0%
    expect(progressBar).toHaveStyle({ width: '0%' });

    // After 100ms should be at 10%
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(progressBar).toHaveStyle({ width: '10%' });

    // After 200ms should be at 20%
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(progressBar).toHaveStyle({ width: '20%' });

    // After 500ms should be at 50%
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('stops progress bar updates when not visible', () => {
    const { rerender } = render(
      <UndoSnackbar
        message="Test message"
        onUndo={mockOnUndo}
        onClose={mockOnClose}
        duration={1000}
      />
    );

    const progressBar = screen.getByText('Test message').closest('.undo-snackbar')?.querySelector('.progress-bar');
    
    // Advance time to 50%
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(progressBar).toHaveStyle({ width: '50%' });

    // Simulate component becoming invisible by clicking close
    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    fireEvent.click(closeButton);

    // Progress should still be at 50% since the component is no longer visible
    expect(progressBar).toHaveStyle({ width: '50%' });
  });
}); 