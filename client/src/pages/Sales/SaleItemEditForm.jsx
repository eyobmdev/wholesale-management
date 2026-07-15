import React, { useState, useEffect } from 'react';
import { FormField, Input, AsyncSelect, Button } from '../../components/common/index.js';
import { useUpdateSaleItem } from '../../hooks/useSales.js';
import { saleService } from '../../services/saleService.js';
import { showToast } from '../../utils/toast.js';
import { handleBackendErrors } from '../../utils/errorHandler.js';

export default function SaleItemEditForm({ item, saleId, onClose }) {
  const updateMutation = useUpdateSaleItem();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    sale: saleId,
    stock_batch: '',
    bags_sold: '',
    sell_price_type: 'per_piece',
    selling_price: ''
  });

  // State to hold the current selected stock batch label for AsyncSelect
  const [stockBatchLabel, setStockBatchLabel] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        sale: saleId,
        stock_batch: item.stock_batch || '',
        bags_sold: item.bags_sold || '',
        sell_price_type: item.sell_price_type || 'per_piece',
        selling_price: item.selling_price || ''
      });
      // Set initial label. It might be provided in the item data or we can just show the ID initially
      // For a better UX, backend should ideally return a display string, but we'll try to use what we have.
      setStockBatchLabel(item.stock_batch_display || `Batch #${item.stock_batch}`);
    }
  }, [item, saleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleStockBatchChange = (value) => {
    setFormData(prev => ({
      ...prev,
      stock_batch: value
    }));
    if (errors.stock_batch) {
      setErrors(prev => ({ ...prev, stock_batch: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validation as requested
    const newErrors = {};
    if (!formData.stock_batch) newErrors.stock_batch = 'Stock Batch is required.';
    if (!formData.sell_price_type) newErrors.sell_price_type = 'Sell Price Type is required.';
    if (parseFloat(formData.bags_sold) <= 0 || !formData.bags_sold) newErrors.bags_sold = 'Bags Sold must be greater than 0.';
    if (parseFloat(formData.selling_price) <= 0 || !formData.selling_price) newErrors.selling_price = 'Selling Price must be greater than 0.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast.error('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    const toastId = showToast.loading('Saving sale item...');
    
    const payload = {
      ...formData,
      sale: saleId,
      bags_sold: parseFloat(formData.bags_sold),
      selling_price: parseFloat(formData.selling_price)
    };

    updateMutation.mutate({ id: item.id, data: payload }, {
      onSuccess: () => {
        showToast.success('Saved', 'Sale item updated successfully');
        showToast.dismiss(toastId);
        onClose();
      },
      onError: (err) => {
        showToast.dismiss(toastId);
        handleBackendErrors(err, setErrors, 'Failed to update sale item');
      }
    });
  };

  // Helper function to fetch stock options
  const fetchStockOptions = async (query) => {
    try {
      const res = await saleService.getStockOptions(query);
      return Array.isArray(res) ? res : (res.results || []);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="common-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
      
      {(errors.message || errors.non_field_errors) && (
        <div className="form-error-alert">
          <i className="ri-error-warning-line"></i>
          <span>{errors.message || errors.non_field_errors}</span>
        </div>
      )}

      <FormField label="Stock Batch" required error={errors.stock_batch}>
        <AsyncSelect
          loadOptions={fetchStockOptions}
          value={formData.stock_batch}
          onChange={handleStockBatchChange}
          placeholder="Search stock batches..."
          error={errors.stock_batch}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField label="Bags Sold" required error={errors.bags_sold}>
          <Input
            type="number"
            name="bags_sold"
            value={formData.bags_sold}
            onChange={handleChange}
            error={errors.bags_sold}
            min="0.01"
            step="0.01"
            required
          />
        </FormField>

        <FormField label="Selling Price" required error={errors.selling_price}>
          <Input
            type="number"
            name="selling_price"
            value={formData.selling_price}
            onChange={handleChange}
            error={errors.selling_price}
            min="0.01"
            step="0.01"
            required
          />
        </FormField>
      </div>

      <FormField label="Sell Price Type" required error={errors.sell_price_type}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
            <input
              type="radio"
              name="sell_price_type"
              value="per_piece"
              checked={formData.sell_price_type === 'per_piece'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
            />
            Per Piece
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
            <input
              type="radio"
              name="sell_price_type"
              value="per_bag"
              checked={formData.sell_price_type === 'per_bag'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
            />
            Per Bag
          </label>
        </div>
        {errors.sell_price_type && (
          <div className="field-error-message" style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '6px' }}>
            {errors.sell_price_type}
          </div>
        )}
      </FormField>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={updateMutation.isLoading} isLoading={updateMutation.isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
