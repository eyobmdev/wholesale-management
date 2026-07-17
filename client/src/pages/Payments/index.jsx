import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIncome, useUpdateIncome } from '../../hooks/useIncome.js';
import { incomeService } from '../../services/incomeService.js';
import { customerService } from '../../services/customerService.js';
import { DataTable, Card, Button, Modal, FormField, Input, Select, AsyncSelect, TextArea } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('income'); // 'income' or 'factory'
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customer: '',
    date: '',
    paid_amount: '',
    currency: 'ETB',
    payment_method: '',
    notes: ''
  });
  const [editErrors, setEditErrors] = useState({});

  const updateIncomeMutation = useUpdateIncome();

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const activeSort = searchParams.get('ordering') || '-date';

  const filters = {
    customer: searchParams.get('customer') || '',
    payment_method: searchParams.get('payment_method') || '',
    has_sale: searchParams.get('has_sale') || '',
    is_auto: searchParams.get('is_auto') || '',
    receipt_number: searchParams.get('receipt_number') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    min_amount: searchParams.get('min_amount') || '',
    max_amount: searchParams.get('max_amount') || '',
  };

  const queryParams = {
    page,
    search: search || undefined,
    ordering: activeSort || undefined,
    ...(filters.customer ? { customer: filters.customer } : {}),
    ...(filters.payment_method ? { payment_method: filters.payment_method } : {}),
    ...(filters.has_sale ? { has_sale: filters.has_sale } : {}),
    ...(filters.is_auto ? { is_auto: filters.is_auto } : {}),
    ...(filters.receipt_number ? { receipt_number: filters.receipt_number } : {}),
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
    ...(filters.min_amount ? { min_amount: filters.min_amount } : {}),
    ...(filters.max_amount ? { max_amount: filters.max_amount } : {}),
  };

  const { data: incomeData, isLoading: isIncomeLoading } = useIncome(queryParams);

  const formatCurrency = (val, currency = 'ETB') => {
    if (val === undefined || val === null) return '-';
    return `${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatPaymentMethod = (method) => {
    if (!method) return '-';
    const methodMap = {
      'cash': 'Cash',
      'telebirr': 'Telebirr',
      'cbe': 'CBE',
      'cbe_birr': 'CBE Birr',
      'awash': 'Awash Bank',
      'dashen': 'Dashen Bank',
      'abyssinia': 'Bank of Abyssinia',
      'boa': 'Bank of Abyssinia',
      'coop': 'Coop Bank',
      'nib': 'Nib Bank',
      'wegagen': 'Wegagen Bank',
      'zemen': 'Zemen Bank',
      'oromia': 'Oromia Bank',
      'hibret': 'Hibret Bank',
      'amhara': 'Amhara Bank'
    };
    return methodMap[method.toLowerCase()] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  const updateURLParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleFilterChange = (key, val) => {
    updateURLParams({ [key]: val, page: 1 });
  };

  const incomeColumns = [
    { key: 'receipt_number', title: 'Receipt Number', sortable: true },
    { key: 'customer_name', title: 'Customer', sortable: false },
    { 
      key: 'sale_invoice', 
      title: 'Sale Invoice', 
      sortable: false,
      render: (val) => val ? val : '-'
    },
    { 
      key: 'date', 
      title: 'Payment Date', 
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    },
    { 
      key: 'paid_amount', 
      title: 'Paid Amount', 
      sortable: true,
      render: (_, row) => formatCurrency(row.paid_amount, row.currency)
    },
    { 
      key: 'payment_method', 
      title: 'Payment Method', 
      sortable: false,
      render: (val) => formatPaymentMethod(val)
    }
  ];

  const incomeRowActions = [
    {
      icon: 'ri-eye-line',
      label: 'View',
      onClick: (row) => console.log('View income', row.id)
    },
    {
      icon: 'ri-pencil-line',
      label: 'Edit',
      onClick: (row) => {
        setSelectedIncome(row);
        setEditFormData({
          customer: row.customer?.id || row.customer || '',
          date: row.date ? row.date.split('T')[0] : '',
          paid_amount: row.paid_amount || '',
          currency: row.currency || 'ETB',
          payment_method: row.payment_method?.value || row.payment_method || '',
          notes: row.notes || ''
        });
        setEditErrors({});
        setIsEditModalOpen(true);
      }
    },
    {
      icon: 'ri-delete-bin-line',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => console.log('Delete income', row.id)
    }
  ];

  const incomeFilterConfig = [
    {
      key: 'customer',
      type: 'async-select',
      label: 'Customer',
      placeholder: 'All Customers',
      value: filters.customer,
      loadOptions: async (query) => {
        try {
          const res = await customerService.getCustomerOptions(query);
          return Array.isArray(res) ? res : (res.results || []);
        } catch (e) {
          console.error(e);
          return [];
        }
      }
    },
    {
      key: 'payment_method',
      type: 'async-select',
      label: 'Payment Method',
      placeholder: 'All Methods',
      value: filters.payment_method,
      loadOptions: async () => {
        try {
          const res = await incomeService.getPaymentMethodOptions();
          return Array.isArray(res) ? res : (res.results || []);
        } catch (e) {
          console.error(e);
          return [];
        }
      }
    },
    {
      type: 'date-range',
      keyFrom: 'date_from',
      keyTo: 'date_to',
      valueFrom: filters.date_from,
      valueTo: filters.date_to,
      placeholderFrom: 'From Date',
      placeholderTo: 'To Date',
      label: 'Date Range'
    },
    {
      key: 'has_sale',
      type: 'select',
      label: 'Payment Source',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Automatic (Created from Sale)' },
        { value: 'false', label: 'Manual' }
      ],
      value: filters.has_sale
    },
    {
      key: 'is_auto',
      type: 'select',
      label: 'Auto Generated',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ],
      value: filters.is_auto
    },
    {
      key: 'receipt_number',
      type: 'text',
      label: 'Receipt Number',
      placeholder: 'RCP-2026...',
      value: filters.receipt_number
    },
    {
      type: 'number-range',
      keyFrom: 'min_amount',
      keyTo: 'max_amount',
      valueFrom: filters.min_amount,
      valueTo: filters.max_amount,
      placeholderFrom: 'Min Amount',
      placeholderTo: 'Max Amount',
      label: 'Amount Range'
    }
  ];

  const incomeSortConfig = [
    { value: '-date', label: 'Payment Date (Newest)' },
    { value: 'date', label: 'Payment Date (Oldest)' },
    { value: '-paid_amount', label: 'Paid Amount (Highest)' },
    { value: 'paid_amount', label: 'Paid Amount (Lowest)' },
    { value: '-created_at', label: 'Created At (Newest)' },
    { value: 'created_at', label: 'Created At (Oldest)' }
  ];

  const renderIncomeTable = () => (
    <Card>
      <DataTable
        columns={incomeColumns}
        data={incomeData?.results || []}
        isLoading={isIncomeLoading}
        keyField="id"
        
        searchPlaceholder="Search receipt, customer, notes..."
        searchValue={search}
        onSearch={(v) => updateURLParams({ search: v, page: 1 })}
        
        filters={incomeFilterConfig}
        onFilterChange={handleFilterChange}
        
        sortOptions={incomeSortConfig}
        activeSort={activeSort}
        onSortChange={(val) => updateURLParams({ ordering: val, page: 1 })}
        
        rowActions={incomeRowActions}
        toolbarActions={
          <Button variant="primary" leftIcon="ri-add-line" onClick={() => console.log('Record Payment UI Only')}>
            Record Payment
          </Button>
        }
        
        pagination={{
          currentPage: page,
          totalPages: incomeData ? Math.ceil(incomeData.count / 15) : 1,
          totalItems: incomeData?.count || 0,
          onPageChange: (newPage) => updateURLParams({ page: newPage })
        }}
      />
    </Card>
  );

  const renderFactoryPaymentsPlaceholder = () => (
    <Card>
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="ri-tools-fill" style={{ fontSize: '3rem', marginBottom: '16px', display: 'inline-block' }}></i>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-color)', marginBottom: '8px' }}>Under Construction</h3>
        <p>The Factory Payments module is currently being developed and will be available soon.</p>
      </div>
    </Card>
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Payments</h1>
        <p className="page-description">Manage incoming customer payments and outgoing factory payments.</p>
      </div>

      {/* Segmented Switch */}
      <div className="segmented-control" style={{ marginBottom: '24px' }}>
        <button 
          className={`segmented-tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('income');
            setSearchParams(new URLSearchParams()); // Clear URL params when switching tabs
          }}
        >
          <i className="ri-wallet-3-line" style={{ marginRight: '8px' }}></i>
          Customer Income
        </button>
        <button 
          className={`segmented-tab ${activeTab === 'factory' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('factory');
            setSearchParams(new URLSearchParams()); // Clear URL params when switching tabs
          }}
        >
          <i className="ri-building-4-line" style={{ marginRight: '8px' }}></i>
          Factory Payments
        </button>
      </div>

      {activeTab === 'income' ? renderIncomeTable() : renderFactoryPaymentsPlaceholder()}

      {/* Edit Income Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => !updateIncomeMutation.isLoading && setIsEditModalOpen(false)}
        title="Edit Customer Income"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          
          // Basic Validation
          const errors = {};
          if (!editFormData.customer) errors.customer = 'Customer is required';
          if (!editFormData.date) errors.date = 'Date is required';
          if (!editFormData.paid_amount) errors.paid_amount = 'Paid amount is required';
          if (!editFormData.payment_method) errors.payment_method = 'Payment method is required';
          if (Object.keys(errors).length > 0) {
            setEditErrors(errors);
            return;
          }

          const flattenErrors = (errObj) => {
            const result = {};
            if (typeof errObj !== 'object' || errObj === null) return { non_field_errors: errObj };
            for (const [key, val] of Object.entries(errObj)) {
              if (Array.isArray(val)) {
                result[key] = val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
              } else if (typeof val === 'object' && val !== null) {
                const firstVal = Object.values(val)[0];
                result[key] = Array.isArray(firstVal) ? firstVal.join(', ') : JSON.stringify(val);
              } else {
                result[key] = val;
              }
            }
            return result;
          };

          const toastId = showToast.loading('Updating income...');
          updateIncomeMutation.mutate(
            { id: selectedIncome.id, data: editFormData },
            {
              onSuccess: () => {
                showToast.dismiss(toastId);
                showToast.success('Income updated successfully');
                setIsEditModalOpen(false);
              },
              onError: (error) => {
                showToast.dismiss(toastId);
                if (error.response?.data) {
                  setEditErrors(flattenErrors(error.response.data));
                } else {
                  showToast.error('Failed to update income');
                }
              }
            }
          );
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Customer" required error={editErrors.customer}>
              <AsyncSelect
                value={editFormData.customer}
                onChange={(val) => {
                  setEditFormData({ ...editFormData, customer: val });
                  if (editErrors.customer) setEditErrors({ ...editErrors, customer: null });
                }}
                loadOptions={async (query) => {
                  try {
                    const res = await customerService.getCustomerOptions(query);
                    return Array.isArray(res) ? res : (res.results || []);
                  } catch (e) {
                    return [];
                  }
                }}
                placeholder="Select Customer..."
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
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={updateIncomeMutation.isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updateIncomeMutation.isLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
