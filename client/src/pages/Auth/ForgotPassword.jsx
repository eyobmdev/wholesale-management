import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../services/authService.js';
import { showToast } from '../../utils/toast.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast.warning('Validation Error', 'Please enter your email address');
      return;
    }
    
    const toastId = showToast.loading('Sending reset link...');
    forgotPasswordMutation.mutate(email, {
      onSuccess: (data) => {
        showToast.success('Email Sent', data.message || 'If this email is registered you will receive a reset link shortly.');
        setEmail('');
        showToast.dismiss(toastId);
      },
      onError: (err) => {
        const errorMsg = err?.message || 'Could not send reset link. Please try again.';
        showToast.error('Error', errorMsg);
        showToast.dismiss(toastId);
      }
    });
  };

  return (
    <div className="auth-split-container" style={{ justifyContent: 'center' }}>
      <div className="auth-form-section" style={{ flex: 'none', width: '100%', padding: '24px' }}>
        <div className="auth-form-wrapper" style={{ margin: '0 auto' }}>
          
          <div className="auth-brand-logo">
            <i className="ri-flashlight-fill"></i>
          </div>
          
          <div className="auth-header">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a password reset link.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-mail-line"></i></div>
              <input 
                type="email" 
                className="premium-input-field"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="premium-auth-btn" 
              disabled={forgotPasswordMutation.isPending}
              style={{ marginTop: '24px' }}
            >
              {forgotPasswordMutation.isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <p>Remember your password? <Link to="/login">Back to Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
