import React, { useState, useEffect } from 'react';
import { Input, Button, Select, AsyncSelect, Modal } from '../index.js';
import './DataTable.css';

const TableFilter = ({ filter, onFilterChange }) => {
  const { type, key, value, options, placeholder, loadOptions, keyFrom, keyTo, valueFrom, valueTo, placeholderFrom, placeholderTo } = filter;
  
  if (type === 'async-select') {
    return (
      <div className="data-table-filter" style={{ minWidth: '200px' }}>
        <AsyncSelect
          value={value}
          onChange={(val) => onFilterChange(key, val)}
          loadOptions={loadOptions}
          placeholder={placeholder}
        />
      </div>
    );
  }

  if (type === 'date-range' || type === 'number-range') {
    const inputType = type === 'date-range' ? 'date' : 'number';
    return (
      <div className="data-table-filter" style={{ display: 'flex', gap: '8px', minWidth: '250px' }}>
        <Input 
          type={inputType}
          value={valueFrom}
          onChange={(e) => onFilterChange(keyFrom, e.target.value)}
          placeholder={placeholderFrom || 'From'}
        />
        <Input 
          type={inputType}
          value={valueTo}
          onChange={(e) => onFilterChange(keyTo, e.target.value)}
          placeholder={placeholderTo || 'To'}
        />
      </div>
    );
  }

  if (type === 'date' || type === 'number') {
    return (
      <div className="data-table-filter">
        <Input 
          type={type}
          value={value}
          onChange={(e) => onFilterChange(key, e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Default Select
  return (
    <div className="data-table-filter">
      <Select
        value={value}
        onChange={(e) => onFilterChange(key, e.target.value)}
        options={options}
        placeholder={placeholder}
      />
    </div>
  );
};


export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records found.",
  
  // Search / Toolbar
  onSearch,
  searchValue = '',
  searchPlaceholder = "Search...",
  toolbarActions,
  
  // Advanced Toolbar
  filters = [],
  onFilterChange,
  sortOptions = [],
  activeSort = '',
  onSortChange,
  
  // Pagination
  pagination,
  
  // Row Actions
  rowActions = [],
  
  // Sorting (optional)
  onSort,
  sortColumn,
  sortDirection = 'asc',
}) => {

  const [localSearch, setLocalSearch] = useState(searchValue);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync external search value changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && localSearch !== searchValue) {
        onSearch(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch, searchValue]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Filter Chips Logic
  const activeFilters = filters.reduce((acc, filter) => {
    if (filter.type === 'date-range' || filter.type === 'number-range') {
      if (filter.valueFrom) {
        acc.push({ key: filter.keyFrom, label: `${filter.placeholderFrom || 'From'}: ${filter.valueFrom}` });
      }
      if (filter.valueTo) {
        acc.push({ key: filter.keyTo, label: `${filter.placeholderTo || 'To'}: ${filter.valueTo}` });
      }
    } else if (filter.value) {
      // Find label if it's a standard select
      let displayLabel = filter.value;
      if (filter.options) {
        const opt = filter.options.find(o => o.value === filter.value);
        if (opt && opt.label !== 'All') displayLabel = opt.label;
      }
      acc.push({ key: filter.key, label: displayLabel });
    }
    return acc;
  }, []);

  const clearAllFilters = () => {
    filters.forEach(filter => {
      if (filter.type === 'date-range' || filter.type === 'number-range') {
        if (filter.valueFrom) onFilterChange(filter.keyFrom, '');
        if (filter.valueTo) onFilterChange(filter.keyTo, '');
      } else {
        if (filter.value) onFilterChange(filter.key, '');
      }
    });
  };

  const exceedsFilterThreshold = filters.length > 3;

  return (
    <div className="data-table-container">
      
      {/* Toolbar Area */}
      {(onSearch || toolbarActions || filters.length > 0 || sortOptions.length > 0) && (
        <div className="data-table-toolbar">
          <div className="data-table-toolbar-left">
            {onSearch && (
              <div className="data-table-search">
                <Input 
                  leftIcon="ri-search-line" 
                  placeholder={searchPlaceholder} 
                  value={localSearch}
                  onChange={handleSearchChange}
                />
              </div>
            )}
            
            {filters.length > 0 && !exceedsFilterThreshold && filters.map((filter, index) => (
              <TableFilter 
                key={filter.key || filter.keyFrom || index}
                filter={filter}
                onFilterChange={onFilterChange}
              />
            ))}

            {exceedsFilterThreshold && (
              <Button 
                variant="outline" 
                leftIcon="ri-filter-3-line"
                onClick={() => setIsFilterModalOpen(true)}
              >
                Filters {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
              </Button>
            )}

            {sortOptions.length > 0 && (
              <div className="data-table-sort">
                <Select
                  value={activeSort}
                  onChange={(e) => onSortChange && onSortChange(e.target.value)}
                  options={sortOptions}
                  placeholder="Sort by..."
                />
              </div>
            )}
          </div>
          
          <div className="data-table-actions">
            {toolbarActions}
          </div>
        </div>
      )}

      {/* Table Wrapper for Responsive Scrolling */}
      <div className="table-responsive-wrapper">
        <table className="common-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={col.key || index} 
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'is-sortable' : ''}
                  style={col.width ? { width: col.width } : {}}
                >
                  <div className="th-content">
                    {col.title}
                    {col.sortable && sortColumn === col.key && (
                      <i className={sortDirection === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i>
                    )}
                  </div>
                </th>
              ))}
              
              {rowActions.length > 0 && (
                <th className="actions-column">Actions</th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)} className="table-loading-state">
                  <i className="ri-loader-4-line spinner-icon"></i> Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)} className="table-empty-state">
                  <div className="empty-state-content">
                    <i className="ri-inbox-line"></i>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  
                  {rowActions.length > 0 && (
                    <td className="actions-column">
                      <div className="row-actions">
                        {rowActions.map((action, actionIndex) => (
                          <button 
                            key={actionIndex}
                            className={`row-action-btn ${action.variant ? `text-${action.variant}` : ''}`}
                            onClick={() => action.onClick(row)}
                            title={action.label}
                          >
                            {action.icon && <i className={action.icon}></i>}
                            {!action.icon && action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Area */}
      {pagination && pagination.totalPages > 1 && (
        <div className="data-table-pagination">
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="pagination-controls">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage <= 1 || isLoading}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              leftIcon="ri-arrow-left-s-line"
            >
              Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage >= pagination.totalPages || isLoading}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              rightIcon="ri-arrow-right-s-line"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Filter Modal for excess filters */}
      {exceedsFilterThreshold && (
        <Modal 
          isOpen={isFilterModalOpen} 
          onClose={() => setIsFilterModalOpen(false)}
          title="Advanced Filters"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filters.map((filter, index) => (
              <div key={filter.key || filter.keyFrom || index}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-color)' }}>
                  {filter.placeholder || filter.placeholderFrom || 'Filter'}
                </label>
                <TableFilter 
                  filter={filter}
                  onFilterChange={onFilterChange}
                />
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button variant="outline" onClick={() => {
                clearAllFilters();
                setIsFilterModalOpen(false);
              }}>
                Clear All
              </Button>
              <Button variant="primary" onClick={() => setIsFilterModalOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
