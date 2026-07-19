import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/index.js';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="glitch-wrapper">
        <h1 className="glitch-text" data-text="404">404</h1>
      </div>
      <h2 className="not-found-title">Lost in the Warehouse?</h2>
      <p className="not-found-desc">
        Oops! It looks like you've wandered into an empty aisle. 
        The stock you're looking for doesn't exist on this route.
      </p>
      
      <Button 
        variant="primary" 
        onClick={() => navigate('/dashboard')} 
        leftIcon="ri-home-4-line"
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
