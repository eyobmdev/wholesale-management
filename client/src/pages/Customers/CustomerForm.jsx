import React, { useState } from 'react';
import { FormField, Input, Checkbox, Select, Button } from '../../components/common/index.js';
import { useCreateCustomer, useUpdateCustomer } from '../../services/customerService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function CustomerForm({ initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  const [showAdditional, setShowAdditional] = useState(false);
  
  // Default values
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    opening_date: initialData?.opening_date || getTodayString(),
    initial_credit: initialData?.initial_credit || '',
    initial_credit_currency: initialData?.initial_credit_currency || 'ETB',
    is_active: initialData !== undefined ? initialData.is_active : true,
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
    if (!formData.opening_date) newErrors.opening_date = 'Opening date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getChangedFields = () => {
    if (!isEdit) return formData;
    
    const changed = {};
    Object.keys(formData).forEach(key => {
      // Handle numeric fields
      if (key === 'initial_credit') {
        const currentVal = formData[key] === '' ? 0 : parseFloat(formData[key]);
        const initialVal = initialData[key] === null || initialData[key] === '' ? 0 : parseFloat(initialData[key]);
        if (currentVal !== initialVal && !isNaN(currentVal)) {
          changed[key] = currentVal;
        }
        return;
      }
      
      // Basic strict inequality check
      if (formData[key] !== initialData[key]) {
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
            showToast.success('Success', 'Customer updated successfully');
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            handleBackendErrors(err, setErrors, 'Update Failed');
          }
        }
      );
    } else {
      const payload = { ...formData };
      payload.initial_credit = payload.initial_credit === '' ? 0 : parseFloat(payload.initial_credit);
      
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast.success('Success', 'Customer created successfully');
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
      
      {/* Primary Details */}
      <FormField label="Name" required error={errors.name}>
        <Input 
          name="name"
          placeholder="e.g. Kebede Wholesale Shop" 
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </FormField>

      <div style={{ display: 'flex', gap: '16px' }}>
        <FormField label="Phone Number" error={errors.phone}>
          <Input 
            name="phone"
            placeholder="0911..." 
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Opening Date" required error={errors.opening_date}>
          <Input 
            type="date"
            name="opening_date"
            value={formData.opening_date}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      <FormField label="Location" error={errors.location}>
        <Input 
          name="location"
          placeholder="e.g. Merkato, Addis Ababa" 
          value={formData.location}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </FormField>

      {/* Additional Details Toggle */}
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

      {/* Collapsible Content */}
      {showAdditional && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 12px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormField label="Initial Credit" error={errors.initial_credit} helperText="Starting balance before any transactions.">
              <Input 
                type="number"
                step="0.01"
                name="initial_credit"
                placeholder="0.00" 
                value={formData.initial_credit}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Currency" error={errors.initial_credit_currency}>
              <Select 
                name="initial_credit_currency"
                value={formData.initial_credit_currency}
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
              label="Active Customer"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      )}

      {/* Form Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting} isLoading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Customer'}
        </Button>
      </div>

    </form>
  );
}
