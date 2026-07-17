import React, { useState, useEffect } from 'react';
import { Modal, FormField, Input, Select, AsyncSelect, TextArea, Button } from '../../components/common/index.js';
import { useUpdateExpense, usePatchExpense } from '../../hooks/useExpenses.js';
import { incomeService } from '../../services/incomeService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export function ExpenseEditModal({ isOpen, onClose, expense, isDetailPage = false }) {
  const [editFormData, setEditFormData] = useState({
    date: '',
    description: '',
    amount: '',
    currency: 'ETB',
    payment_method: '',
    notes: ''
  });
  const [editErrors, setEditErrors] = useState({});

  const updateExpenseMutation = useUpdateExpense();
  const patchExpenseMutation = usePatchExpense();

  useEffect(() => {
    if (isOpen && expense) {
      setEditFormData({
        date: expense.date ? expense.date.split('T')[0] : '',
        description: expense.description || '',
        amount: expense.amount || '',
        currency: expense.currency || 'ETB',
        payment_method: expense.payment_method?.value || expense.payment_method || '',
        notes: expense.notes || ''
      });
      setEditErrors({});
    }
  }, [isOpen, expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic Validation
    const errors = {};
    if (!editFormData.date) errors.date = 'Date is required';
    if (!editFormData.description) errors.description = 'Description is required';
    if (!editFormData.amount) errors.amount = 'Amount is required';
    if (!editFormData.payment_method) errors.payment_method = 'Payment method is required';
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const toastId = showToast.loading('Updating expense...');
    const mutationArgs = {
      onSuccess: () => {
        showToast.dismiss(toastId);
        showToast.success('Expense updated successfully');
        onClose();
      },
      onError: (error) => {
        showToast.dismiss(toastId);
        handleBackendErrors(error, setEditErrors, 'Failed to update expense');
      }
    };

    if (isDetailPage) {
      updateExpenseMutation.mutate({ id: expense.id, data: editFormData }, mutationArgs);
    } else {
      const { notes, ...patchData } = editFormData;
      patchExpenseMutation.mutate({ id: expense.id, data: patchData }, mutationArgs);
    }
  };

  const isPending = updateExpenseMutation.isPending || patchExpenseMutation.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isPending && onClose()}
      title="Edit Expense"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Date" required error={editErrors.date}>
            <Input
              type="date"
              value={editFormData.date}
              onChange={(e) => {
                setEditFormData({ ...editFormData, date: e.target.value });
                if (editErrors.date) setEditErrors({ ...editErrors, date: null });
              }}
            />
          </FormField>

          <FormField label="Payment Method" required error={editErrors.payment_method}>
            <AsyncSelect
              value={editFormData.payment_method}
              onChange={(val) => {
                setEditFormData({ ...editFormData, payment_method: val });
                if (editErrors.payment_method) setEditErrors({ ...editErrors, payment_method: null });
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Amount" required error={editErrors.amount}>
              <Input
                type="number"
                step="0.01"
                value={editFormData.amount}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, amount: e.target.value });
                  if (editErrors.amount) setEditErrors({ ...editErrors, amount: null });
                }}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Currency" required error={editErrors.currency}>
              <Select
                value={editFormData.currency}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, currency: e.target.value });
                  if (editErrors.currency) setEditErrors({ ...editErrors, currency: null });
                }}
                options={[
                  { label: 'ETB', value: 'ETB' },
                  { label: 'USD', value: 'USD' }
                ]}
              />
            </FormField>
          </div>

          <FormField label="Description" required error={editErrors.description}>
            <Input
              type="text"
              value={editFormData.description}
              onChange={(e) => {
                setEditFormData({ ...editFormData, description: e.target.value });
                if (editErrors.description) setEditErrors({ ...editErrors, description: null });
              }}
              placeholder="Expense description..."
            />
          </FormField>

          {isDetailPage && (
            <FormField label="Notes" error={editErrors.notes}>
              <TextArea
                value={editFormData.notes}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, notes: e.target.value });
                  if (editErrors.notes) setEditErrors({ ...editErrors, notes: null });
                }}
                placeholder="Optional notes..."
                rows={3}
              />
            </FormField>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
