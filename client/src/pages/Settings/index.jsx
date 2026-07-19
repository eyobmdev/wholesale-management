import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../../services/settingsService.js';
import { useUpdatePassword } from '../../services/authService.js';
import { showToast } from '../../utils/toast.js';

export default function Settings() {
  const { data: initialSettings, isLoading, isError } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const updatePasswordMutation = useUpdatePassword();

  // App Settings State
  const [formData, setFormData] = useState({
    business_name: '',
    business_phone: '',
    business_address: '',
    low_stock_alert_percentage: 20,
    default_currency: 'ETB',
    available_currencies: ['ETB', 'USD']
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Currency input state for the tag input
  const [currencyInput, setCurrencyInput] = useState('');

  // Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Initialize form data when query completes
  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handlers for currency tags
  const handleCurrencyKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newCurrency = currencyInput.trim().toUpperCase();
      if (newCurrency && !formData.available_currencies.includes(newCurrency)) {
        setFormData(prev => ({
          ...prev,
          available_currencies: [...prev.available_currencies, newCurrency]
        }));
      }
      setCurrencyInput('');
    }
  };

  const removeCurrency = (currencyToRemove) => {
    setFormData(prev => ({
      ...prev,
      available_currencies: prev.available_currencies.filter(c => c !== currencyToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend validation matching backend requirements
    if (!formData.business_name) {
      showToast.warning('Validation Error', 'Business name is required.');
      return;
    }

    if (formData.low_stock_alert_percentage < 1 || formData.low_stock_alert_percentage > 99) {
      showToast.warning('Validation Error', 'Low stock alert percentage must be between 1 and 99.');
      return;
    }

    const currencies = formData.available_currencies;
    
    if (currencies.length === 0) {
      showToast.warning('Validation Error', 'At least one currency is required.');
      return;
    }

    if (!currencies.includes('ETB')) {
      showToast.error('Validation Error', 'ETB must always be in the currency list.');
      return;
    }

    if (!currencies.includes(formData.default_currency)) {
      showToast.error('Validation Error', `Default currency '${formData.default_currency}' must be in the available currencies list.`);
      return;
    }

    const toastId = showToast.loading('Saving settings...');

    updateSettingsMutation.mutate({ id: formData.id, data: formData }, {
      onSuccess: () => {
        showToast.success('Settings saved successfully!');
        showToast.dismiss(toastId);
      },
      onError: () => {
        showToast.error('Failed to save settings', 'Please try again later.');
        showToast.dismiss(toastId);
      }
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast.error('Validation Error', 'New passwords do not match.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      showToast.warning('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    const toastId = showToast.loading('Updating password...');

    updatePasswordMutation.mutate(passwordData, {
      onSuccess: () => {
        showToast.success('Success', 'Password changed successfully!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        showToast.dismiss(toastId);
      },
      onError: () => {
        showToast.error('Error', 'Failed to change password. Please try again.');
        showToast.dismiss(toastId);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="settings-page" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="ri-loader-4-line" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '16px' }}></i>
        <p>Loading settings...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="settings-page" style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>
        <p>Failed to load settings. Please try again.</p>
      </div>
    );
  }

  const isSaving = updateSettingsMutation.isPending;
  const isSavingPwd = updatePasswordMutation.isPending;

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">App Settings</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your application preferences and business details.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
      {/* App Settings Card */}
      <div className="card-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>

        <form onSubmit={handleSubmit} className="settings-form-grid">
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Business Name</label>
            <input 
              type="text" 
              name="business_name" 
              value={formData.business_name} 
              onChange={handleChange} 
              required
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Business Phone</label>
            <input 
              type="text" 
              name="business_phone" 
              value={formData.business_phone} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group full-width" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Business Address</label>
            <textarea 
              name="business_address" 
              value={formData.business_address} 
              onChange={handleChange} 
              rows="3"
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem', resize: 'vertical' }}
            ></textarea>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Low Stock Alert Percentage (%)</label>
            <input 
              type="number" 
              name="low_stock_alert_percentage" 
              value={formData.low_stock_alert_percentage} 
              onChange={handleChange} 
              min="1" max="99"
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Alert when remaining stock drops below this % of purchased amount</small>
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Default Currency</label>
            <select 
              name="default_currency" 
              value={formData.default_currency} 
              onChange={handleChange}
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            >
              {formData.available_currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Available Currencies</label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              background: 'var(--content-bg)',
              alignItems: 'center'
            }}>
              {formData.available_currencies.map(currency => (
                <span key={currency} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--header-bg)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  border: '1px solid var(--card-border)'
                }}>
                  {currency}
                  <i 
                    className="ri-close-line" 
                    style={{ cursor: 'pointer', fontSize: '1rem', opacity: '0.7' }}
                    onClick={() => removeCurrency(currency)}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  ></i>
                </span>
              ))}
              <input 
                type="text" 
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value)}
                onKeyDown={handleCurrencyKeyDown}
                placeholder="Type and press Enter..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  flex: '1',
                  minWidth: '150px',
                  color: 'var(--text-color)',
                  fontSize: '0.95rem',
                  padding: '2px 4px'
                }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type a currency (e.g., USD) and press Enter or Comma.</small>
          </div>

          <button className="full-width" type="submit" disabled={isSaving} style={{ marginTop: '16px', padding: '14px', background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'var(--transition)', opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '24px' }}>Change Password</h3>

        <form onSubmit={handlePasswordSubmit} className="settings-form-grid">
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Current Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPwd.current ? "text" : "password"} 
                name="current_password" 
                value={passwordData.current_password} 
                onChange={handlePasswordChange} 
                required
                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
              />
              <i 
                className={showPwd.current ? "ri-eye-line" : "ri-eye-off-line"} 
                onClick={() => setShowPwd(prev => ({ ...prev, current: !prev.current }))}
                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}
              ></i>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPwd.new ? "text" : "password"} 
                name="new_password" 
                value={passwordData.new_password} 
                onChange={handlePasswordChange} 
                required
                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
              />
              <i 
                className={showPwd.new ? "ri-eye-line" : "ri-eye-off-line"} 
                onClick={() => setShowPwd(prev => ({ ...prev, new: !prev.new }))}
                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}
              ></i>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Confirm New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPwd.confirm ? "text" : "password"} 
                name="confirm_password" 
                value={passwordData.confirm_password} 
                onChange={handlePasswordChange} 
                required
                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
              />
              <i 
                className={showPwd.confirm ? "ri-eye-line" : "ri-eye-off-line"} 
                onClick={() => setShowPwd(prev => ({ ...prev, confirm: !prev.confirm }))}
                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}
              ></i>
            </div>
          </div>

          <button className="full-width" type="submit" disabled={isSavingPwd} style={{ marginTop: '16px', padding: '14px', background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: isSavingPwd ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'var(--transition)', opacity: isSavingPwd ? 0.7 : 1 }}>
            {isSavingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
      
      </div>
    </div>
  );
}
