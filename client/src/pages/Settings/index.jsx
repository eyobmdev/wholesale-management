import React, { useState } from 'react';

export default function Settings() {
  // App Settings State
  const [formData, setFormData] = useState({
    business_name: 'My Business',
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
    setError('');
    setSuccess('');

    // Frontend validation matching backend requirements
    if (formData.low_stock_alert_percentage < 1 || formData.low_stock_alert_percentage > 99) {
      setError('Low stock alert percentage must be between 1 and 99.');
      return;
    }

    const currencies = formData.available_currencies;
    
    if (currencies.length === 0) {
      setError('At least one currency is required.');
      return;
    }

    if (!currencies.includes('ETB')) {
      setError('ETB must always be in the currency list.');
      return;
    }

    if (!currencies.includes(formData.default_currency)) {
      setError(`Default currency '${formData.default_currency}' must be in the available currencies list.`);
      return;
    }

    // Pretend to save for now
    console.log("Saving settings...", formData);
    setSuccess('Settings saved successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }

    console.log("Changing password...", passwordData);
    setPwdSuccess('Password changed successfully!');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">App Settings</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your application preferences and business details.</p>
      </div>

      {/* App Settings Card */}
      <div className="card-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
        {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {success && <div style={{ padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{success}</div>}

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

          <button className="full-width" type="submit" style={{ marginTop: '16px', padding: '14px', background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'var(--transition)' }}>
            Save Settings
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '24px' }}>Change Password</h3>
        
        {pwdError && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{pwdError}</div>}
        {pwdSuccess && <div style={{ padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{pwdSuccess}</div>}

        <form onSubmit={handlePasswordSubmit} className="settings-form-grid">
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Current Password</label>
            <input 
              type="password" 
              name="current_password" 
              value={passwordData.current_password} 
              onChange={handlePasswordChange} 
              required
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>New Password</label>
            <input 
              type="password" 
              name="new_password" 
              value={passwordData.new_password} 
              onChange={handlePasswordChange} 
              required
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Confirm New Password</label>
            <input 
              type="password" 
              name="confirm_password" 
              value={passwordData.confirm_password} 
              onChange={handlePasswordChange} 
              required
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)', fontSize: '0.95rem' }}
            />
          </div>

          <button className="full-width" type="submit" style={{ marginTop: '16px', padding: '14px', background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'var(--transition)' }}>
            Update Password
          </button>
        </form>
      </div>

    </div>
  );
}
