import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchase } from '../../services/purchaseService.js';
import { Card, Badge, Button } from '../../components/common/index.js';

export default function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: purchase, isLoading, isError, error } = usePurchase(id);

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

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            {purchase.factory_name} • {formatDate(purchase.date)}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
    </div>
  );
}
