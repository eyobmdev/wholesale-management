import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIncome } from '../../hooks/useIncome.js';
import { customerService } from '../../services/customerService.js';
import { DataTable, Card, Button } from '../../components/common/index.js';

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('income'); // 'income' or 'factory'

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const activeSort = searchParams.get('ordering') || '-date';

  const filters = {
    customer: searchParams.get('customer') || '',
    payment_method: searchParams.get('payment_method') || '',
    is_auto: searchParams.get('is_auto') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    min_amount: searchParams.get('min_amount') || '',
  };

  const queryParams = {
    page,
    search: search || undefined,
    ordering: activeSort || undefined,
    ...(filters.customer ? { customer: filters.customer } : {}),
    ...(filters.payment_method ? { payment_method: filters.payment_method } : {}),
    ...(filters.is_auto ? { is_auto: filters.is_auto } : {}),
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
    ...(filters.min_amount ? { min_amount: filters.min_amount } : {}),
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
      onClick: (row) => console.log('Edit income', row.id)
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
      type: 'select',
      label: 'Payment Method',
      options: [
        { value: '', label: 'All Methods' },
        { value: 'cash', label: 'Cash' },
        { value: 'telebirr', label: 'Telebirr' },
        { value: 'cbe', label: 'CBE' },
        { value: 'awash', label: 'Awash Bank' },
        { value: 'dashen', label: 'Dashen Bank' },
        { value: 'abyssinia', label: 'Bank of Abyssinia' }
      ],
      value: filters.payment_method
    },
    {
      key: 'is_auto',
      type: 'select',
      label: 'Payment Type',
      options: [
        { value: '', label: 'All Payments' },
        { value: 'true', label: 'Auto (From Sale)' },
        { value: 'false', label: 'Manual' }
      ],
      value: filters.is_auto
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
      key: 'min_amount',
      type: 'number',
      label: 'Minimum Amount',
      placeholder: 'Min Amount...',
      value: filters.min_amount
    }
  ];

  const incomeSortConfig = [
    { value: '-date', label: 'Newest First' },
    { value: 'date', label: 'Oldest First' },
    { value: '-paid_amount', label: 'Largest Payment' },
    { value: 'paid_amount', label: 'Smallest Payment' },
    { value: 'receipt_number', label: 'Receipt No. (A-Z)' },
    { value: '-receipt_number', label: 'Receipt No. (Z-A)' }
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
    </div>
  );
}
