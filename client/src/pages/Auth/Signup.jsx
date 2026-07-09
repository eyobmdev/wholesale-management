import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister, authService } from '../../services/authService.js';
import { showToast } from '../../utils/toast.js';

export default function Signup() {
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    password2: '',
    remember_me: false
  });
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.email || !formData.password || !formData.password2) {
      showToast.warning('Validation Error', 'Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.password2) {
      showToast.error('Validation Error', 'Passwords do not match');
      return;
    }
    
    const toastId = showToast.loading('Creating account...');
    registerMutation.mutate(formData, {
      onSuccess: (data) => {
        showToast.success('Success', data.message || 'Account created successfully!');
        showToast.dismiss(toastId);
        authService.setTokens(data.access || data.accessf, data.refresh); 
        navigate('/dashboard', { replace: true });
      },
      onError: (err) => {
        const errorMsg = err?.message || 'Could not create account';
        showToast.error('Signup Failed', errorMsg);
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
            <h2>Create Account</h2>
            <p>Enter your details to get started.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="premium-input-group">
                <div className="premium-input-icon"><i className="ri-user-line"></i></div>
                <input 
                  type="text" 
                  className="premium-input-field"
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  placeholder="First Name"
                  required 
                />
              </div>
              <div className="premium-input-group">
                <div className="premium-input-icon"><i className="ri-user-line"></i></div>
                <input 
                  type="text" 
                  className="premium-input-field"
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  placeholder="Last Name"
                  required 
                />
              </div>
            </div>
            
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

            <div className="premium-input-group">
              <div className="premium-input-icon"><i className="ri-lock-line"></i></div>
              <input 
                type={showPwd ? "text" : "password"} 
                className="premium-input-field"
                name="password2" 
                value={formData.password2} 
                onChange={handleChange} 
                placeholder="Confirm your password"
                required 
              />
            </div>
            
            <div className="auth-options" style={{ justifyContent: 'flex-start' }}>
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={formData.remember_me} 
                  onChange={(e) => setFormData({...formData, remember_me: e.target.checked})}
                /> Remember me
              </label>
            </div>
            
            <button type="submit" className="premium-auth-btn" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-divider">Or sign up with</div>
          
          <div className="social-auth-grid">
            <button type="button" className="social-btn google" onClick={() => showToast.info('OAuth Mock', 'Google signup mocked')}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px'}} /> Google
            </button>
            <button type="button" className="social-btn apple" onClick={() => showToast.info('OAuth Mock', 'Apple signup mocked')}>
              <i className="ri-apple-fill" style={{fontSize: '1.4rem'}}></i> Apple
            </button>
          </div>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
