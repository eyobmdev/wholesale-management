import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../../services/authService.js';
import { showToast } from '../../utils/toast.js';

export default function ResetPassword() {
  const [formData, setFormData] = useState({ password: '', password2: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      showToast.error('Invalid Link', 'This password reset link is invalid or missing token parameters.');
    }
  }, [uid, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uid || !token) {
      showToast.error('Invalid Link', 'Cannot reset password. The link is missing necessary parameters.');
      return;
    }
    
    if (formData.password !== formData.password2) {
      showToast.error('Validation Error', 'Passwords do not match');
      return;
    }
    
    const toastId = showToast.loading('Resetting password...');
    
    resetPasswordMutation.mutate({
      uid,
      token,
      password: formData.password,
      password2: formData.password2
    }, {
      onSuccess: (data) => {
        showToast.success('Success', data.message || 'Password reset successfully. Please login.');
        showToast.dismiss(toastId);
        navigate('/login', { replace: true });
      },
      onError: (err) => {
        // If it's an object error like {"password": ["Too short"]} 
        let errorMsg = 'Could not reset password. Please try again.';
        if (err?.errors) {
          errorMsg = Object.values(err.errors)[0] || errorMsg;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        showToast.error('Reset Failed', errorMsg);
        showToast.dismiss(toastId);
      }
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="auth-split-container" style={{ justifyContent: 'center' }}>
      <div className="auth-form-section" style={{ flex: 'none', width: '100%', padding: '24px' }}>
        <div className="auth-form-wrapper" style={{ margin: '0 auto' }}>
          
          <div className="auth-brand-logo">
            <i className="ri-flashlight-fill"></i>
          </div>
          
          <div className="auth-header">
            <h2>Set New Password</h2>
            <p>Enter a new password for your account.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-lock-line"></i></div>
              <input 
                type={showPwd ? "text" : "password"} 
                className="premium-input-field"
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="New password"
                required 
              />
              <button type="button" className="premium-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                <i className={showPwd ? "ri-eye-line" : "ri-eye-off-line"}></i>
              </button>
            </div>

            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-lock-line"></i></div>
              <input 
                type={showPwd ? "text" : "password"} 
                className="premium-input-field"
                name="password2"
                value={formData.password2} 
                onChange={handleChange} 
                placeholder="Confirm new password"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="premium-auth-btn" 
              disabled={resetPasswordMutation.isPending || !uid || !token}
              style={{ marginTop: '24px' }}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
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
