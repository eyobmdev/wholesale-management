import React from 'react';
import './Form.css';

export const Select = React.forwardRef(({
  className = '',
  error,
  options = [],
  disabled,
  placeholder = 'Select an option...',
  ...props
}, ref) => {
  
  const hasError = !!error;
  const selectClasses = [
    'common-input',
    'common-select',
    hasError ? 'has-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-input-wrapper">
      <select
        ref={ref}
        className={selectClasses}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

Select.displayName = 'Select';
