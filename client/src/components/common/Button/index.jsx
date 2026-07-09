import React from 'react';
import './Button.css';

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  leftIcon, 
  rightIcon, 
  className = '', 
  type = 'button',
  ...props 
}, ref) => {
  
  const baseClass = 'common-btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = isLoading ? 'btn-loading' : '';
  const disabledClass = disabled ? 'btn-disabled' : '';

  const classes = [baseClass, variantClass, sizeClass, loadingClass, disabledClass, className].filter(Boolean).join(' ');

  return (
    <button 
      ref={ref}
      type={type} 
      className={classes} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading && (
        <i className="ri-loader-4-line spinner-icon" style={{ marginRight: children ? '8px' : '0' }}></i>
      )}
      
      {!isLoading && leftIcon && (
        <i className={`${leftIcon} left-icon`} style={{ marginRight: children ? '8px' : '0' }}></i>
      )}
      
      {children && <span className="btn-content">{children}</span>}
      
      {!isLoading && rightIcon && (
        <i className={`${rightIcon} right-icon`} style={{ marginLeft: children ? '8px' : '0' }}></i>
      )}
    </button>
  );
});

Button.displayName = 'Button';
