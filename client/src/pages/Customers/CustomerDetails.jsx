import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../services/customerService.js';
import { Card, Button, Badge } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';
import './Customers.css';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id);

  if (isLoading) {
    return (
      <div className="middle-class" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <i className="ri-loader-4-line spinner-icon" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="middle-class">
        <Card>
          <Card.Body style={{ textAlign: 'center', padding: '48px 20px' }}>
            <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}></i>
            <h2 style={{ marginBottom: '8px' }}>Customer Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The customer you are looking for does not exist or an error occurred.</p>
            <Button variant="outline" onClick={() => navigate('/customers')}>Back to Customers</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Helper to render balance badge
  const renderBalanceBadge = () => {
    const balance = parseFloat(customer.current_balance || 0);
    const currency = customer.initial_credit_currency || 'ETB';
    
    if (balance > 0) return <Badge variant="danger">Owes {balance.toFixed(2)} {currency}</Badge>;
    if (balance < 0) return <Badge variant="success">You Owe {Math.abs(balance).toFixed(2)} {currency}</Badge>;
    return <Badge variant="default">Settled</Badge>;
  };

  return (
    <div className="middle-class details-page-wrapper">
      {/* Header Area */}
      <div className="details-header">
        <div className="details-header-left">
          <button className="back-btn" onClick={() => navigate('/customers')}>
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 className="page-title">{customer.name}</h1>
              <Badge variant={customer.is_active ? "success" : "warning"}>
                {customer.is_active ? 'Active' : 'Archived'}
              </Badge>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Customer ID: #{customer.id}</p>
          </div>
        </div>
        
        <div className="details-header-actions">
          <Button 
            variant="outline" 
            leftIcon="ri-edit-line"
            onClick={() => showToast.info('Edit', 'Edit feature coming soon.')}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            leftIcon="ri-delete-bin-line"
            onClick={() => showToast.info('Delete', 'Delete feature coming soon.')}
          >
            Delete
          </Button>
          <Button 
            variant="primary" 
            leftIcon="ri-money-dollar-circle-line"
            onClick={() => showToast.success('Payment', 'Record Payment UI coming soon.')}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Grid Layout for details */}
      <div className="details-grid">
        
        {/* Basic Information */}
        <Card>
          <Card.Header title="Basic Information" icon="ri-user-line" />
          <Card.Body>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{customer.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{customer.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{customer.location || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Opening Date</span>
                <span className="info-value">{customer.opening_date ? new Date(customer.opening_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  {customer.is_active ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Financial Information */}
        <Card>
          <Card.Header title="Financial Information" icon="ri-wallet-3-line" />
          <Card.Body>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Current Balance</span>
                <span className="info-value" style={{ fontWeight: '600' }}>
                  {parseFloat(customer.current_balance || 0).toFixed(2)} {customer.initial_credit_currency || 'ETB'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Initial Credit</span>
                <span className="info-value">
                  {parseFloat(customer.initial_credit || 0).toFixed(2)} {customer.initial_credit_currency || 'ETB'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Balance Status</span>
                <span className="info-value">
                  {renderBalanceBadge()}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Business Summary */}
        <Card>
          <Card.Header title="Business Summary" icon="ri-bar-chart-box-line" />
          <Card.Body>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Total Sales Amount</span>
                <span className="info-value">{parseFloat(customer.total_sales_amount || 0).toFixed(2)} {customer.initial_credit_currency || 'ETB'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Credit Sales</span>
                <span className="info-value">{parseFloat(customer.total_sale_credit_amount || 0).toFixed(2)} {customer.initial_credit_currency || 'ETB'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Payments Received</span>
                <span className="info-value">{parseFloat(customer.total_payments_received || 0).toFixed(2)} {customer.initial_credit_currency || 'ETB'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Purchase Date</span>
                <span className="info-value">{customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString() : 'No purchases yet'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Payment Date</span>
                <span className="info-value">{customer.last_payment_date ? new Date(customer.last_payment_date).toLocaleDateString() : 'No payments yet'}</span>
              </div>
            </div>
          </Card.Body>
        </Card>

      </div>
    </div>
  );
}
