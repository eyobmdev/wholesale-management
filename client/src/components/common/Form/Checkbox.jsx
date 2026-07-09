import React from 'react';
import './Form.css';

export const Checkbox = React.forwardRef(({
  label,
  error,
  disabled,
  className = '',
  ...props
}, ref) => {
  
  return (
    <label className={`checkbox-wrapper ${disabled ? 'is-disabled' : ''} ${className}`}>
      <input
        type="checkbox"
        ref={ref}
        className="common-checkbox"
        disabled={disabled}
        aria-invalid={!!error ? 'true' : 'false'}
        {...props}
      />
      {label && (
        <span className="checkbox-label">
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
