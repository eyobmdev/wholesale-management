import React, { useState, useEffect } from 'react';
import { Modal, FormField, Input, Select, AsyncSelect, TextArea, Button } from '../../components/common/index.js';
import { useUpdateFactoryPayment } from '../../hooks/useFactoryPayments.js';
import { factoryService } from '../../services/factoryService.js';
import { incomeService } from '../../services/incomeService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export function FactoryPaymentEditModal({ isOpen, onClose, payment }) {
  const [editFormData, setEditFormData] = useState({
    factory: '',
    date: '',
    paid_amount: '',
    currency: 'ETB',
    payment_method: '',
    notes: ''
  });
  const [editErrors, setEditErrors] = useState({});

  const updatePaymentMutation = useUpdateFactoryPayment();

  useEffect(() => {
    if (isOpen && payment) {
      setEditFormData({
        factory: payment.factory?.id || payment.factory || '',
        date: payment.date ? payment.date.split('T')[0] : '',
        paid_amount: payment.paid_amount || '',
        currency: payment.currency || 'ETB',
        payment_method: payment.payment_method?.value || payment.payment_method || '',
        notes: payment.notes || ''
      });
      setEditErrors({});
    }
  }, [isOpen, payment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic Validation
    const errors = {};
    if (!editFormData.factory) errors.factory = 'Factory is required';
    if (!editFormData.date) errors.date = 'Date is required';
    if (!editFormData.paid_amount) errors.paid_amount = 'Paid amount is required';
    if (!editFormData.payment_method) errors.payment_method = 'Payment method is required';
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const toastId = showToast.loading('Updating factory payment...');
    updatePaymentMutation.mutate(
      { id: payment.id, data: editFormData },
      {
        onSuccess: () => {
          showToast.dismiss(toastId);
          showToast.success('Factory payment updated successfully');
          onClose();
        },
        onError: (error) => {
          showToast.dismiss(toastId);
          handleBackendErrors(error, setEditErrors, 'Failed to update factory payment');
        }
      }
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !updatePaymentMutation.isPending && onClose()}
      title="Edit Factory Payment"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Factory" required error={editErrors.factory}>
            <AsyncSelect
              value={editFormData.factory}
              onChange={(val) => {
                setEditFormData({ ...editFormData, factory: val });
                if (editErrors.factory) setEditErrors({ ...editErrors, factory: null });
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

          <FormField label="Payment Date" required error={editErrors.date}>
            <Input
              type="date"
              value={editFormData.date}
              onChange={(e) => {
                setEditFormData({ ...editFormData, date: e.target.value });
                if (editErrors.date) setEditErrors({ ...editErrors, date: null });
              }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Paid Amount" required error={editErrors.paid_amount}>
              <Input
                type="number"
                step="0.01"
                value={editFormData.paid_amount}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, paid_amount: e.target.value });
                  if (editErrors.paid_amount) setEditErrors({ ...editErrors, paid_amount: null });
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={updatePaymentMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updatePaymentMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
