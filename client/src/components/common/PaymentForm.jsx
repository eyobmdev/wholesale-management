import React, { useState } from 'react';
import { FormField, Input, Select, Button, TextArea } from './index.js';
import { usePaymentMethods, useCreateIncome, useCreateFactoryPayment } from '../../services/paymentService.js';
import { showToast } from '../../utils/toast.js';

const getTodayString = () => new Date().toISOString().split('T')[0];

export const PaymentForm = ({ entityIdKey, entityId, onSuccess, onCancel }) => {
  const { data: paymentMethodsResponse, isLoading: isLoadingMethods, error: methodsError } = usePaymentMethods();
  const createIncomeMutation = useCreateIncome();
  const createFactoryPaymentMutation = useCreateFactoryPayment();
  const createMutation = entityIdKey === 'factory' ? createFactoryPaymentMutation : createIncomeMutation;
  const isSubmitting = createMutation.isLoading;

  const [showAdditional, setShowAdditional] = useState(false);
  const [errors, setErrors] = useState({});

  // Payment methods are typically returned as an array or paginated object, let's map them
  const paymentMethods = Array.isArray(paymentMethodsResponse) 
    ? paymentMethodsResponse 
    : paymentMethodsResponse?.results || [];

  const [formData, setFormData] = useState({
    date: getTodayString(),
    paid_amount: '',
    currency: 'ETB',
    payment_method: 'cash', // Default to lowercase value
    reference: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
      newErrors.paid_amount = 'A valid positive amount is required';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Attach the generic entity ID (e.g. { customer: 1 } or { factory: 3 })
    const payload = {
      ...formData,
      paid_amount: parseFloat(formData.paid_amount),
      [entityIdKey]: entityId
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast.success('Payment Recorded', 'Payment has been successfully recorded.');
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        const data = err.response?.data;
        if (data && typeof data === 'object') {
          const newErrors = {};
          Object.keys(data).forEach(key => {
            newErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
          });
          setErrors(newErrors);
        } else {
          showToast.error('Error', err.message || 'An error occurred while recording payment.');
        }
      }
    });
  };

  if (isLoadingMethods) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
        <i className="ri-loader-4-line spinner-icon" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
      </div>
    );
  }

  if (methodsError) {
    return (
      <div style={{ padding: '16px', color: '#ef4444', textAlign: 'center' }}>
        Failed to load payment methods. Please try again.
      </div>
    );
  }

  const methodOptions = paymentMethods.map(m => ({
    label: m.label || m.name || m.value, // Fallback gracefully depending on backend schema
    value: m.value || m.name || m.id
  }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <FormField label="Paid Amount" required error={errors.paid_amount}>
          <Input 
            type="number"
            step="0.01"
            name="paid_amount"
            placeholder="0.00" 
            value={formData.paid_amount}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Payment Date" required error={errors.date}>
          <Input 
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FormField>
      </div>

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
            <FormField label="Payment Method" required error={errors.payment_method}>
              <Select 
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                disabled={isSubmitting}
                options={methodOptions}
              />
            </FormField>

            <FormField label="Currency" error={errors.currency}>
              <Select 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                disabled={isSubmitting}
                options={[
                  { label: 'ETB (Birr)', value: 'ETB' },
                  { label: 'USD (Dollar)', value: 'USD' }
                ]}
              />
            </FormField>
          </div>

          <FormField label="Reference (e.g. Check Number, Transfer ID)" error={errors.reference}>
            <Input 
              name="reference"
              placeholder="Ref #..."
              value={formData.reference}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Notes" error={errors.notes}>
            <TextArea 
              name="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
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
          Record Payment
        </Button>
      </div>
    </form>
  );
};
