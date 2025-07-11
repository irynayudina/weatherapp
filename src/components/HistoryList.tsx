import { useState, useEffect } from 'react';
import UndoSnackbar from './UndoSnackbar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addCity, removeCity, clearHistory, loadHistoryFromStorage, insertCityAtIndex } from '../store/slices/historySlice';
import { selectHistory } from '../store/slices/historySlice';
import './HistoryList.css';

interface HistoryListProps {
  onCitySelect: (city: string) => void;
  className?: string;
}

interface DeletedItem {
  city: string;
  index: number;
}

export default function HistoryList({ onCitySelect, className = "" }: HistoryListProps) {
  const dispatch = useAppDispatch();
  const history = useAppSelector(selectHistory);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [deletedItem, setDeletedItem] = useState<DeletedItem | null>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    dispatch(loadHistoryFromStorage());
  }, [dispatch]);

  // Add city to history
  const addToHistory = (city: string) => {
    dispatch(addCity(city));
  };

  // Remove city from history
  const removeFromHistory = (cityToRemove: string, index: number) => {
    dispatch(removeCity(cityToRemove));

    // Store deleted item for undo functionality
    setDeletedItem({ city: cityToRemove, index });
    setShowUndoSnackbar(true);
  };

  // Undo last deletion
  const handleUndo = () => {
    if (!deletedItem) return;

    // Insert the deleted item back at its original position using Redux action
    dispatch(insertCityAtIndex({ city: deletedItem.city, index: deletedItem.index }));

    setDeletedItem(null);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    addToHistory(city);
  };

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent, city: string, index: number) => {
    e.stopPropagation(); // Prevent triggering the city selection
    removeFromHistory(city, index);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowUndoSnackbar(false);
    setDeletedItem(null);
  };

  // Handle clear all history
  const handleClearAll = () => {
    dispatch(clearHistory());
  };

  if (history.length === 0) {
    return (
      <>
        <div className={`history-list ${className}`}>
          <h3 className="history-title">Search History</h3>
          <p className="history-empty">No search history yet. Start searching for cities!</p>
        </div>
        {showUndoSnackbar && deletedItem && (
          <UndoSnackbar
            message={`"${deletedItem.city}" removed from history`}
            onUndo={handleUndo}
            onClose={handleSnackbarClose}
            duration={5000}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`history-list ${className}`}>
        <h3 className="history-title">Search History</h3>
        <ul className="history-items">
          {history.map((city, index) => (
            <li key={`${city}-${index}`} className="history-item">
              <button
                className="history-city-button"
                onClick={() => handleCitySelect(city)}
                aria-label={`Search weather for ${city}`}
              >
                <span className="city-name">{city}</span>
              </button>
              <button
                className="delete-button"
                onClick={(e) => handleDelete(e, city, index)}
                aria-label={`Remove ${city} from history`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          className="clear-history-button"
          onClick={handleClearAll}
          aria-label="Clear all search history"
        >
          Clear All History
        </button>
      </div>
      {showUndoSnackbar && deletedItem && (
        <UndoSnackbar
          message={`"${deletedItem.city}" removed from history`}
          onUndo={handleUndo}
          onClose={handleSnackbarClose}
          duration={5000}
        />
      )}
    </>
  );
} 