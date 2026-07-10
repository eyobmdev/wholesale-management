import React, { useState } from 'react';
import { FormField, Input, Checkbox, Select, Button } from '../../components/common/index.js';
import { useCreateFactory, useUpdateFactory } from '../../services/factoryService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export default function FactoryForm({ initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const createMutation = useCreateFactory();
  const updateMutation = useUpdateFactory();

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  const [showAdditional, setShowAdditional] = useState(false);
  
  // Default values mapping Factory model fields
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    initial_balance: initialData?.initial_balance || '',
    initial_balance_currency: initialData?.initial_balance_currency || 'ETB',
    is_active: initialData !== undefined ? (initialData.is_active === true || initialData.is_active === 'true') : true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getChangedFields = () => {
    if (!isEdit) return formData;
    
    const changed = {};
    Object.keys(formData).forEach(key => {
      // Handle numeric fields safely
      if (key === 'initial_balance') {
        const currentVal = formData[key] === '' ? 0 : parseFloat(formData[key]);
        const initialVal = initialData[key] === null || initialData[key] === '' ? 0 : parseFloat(initialData[key]);
        if (currentVal !== initialVal && !isNaN(currentVal)) {
          changed[key] = currentVal;
        }
        return;
      }
      
      // Basic strict inequality check for strings/booleans
      if (formData[key] !== initialData[key]) {
        // Handle empty strings vs null from backend
        if (formData[key] === '' && initialData[key] === null) return;
        changed[key] = formData[key];
      }
    });
    return changed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      const changedFields = getChangedFields();
      if (Object.keys(changedFields).length === 0) {
        showToast.info('No Changes', 'You did not make any changes.');
        if (onSuccess) onSuccess();
        return;
      }
      
      updateMutation.mutate(
        { id: initialData.id, data: changedFields, partial: true },
        {
          onSuccess: () => {
            showToast.success('Success', 'Factory updated successfully');
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            handleBackendErrors(err, setErrors, 'Update Failed');
          }
        }
      );
    } else {
      const payload = { ...formData };
      payload.initial_balance = payload.initial_balance === '' ? 0 : parseFloat(payload.initial_balance);
      
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast.success('Success', 'Factory created successfully');
          if (onSuccess) onSuccess();
        },
        onError: (err) => {
          handleBackendErrors(err, setErrors, 'Creation Failed');
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <FormField label="Factory Name" required error={errors.name}>
        <Input 
          name="name"
          placeholder="e.g. Mojo Steel" 
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </FormField>

      <div style={{ display: 'flex', gap: '16px' }}>
        <FormField label="Phone Number" error={errors.phone} style={{ flex: 1 }}>
          <Input 
            name="phone"
            placeholder="0911..." 
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      <FormField label="Location" error={errors.location}>
        <Input 
          name="location"
          placeholder="e.g. Adama" 
          value={formData.location}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </FormField>

      <div style={{ margin: '8px 0', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
        <button 
          type="button" 
          onClick={() => setShowAdditional(!showAdditional)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-color)', 
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <i className={showAdditional ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"}></i>
          Additional Details
        </button>
      </div>

      {showAdditional && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 12px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormField label="Initial Balance" error={errors.initial_balance} helperText="Money you owed BEFORE using the app.">
              <Input 
                type="number"
                step="0.01"
                name="initial_balance"
                placeholder="0.00" 
                value={formData.initial_balance}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Currency" error={errors.initial_balance_currency}>
              <Select 
                name="initial_balance_currency"
                value={formData.initial_balance_currency}
                onChange={handleChange}
                disabled={isSubmitting}
                options={[
                  { label: 'ETB (Birr)', value: 'ETB' },
                  { label: 'USD (Dollar)', value: 'USD' }
                ]}
              />
            </FormField>
          </div>

          <FormField>
            <Checkbox 
              name="is_active"
              label="Active Factory"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting} isLoading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Add Factory'}
        </Button>
      </div>

    </form>
  );
}
