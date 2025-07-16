import { useState, useEffect } from 'react';
import './UndoSnackbar.css';

interface UndoSnackbarProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number; // Duration in milliseconds
  className?: string;
}

export default function UndoSnackbar({ 
  message, 
  onUndo, 
  onClose, 
  duration = 5000, 
  className = "" 
}: UndoSnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);

  // Auto-hide after duration
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, isVisible, onClose]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, timeLeft]);

  const handleUndo = () => {
    setIsVisible(false);
    onUndo();
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  return (
    <div className={`undo-snackbar ${isVisible ? 'visible' : 'hidden'} ${className}`}>
      <div className="snackbar-content">
        <div className="snackbar-message">
          <span className="message-text">{message}</span>
        </div>
        <div className="snackbar-actions">
          <button 
            className="undo-button"
            onClick={handleUndo}
            aria-label="Undo last action"
          >
            Undo
          </button>
          <button 
            className="close-button"
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
      <div className="snackbar-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
} 