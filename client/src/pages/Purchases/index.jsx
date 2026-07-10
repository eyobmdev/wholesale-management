import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases, useDeletePurchase, purchaseService } from '../../services/purchaseService.js';
import { DataTable, Badge, Button } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';

export default function Purchases() {
  const navigate = useNavigate();
  const deleteMutation = useDeletePurchase();

  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSort, setActiveSort] = useState('-date');
  
  // Filters state
  const [filters, setFilters] = useState({
    factory: '',
    has_unpaid: '',
    is_fully_editable: ''
  });

  // Fetch data
  const queryParams = {
    page,
    search: search || undefined,
    ordering: activeSort || undefined,
    ...(filters.factory ? { factory: filters.factory } : {}),
    ...(filters.has_unpaid !== '' ? { has_unpaid: filters.has_unpaid } : {}),
    ...(filters.is_fully_editable !== '' ? { is_fully_editable: filters.is_fully_editable } : {})
  };

  const { data, isLoading } = usePurchases(queryParams);

  // DataTable Configuration
  const columns = [
    { key: 'factory_name', title: 'Factory', sortable: false },
    { key: 'date', title: 'Purchase Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
    { key: 'shipping_code', title: 'Shipping Code', sortable: false },
    { 
      key: 'total_purchase_amount', 
      title: 'Total Amount', 
      sortable: true,
      render: (val) => `${parseFloat(val || 0).toFixed(2)}`
    },
    { 
      key: 'unpaid_amount', 
      title: 'Unpaid Amount', 
      sortable: true,
      render: (val) => {
        const amt = parseFloat(val || 0);
        return amt > 0 ? <span style={{color: '#ef4444', fontWeight: 500}}>{amt.toFixed(2)}</span> : '0.00';
      }
    },
    { 
      key: 'payment_status', 
      title: 'Payment Status',
      render: (val) => {
        const statusMap = {
          'Unpaid': 'danger',
          'Partial': 'warning',
          'Paid': 'success'
        };
        return <Badge variant={statusMap[val] || 'default'}>{val}</Badge>;
      }
    }
  ];

  const handleDelete = (row) => {
    if (!row.is_deletable) {
      showToast.error('Cannot Delete', 'This purchase has linked payments or is restricted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete this purchase?`)) {
      const toastId = showToast.loading('Deleting purchase...');
      deleteMutation.mutate(row.id, {
        onSuccess: () => {
          showToast.success('Deleted', 'Purchase deleted successfully');
          showToast.dismiss(toastId);
        },
        onError: (err) => {
          showToast.error('Delete Failed', err.message || 'Could not delete purchase');
          showToast.dismiss(toastId);
        }
      });
    }
  };

  const rowActions = [
    {
      icon: 'ri-eye-line',
      label: 'View',
      onClick: (row) => showToast.info('View', 'View Purchase feature coming soon')
    },
    {
      icon: 'ri-edit-line',
      label: 'Edit',
      onClick: (row) => {
        if (!row.is_fully_editable) {
          showToast.warning('Restricted', 'This purchase cannot be fully edited because it has active items or payments.');
          return;
        }
        showToast.info('Edit', 'Edit Purchase feature coming soon');
      }
    },
    {
      icon: 'ri-delete-bin-line',
      label: 'Delete',
      variant: 'danger',
      onClick: handleDelete
    }
  ];

  const filterConfig = [
    {
      key: 'factory',
      type: 'async-select',
      placeholder: 'All Factories',
      value: filters.factory,
      loadOptions: async (query) => {
        // We use the raw service function to decouple from the React lifecycle here
        try {
          const res = await purchaseService.getFactoryOptions(query);
          // Backend returns standard {value, label} objects per the instructions
          return Array.isArray(res) ? res : (res.results || []);
        } catch (e) {
          console.error(e);
          return [];
        }
      }
    },
    {
      key: 'has_unpaid',
      placeholder: 'Payment Status',
      value: filters.has_unpaid,
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Has Unpaid', value: 'true' },
        { label: 'Fully Paid', value: 'false' }
      ]
    },
    {
      key: 'is_fully_editable',
      placeholder: 'Editable',
      value: filters.is_fully_editable,
      options: [
        { label: 'All', value: '' },
        { label: 'Fully Editable', value: 'true' },
        { label: 'Restricted', value: 'false' }
      ]
    }
  ];

  const sortConfig = [
    { label: 'Date (Newest)', value: '-date' },
    { label: 'Date (Oldest)', value: 'date' },
    { label: 'Total Amount (Highest)', value: '-total_purchase_amount' },
    { label: 'Total Amount (Lowest)', value: 'total_purchase_amount' },
    { label: 'Unpaid Amount (Highest)', value: '-unpaid_amount' },
    { label: 'Created (Newest)', value: '-created_at' }
  ];

  // Handlers
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleSortChange = (val) => {
    setActiveSort(val);
    setPage(1);
  };

  const handleNewPurchase = () => {
    showToast.info('New', 'Create Purchase feature coming soon');
  };

  // Pagination config
  const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;

  return (
    <div className="middle-class">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Purchases</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage inventory purchases and supplier invoices</p>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        
        searchPlaceholder="Search purchases..."
        searchValue={search}
        onSearch={handleSearch}
        
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        
        sortOptions={sortConfig}
        activeSort={activeSort}
        onSortChange={handleSortChange}
        
        toolbarActions={
          <Button variant="primary" leftIcon="ri-add-line" onClick={handleNewPurchase}>
            Create Purchase
          </Button>
        }
        
        rowActions={rowActions}
        
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: (newPage) => setPage(newPage)
        }}
      />
    </div>
  );
}
