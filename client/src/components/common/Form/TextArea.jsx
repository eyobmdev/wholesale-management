import React from 'react';
import './Form.css';

export const TextArea = React.forwardRef(({
  className = '',
  error,
  disabled,
  readOnly,
  rows = 4,
  ...props
}, ref) => {
  
  const hasError = !!error;
  const textAreaClasses = [
    'common-input',
    hasError ? 'has-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <textarea
      ref={ref}
      className={textAreaClasses}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      aria-invalid={hasError ? 'true' : 'false'}
      style={{ resize: 'vertical', minHeight: '80px' }}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';
