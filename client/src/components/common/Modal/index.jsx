import React, { useEffect } from 'react';
import './Modal.css';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  className = '',
  closeOnOverlayClick = true
}) => {
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <div className={`common-modal modal-${size} ${className}`} role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined}>
        
        {title && (
          <div className="modal-header">
            <h3 id="modal-title" className="modal-title">{title}</h3>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}

        {/* Fallback close button if no title/header exists */}
        {!title && (
          <button className="modal-close-btn floating-close" onClick={onClose} aria-label="Close modal">
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>
    </div>
  );
};
