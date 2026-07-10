import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchase } from '../../services/purchaseService.js';
import { Card, Badge, Button, DataTable, Modal } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';

export default function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: purchase, isLoading, isError, error } = usePurchase(id);
  const [selectedItem, setSelectedItem] = useState(null);

  if (isLoading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="ri-loader-4-line spinner-icon" style={{ fontSize: '2rem' }}></i>
        <p style={{ marginTop: '16px' }}>Loading purchase details...</p>
      </div>
    );
  }

  if (isError || !purchase) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--danger-color, #ef4444)' }}>
        <i className="ri-error-warning-line" style={{ fontSize: '3rem' }}></i>
        <h2>Purchase Not Found</h2>
        <p style={{ marginTop: '8px' }}>{error?.message || "The purchase you're looking for doesn't exist or an error occurred."}</p>
        <Button variant="outline" onClick={() => navigate('/purchases')} style={{ marginTop: '16px' }}>
          Back to Purchases
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount, currency = 'ETB') => {
    if (amount === undefined || amount === null) return '-';
    return `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const itemColumns = [
    { key: 'product_name', title: 'Product Name', sortable: false },
    { key: 'item_code', title: 'Item Code', sortable: false },
    { key: 'total_bags_purchased', title: 'Bags Purchased', sortable: false },
    { key: 'pcs_per_bag', title: 'Pieces per Bag', sortable: false },
    { key: 'total_pieces_purchased', title: 'Total Pieces', sortable: false },
    { 
      key: 'purchase_price', 
      title: 'Purchase Price', 
      render: (val, row) => formatCurrency(val, row.currency || purchase.currency) 
    },
    { 
      key: 'price_type', 
      title: 'Price Type', 
      render: (val) => {
        if (val === 'per_piece') return <Badge variant="info">Per Piece</Badge>;
        if (val === 'per_bag') return <Badge variant="primary">Per Bag</Badge>;
        return <Badge variant="default">{val}</Badge>;
      }
    },
    { 
      key: 'total_item_amount', 
      title: 'Total Amount', 
      render: (val, row) => <span style={{ fontWeight: 600 }}>{formatCurrency(val, row.currency || purchase.currency)}</span>
    }
  ];

  const itemActions = [
    {
      icon: 'ri-eye-line',
      label: 'View',
      onClick: (row) => setSelectedItem(row)
    }
  ];

  return (
    <div className="page-container">
      {/* Header Area */}
      <div className="details-header">
        <div className="details-header-left">
          <button className="back-btn" onClick={() => navigate('/purchases')}>
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 className="page-title">Purchase #{purchase.id}</h1>
              <Badge 
                status={
                  purchase.payment_status === 'paid' ? 'success' : 
                  purchase.payment_status === 'partial' ? 'warning' : 'danger'
                }
              >
                {purchase.payment_status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              {purchase.factory_name} • {formatDate(purchase.date)}
            </p>
          </div>
        </div>
        
        <div className="details-header-actions">
          <Button variant="outline" leftIcon="ri-money-dollar-circle-line" onClick={() => {}}>
            Edit Payment
          </Button>
          <Button variant="outline" leftIcon="ri-edit-line" onClick={() => {}}>
            Edit Purchase
          </Button>
          <Button variant="outline" leftIcon="ri-delete-bin-line" className="text-danger" onClick={() => {}}>
            Delete
          </Button>
          <Button variant="primary" leftIcon="ri-add-line" onClick={() => {}}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Detail Cards Layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column (Primary) */}
        <div style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Purchase Information Card */}
          <Card>
            <Card.Header title="Purchase Information" icon="ri-information-line" />
            <Card.Body>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Factory</span>
                  <span className="info-value" style={{ fontWeight: 600 }}>{purchase.factory_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Purchase Date</span>
                  <span className="info-value" style={{ fontWeight: 600 }}>{formatDate(purchase.date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Shipping Code</span>
                  <span className="info-value" style={{ fontWeight: 600 }}>{purchase.shipping_code || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Currency</span>
                  <span className="info-value" style={{ fontWeight: 600 }}>{purchase.currency || 'ETB'}</span>
                </div>
                <div className="info-item" style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '16px' }}>
                  <span className="info-label">Created At</span>
                  <span className="info-value">{formatDateTime(purchase.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Updated At</span>
                  <span className="info-value">{formatDateTime(purchase.updated_at)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Summary Card */}
          <Card>
            <Card.Header title="Payment Summary" icon="ri-wallet-3-line" />
            <Card.Body>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Total Amount</span>
                  <span className="info-value" style={{ fontWeight: 600, fontSize: '1.2rem' }}>
                    {formatCurrency(purchase.total_purchase_amount, purchase.currency)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Amount Paid</span>
                  <span className="info-value" style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--success-color, #10b981)' }}>
                    {formatCurrency(purchase.amount_paid_now, purchase.currency)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unpaid Amount</span>
                  <span className="info-value" style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--danger-color, #ef4444)' }}>
                    {formatCurrency(purchase.unpaid_amount, purchase.currency)}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Notes Card (Conditional) */}
          {purchase.notes && (
            <Card>
              <Card.Header title="Notes" icon="ri-sticky-note-line" />
              <Card.Body>
                <p style={{ 
                  fontSize: '0.95rem', 
                  backgroundColor: 'var(--bg-secondary, #f9fafb)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {purchase.notes}
                </p>
              </Card.Body>
            </Card>
          )}

        </div>

        {/* Right Column (Secondary) */}
        <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Card */}
          <Card>
            <Card.Header title="Purchase Status" icon="ri-shield-check-line" />
            <Card.Body>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Editability</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: purchase.is_fully_editable ? 'var(--success-color, #10b981)' : 'var(--warning-color, #f59e0b)', fontWeight: 600 }}>
                    <i className={purchase.is_fully_editable ? "ri-check-line" : "ri-error-warning-line"}></i>
                    <span>{purchase.is_fully_editable ? 'Fully Editable' : 'Partially Editable'}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Deletion</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: purchase.is_deletable ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)', fontWeight: 600 }}>
                    <i className={purchase.is_deletable ? "ri-check-line" : "ri-close-line"}></i>
                    <span>{purchase.is_deletable ? 'Deletable' : 'Cannot Delete'}</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
        </div>

      </div>

      {/* Purchase Items Section */}
      <div style={{ marginTop: '24px' }}>
        <Card>
          <Card.Header title="Purchase Items" icon="ri-shopping-cart-2-line" />
          <Card.Body noPadding>
            <DataTable 
              columns={itemColumns}
              data={purchase.items || []}
              rowActions={itemActions}
              keyField="id"
              emptyMessage="No items found for this purchase."
            />
          </Card.Body>
        </Card>
      </div>

      {/* Item Details Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        title="Purchase Item Details"
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Card>
              <Card.Header title="Basic Information" icon="ri-information-line" />
              <Card.Body>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Product Name</span>
                    <span className="info-value" style={{ fontWeight: 600 }}>{selectedItem.product_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Item Code</span>
                    <span className="info-value" style={{ fontWeight: 600 }}>{selectedItem.item_code}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Factory</span>
                    <span className="info-value">{selectedItem.factory_name || purchase.factory_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Shipping Code</span>
                    <span className="info-value">{selectedItem.shipping_code || purchase.shipping_code || '-'}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Pricing" icon="ri-price-tag-3-line" />
              <Card.Body>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Price Type</span>
                    <span className="info-value">
                      {selectedItem.price_type === 'per_piece' ? <Badge variant="info">Per Piece</Badge> : 
                       selectedItem.price_type === 'per_bag' ? <Badge variant="primary">Per Bag</Badge> : 
                       <Badge variant="default">{selectedItem.price_type}</Badge>}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purchase Price</span>
                    <span className="info-value" style={{ fontWeight: 600 }}>
                      {formatCurrency(selectedItem.purchase_price, selectedItem.currency || purchase.currency)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cost Per Piece</span>
                    <span className="info-value">
                      {formatCurrency(selectedItem.cost_per_piece, selectedItem.currency || purchase.currency)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Currency</span>
                    <span className="info-value">{selectedItem.currency || purchase.currency}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Packaging" icon="ri-box-3-line" />
              <Card.Body>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Pieces Per Bag</span>
                    <span className="info-value">{selectedItem.pcs_per_bag}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bags Purchased</span>
                    <span className="info-value">{selectedItem.total_bags_purchased}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Pieces Purchased</span>
                    <span className="info-value">{selectedItem.total_pieces_purchased}</span>
                  </div>
                  <div className="info-item" style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '16px' }}>
                    <span className="info-label">Total Item Amount</span>
                    <span className="info-value" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {formatCurrency(selectedItem.total_item_amount, selectedItem.currency || purchase.currency)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Inventory" icon="ri-stack-line" />
              <Card.Body>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Remaining Bags</span>
                    <span className="info-value" style={{ fontWeight: 600, color: selectedItem.remaining_bags > 0 ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)' }}>
                      {selectedItem.remaining_bags}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Remaining Pieces</span>
                    <span className="info-value" style={{ fontWeight: 600, color: selectedItem.remaining_pieces > 0 ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)' }}>
                      {selectedItem.remaining_pieces}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="System" icon="ri-settings-4-line" />
              <Card.Body>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Created At</span>
                    <span className="info-value">{formatDateTime(selectedItem.created_at)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
          </div>
        )}
      </Modal>

    </div>
  );
}
