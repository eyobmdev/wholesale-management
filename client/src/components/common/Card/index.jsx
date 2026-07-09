import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`common-card ${noPadding ? 'no-padding' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', title, subtitle, action, ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {(title || subtitle) ? (
        <div className="card-header-content">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      ) : children}
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

// Assign sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
