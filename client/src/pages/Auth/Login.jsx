import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin, authService } from '../../services/authService.js';
import { showToast } from '../../utils/toast.js';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast.warning('Validation Error', 'Please fill in all fields');
      return;
    }
    const toastId = showToast.loading('Signing in...');
    loginMutation.mutate(formData, {
      onSuccess: (data) => {
        showToast.success('Success', 'Logged in successfully!');
        showToast.dismiss(toastId);
        authService.setToken(data.token);
        navigate('/dashboard', { replace: true });
      },
      onError: (err) => {
        showToast.error('Login Failed', err.message || 'Invalid credentials');
        showToast.dismiss(toastId);
      }
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="auth-split-container">
      {/* Left Pane - Form */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          
          <div className="auth-brand-logo">
            <i className="ri-flashlight-fill"></i>
          </div>
          
          <div className="auth-header">
            <h2>Welcome back!</h2>
            <p>Enter email & password to continue.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-mail-line"></i></div>
              <input 
                type="email" 
                className="premium-input-field"
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email address"
                required 
              />
            </div>
            
            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-lock-line"></i></div>
              <input 
                type={showPwd ? "text" : "password"} 
                className="premium-input-field"
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
                required 
              />
              <button type="button" className="premium-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                <i className={showPwd ? "ri-eye-line" : "ri-eye-off-line"}></i>
              </button>
            </div>
            
            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password</a>
            </div>
            
            <button type="submit" className="premium-auth-btn" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-divider">Or sign in with</div>
          
          <div className="social-auth-grid">
            <button type="button" className="social-btn google" onClick={() => showToast.info('OAuth Mock', 'Google login mocked')}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px'}} /> Google
            </button>
            <button type="button" className="social-btn apple" onClick={() => showToast.info('OAuth Mock', 'Apple login mocked')}>
              <i className="ri-apple-fill" style={{fontSize: '1.4rem'}}></i> Apple
            </button>
          </div>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
