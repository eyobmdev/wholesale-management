import React, { useState, useEffect } from 'react';
import { Modal, FormField, Input, Select, AsyncSelect, TextArea, Button } from '../../components/common/index.js';
import { useCreateFactoryPayment } from '../../hooks/useFactoryPayments.js';
import { factoryService } from '../../services/factoryService.js';
import { incomeService } from '../../services/incomeService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export function FactoryPaymentCreateModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    factory: '',
    date: new Date().toISOString().split('T')[0],
    paid_amount: '',
    currency: 'ETB',
    payment_method: 'cash',
    reference: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const createPaymentMutation = useCreateFactoryPayment();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        factory: '',
        date: new Date().toISOString().split('T')[0],
        paid_amount: '',
        currency: 'ETB',
        payment_method: 'cash',
        reference: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic Validation
    const validationErrors = {};
    if (!formData.factory) validationErrors.factory = 'Factory is required';
    if (!formData.date) validationErrors.date = 'Date is required';
    if (!formData.paid_amount) validationErrors.paid_amount = 'Paid amount is required';
    if (!formData.payment_method) validationErrors.payment_method = 'Payment method is required';
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const toastId = showToast.loading('Recording factory payment...');
    createPaymentMutation.mutate(formData, {
      onSuccess: () => {
        showToast.dismiss(toastId);
        showToast.success('Factory payment recorded successfully');
        onClose();
      },
      onError: (error) => {
        showToast.dismiss(toastId);
        handleBackendErrors(error, setErrors, 'Failed to record factory payment');
      }
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !createPaymentMutation.isPending && onClose()}
      title="Record Factory Payment"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Factory" required error={errors.factory}>
            <AsyncSelect
              value={formData.factory}
              onChange={(val) => {
                setFormData({ ...formData, factory: val });
                if (errors.factory) setErrors({ ...errors, factory: null });
              }}
              loadOptions={async (query) => {
                try {
                  const res = await factoryService.getFactoryOptions(query);
                  return Array.isArray(res) ? res : (res.results || []);
                } catch (e) {
                  return [];
                }
              }}
              placeholder="Select Factory..."
            />
          </FormField>

          <FormField label="Payment Date" required error={errors.date}>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: null });
              }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Paid Amount" required error={errors.paid_amount}>
              <Input
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) => {
                  setFormData({ ...formData, paid_amount: e.target.value });
                  if (errors.paid_amount) setErrors({ ...errors, paid_amount: null });
                }}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Currency" required error={errors.currency}>
              <Select
                value={formData.currency}
                onChange={(e) => {
                  setFormData({ ...formData, currency: e.target.value });
                  if (errors.currency) setErrors({ ...errors, currency: null });
                }}
                options={[
                  { label: 'ETB', value: 'ETB' },
                  { label: 'USD', value: 'USD' }
                ]}
              />
            </FormField>
          </div>

          <FormField label="Payment Method" required error={errors.payment_method}>
            <AsyncSelect
              value={formData.payment_method}
              onChange={(val) => {
                setFormData({ ...formData, payment_method: val });
                if (errors.payment_method) setErrors({ ...errors, payment_method: null });
              }}
              loadOptions={async () => {
                try {
                  const res = await incomeService.getPaymentMethodOptions();
                  return Array.isArray(res) ? res : (res.results || []);
                } catch (e) {
                  return [];
                }
              }}
              placeholder="Select Payment Method..."
            />
          </FormField>

          <FormField label="Reference" error={errors.reference}>
            <Input
              value={formData.reference}
              onChange={(e) => {
                setFormData({ ...formData, reference: e.target.value });
                if (errors.reference) setErrors({ ...errors, reference: null });
              }}
              placeholder="e.g. CBE-TR-9876543"
            />
          </FormField>

          <FormField label="Notes" error={errors.notes}>
            <TextArea
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) setErrors({ ...errors, notes: null });
              }}
              placeholder="Optional notes..."
              rows={3}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={createPaymentMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createPaymentMutation.isPending}>
              Record Payment
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
