import React, { useState, useEffect } from 'react';
import { Input, Button, Select, AsyncSelect } from '../index.js';
import './DataTable.css';

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
            
            {filters.map((filter) => (
              <div key={filter.key} className="data-table-filter" style={{ minWidth: filter.type === 'async-select' ? '200px' : 'auto' }}>
                {filter.type === 'async-select' ? (
                  <AsyncSelect
                    value={filter.value}
                    onChange={(val) => onFilterChange && onFilterChange(filter.key, val)}
                    loadOptions={filter.loadOptions}
                    placeholder={filter.placeholder}
                  />
                ) : (
                  <Select
                    value={filter.value}
                    onChange={(e) => onFilterChange && onFilterChange(filter.key, e.target.value)}
                    options={filter.options}
                    placeholder={filter.placeholder}
                  />
                )}
              </div>
            ))}

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
    </div>
  );
};
