import React from 'react';
import './Form.css';

export const FormField = ({ 
  label, 
  error, 
  helperText, 
  required, 
  children, 
  className = '',
  htmlFor 
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="required-indicator" aria-hidden="true">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <div className="form-error-message" role="alert">
          <i className="ri-error-warning-line"></i> {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="form-helper-text">{helperText}</div>
      )}
    </div>
  );
};
