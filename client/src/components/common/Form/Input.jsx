import React from 'react';
import './Form.css';

export const Input = React.forwardRef(({
  className = '',
  error,
  leftIcon,
  rightIcon,
  disabled,
  readOnly,
  ...props
}, ref) => {
  
  const hasError = !!error;
  const inputClasses = [
    'common-input',
    hasError ? 'has-error' : '',
    leftIcon ? 'has-icon-left' : '',
    rightIcon ? 'has-icon-right' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-input-wrapper">
      {leftIcon && (
        <span className="input-icon-left">
          <i className={leftIcon}></i>
        </span>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasError ? 'true' : 'false'}
        {...props}
      />
      
      {rightIcon && (
        <span className="input-icon-right">
          <i className={rightIcon}></i>
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
