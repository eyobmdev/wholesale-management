import React, { useState, useEffect } from 'react';
import { Modal, FormField, Input, Select, AsyncSelect, TextArea, Button } from '../../components/common/index.js';
import { useCreateExpense } from '../../hooks/useExpenses.js';
import { incomeService } from '../../services/incomeService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export function ExpenseCreateModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    currency: 'ETB',
    payment_method: 'cash',
    reference: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const createExpenseMutation = useCreateExpense();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
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
    if (!formData.date) validationErrors.date = 'Date is required';
    if (!formData.description) validationErrors.description = 'Description is required';
    if (!formData.amount) validationErrors.amount = 'Amount is required';
    if (!formData.payment_method) validationErrors.payment_method = 'Payment method is required';
    
    // Convert amount to number and check if > 0
    const numericAmount = parseFloat(formData.amount);
    if (formData.amount && (isNaN(numericAmount) || numericAmount <= 0)) {
      validationErrors.amount = 'Amount must be greater than zero';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const toastId = showToast.loading('Recording expense...');
    createExpenseMutation.mutate(formData, {
      onSuccess: () => {
        showToast.dismiss(toastId);
        showToast.success('Expense recorded successfully');
        onClose();
      },
      onError: (error) => {
        showToast.dismiss(toastId);
        handleBackendErrors(error, setErrors, 'Failed to record expense');
      }
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !createExpenseMutation.isPending && onClose()}
      title="Record Expense"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <FormField label="Date" required error={errors.date}>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: null });
              }}
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              placeholder="Expense description..."
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Amount" required error={errors.amount}>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (errors.amount) setErrors({ ...errors, amount: null });
                }}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Currency" error={errors.currency}>
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
              placeholder="e.g. REC-4567"
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
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={createExpenseMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createExpenseMutation.isPending}>
              Record Expense
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
