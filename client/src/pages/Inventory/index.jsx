import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInventory } from '../../hooks/useInventory.js';
import { factoryService } from '../../services/factoryService.js';
import { DataTable, Card } from '../../components/common/index.js';

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const activeSort = searchParams.get('ordering') || '-purchase__date';

  const filters = {
    factory: searchParams.get('factory') || '',
    is_low_stock: searchParams.get('is_low_stock') || '',
    is_sold_out: searchParams.get('is_sold_out') || ''
  };

  const queryParams = {
    page,
    search: search || undefined,
    ordering: activeSort || undefined,
    ...(filters.factory ? { factory: filters.factory } : {}),
    ...(filters.is_low_stock !== '' ? { is_low_stock: filters.is_low_stock } : {}),
    ...(filters.is_sold_out !== '' ? { is_sold_out: filters.is_sold_out } : {})
  };

  const { data, isLoading } = useInventory(queryParams);

  const formatCurrency = (val) => val ? parseFloat(val).toFixed(2) : '0.00';

  const formatRemainingStock = (row) => {
    const bags = parseFloat(row.remaining_bags || 0);
    const pcs = parseInt(row.remaining_pieces || 0);
    const bagText = bags === 1 ? '1 Bag' : `${bags} Bags`;
    return `${bagText} (${pcs} pcs)`;
  };

  const columns = [
    { key: 'product_name', title: 'Product Name', sortable: true },
    { key: 'item_code', title: 'Item Code', sortable: true },
    { key: 'factory_name', title: 'Factory', sortable: false },
    { key: 'shipping_code', title: 'Shipping Code', sortable: true },
    { 
      key: 'remaining_stock', 
      title: 'Remaining Stock', 
      sortable: false,
      render: (_, row) => formatRemainingStock(row)
    },
    { 
      key: 'stock_value', 
      title: 'Stock Value', 
      sortable: true,
      render: (val) => formatCurrency(val)
    }
  ];

  const rowActions = [
    {
      icon: 'ri-eye-line',
      label: 'View',
      onClick: (row) => navigate(`/inventory/${row.id}`)
    }
  ];

  const filterConfig = [
    {
      key: 'factory',
      type: 'async-select',
      label: 'Factory',
      placeholder: 'All Factories',
      value: filters.factory,
      loadOptions: async (query) => {
        try {
          const res = await factoryService.getFactoryOptions(query);
          return Array.isArray(res) ? res : (res.results || []);
        } catch (e) {
          console.error(e);
          return [];
        }
      }
    },
    {
      key: 'is_low_stock',
      type: 'select',
      label: 'Low Stock',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Low Stock Only' },
        { value: 'false', label: 'Adequate Stock' }
      ],
      value: filters.is_low_stock
    },
    {
      key: 'is_sold_out',
      type: 'select',
      label: 'Sold Out',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Sold Out Only' },
        { value: 'false', label: 'In Stock' }
      ],
      value: filters.is_sold_out
    }
  ];

  const sortConfig = [
    { value: 'product_name', label: 'Product Name (A-Z)' },
    { value: '-product_name', label: 'Product Name (Z-A)' },
    { value: '-stock_value', label: 'Stock Value (High to Low)' },
    { value: 'stock_value', label: 'Stock Value (Low to High)' },
    { value: '-_remaining_bags', label: 'Remaining Bags (High to Low)' },
    { value: '_remaining_bags', label: 'Remaining Bags (Low to High)' },
    { value: '-purchase__date', label: 'Purchase Date (Newest)' },
    { value: 'purchase__date', label: 'Purchase Date (Oldest)' },
    { value: '-created_at', label: 'Recently Created' },
    { value: 'created_at', label: 'Oldest Created' }
  ];

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

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Inventory</h1>
        <p className="page-description">Manage stock levels, tracking, and valuation.</p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          keyField="id"
          
          searchPlaceholder="Search product, item code, shipping..."
          searchValue={search}
          onSearch={(v) => updateURLParams({ search: v, page: 1 })}
          
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          
          sortOptions={sortConfig}
          activeSort={activeSort}
          onSortChange={(val) => updateURLParams({ ordering: val, page: 1 })}
          
          rowActions={rowActions}
          
          pagination={{
            currentPage: page,
            totalPages: data ? Math.ceil(data.count / 15) : 1, // Assuming page size 15 from settings
            totalItems: data?.count || 0,
            onPageChange: (newPage) => updateURLParams({ page: newPage })
          }}
        />
      </Card>
    </div>
  );
}
