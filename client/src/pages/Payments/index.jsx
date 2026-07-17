import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useIncome, useUpdateIncome, useDeleteIncome } from '../../hooks/useIncome.js';
import { incomeService } from '../../services/incomeService.js';
import { DataTable, Card, Button, ConfirmationDialog } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';
import { IncomeEditModal } from './IncomeEditModal.jsx';

export default function Payments() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('income'); // 'income' or 'factory'
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);

  const deleteIncomeMutation = useDeleteIncome();

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
      onClick: (row) => navigate(`/payments/income/${row.id}`)
    },
    {
      icon: 'ri-pencil-line',
      label: 'Edit',
      onClick: (row) => {
        setSelectedIncome(row);
        setIsEditModalOpen(true);
      }
    },
    {
      icon: 'ri-delete-bin-line',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => {
        setIncomeToDelete(row);
        setIsDeleteDialogOpen(true);
      }
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

      <IncomeEditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedIncome(null);
        }}
        income={selectedIncome}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Payment"
        message={`Are you sure you want to delete payment ${incomeToDelete?.receipt_number || ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger={true}
        isConfirming={deleteIncomeMutation.isPending}
        onConfirm={() => {
          const toastId = showToast.loading('Deleting payment...');
          deleteIncomeMutation.mutate(incomeToDelete.id, {
            onSuccess: () => {
              showToast.dismiss(toastId);
              showToast.success('Payment deleted successfully');
              setIsDeleteDialogOpen(false);
              setIncomeToDelete(null);
            },
            onError: (err) => {
              showToast.dismiss(toastId);
              showToast.error(err.response?.data?.detail || 'Failed to delete payment');
              setIsDeleteDialogOpen(false);
            }
          });
        }}
        onClose={() => {
          if (!deleteIncomeMutation.isPending) {
            setIsDeleteDialogOpen(false);
            setIncomeToDelete(null);
          }
        }}
      />
    </div>
  );
}
