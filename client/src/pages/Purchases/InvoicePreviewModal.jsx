import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import { Modal, Button } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';

export default function InvoicePreviewModal({ isOpen, onClose, purchaseId, shippingCode }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canShare, setCanShare] = useState(false);

  const filename = shippingCode
    ? `invoice_${shippingCode}.pdf`
    : `invoice_${purchaseId}.pdf`;

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/purchases/${purchaseId}/invoice/`, {
        responseType: 'blob',
      });

      // api.js interceptor returns response.data, so response is the blob directly
      // However, since responseType is 'blob', axios returns the blob in response.data
      // but our interceptor does response.data, so we get the blob directly
      const pdfBlob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });

      const url = URL.createObjectURL(pdfBlob);
      setBlob(pdfBlob);
      setBlobUrl(url);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError(err?.detail || err?.message || 'Failed to load invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]);

  // Fetch when modal opens
  useEffect(() => {
    if (isOpen && purchaseId) {
      fetchInvoice();
    }
  }, [isOpen, purchaseId, fetchInvoice]);

  // Check share capability
  useEffect(() => {
    if (blob) {
      try {
        const file = new File([blob], filename, { type: 'application/pdf' });
        const supported = navigator.canShare && navigator.canShare({ files: [file] });
        setCanShare(!!supported);
      } catch {
        setCanShare(false);
      }
    }
  }, [blob, filename]);

  // Cleanup blob URL on close
  const handleClose = useCallback(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    setBlob(null);
    setError(null);
    setIsLoading(false);
    onClose();
  }, [blobUrl, onClose]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!blob) return;
    try {
      const file = new File([blob], filename, { type: 'application/pdf' });
      await navigator.share({
        files: [file],
        title: 'Invoice',
        text: 'Here is your invoice.',
      });
    } catch (err) {
      // User cancelled the share dialog
      if (err.name === 'AbortError') return;
      showToast.error('Share Failed', err.message || 'Could not share the invoice.');
    }
  };

  const footer = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
        {!canShare && blob && (
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginRight: 'auto',
            maxWidth: '300px'
          }}>
            PDF sharing is not supported on this browser. Please download instead.
          </span>
        )}
        <Button
          variant="outline"
          leftIcon="ri-share-forward-line"
          onClick={handleShare}
          disabled={isLoading || !blob || !canShare}
        >
          Share
        </Button>
        <Button
          variant="primary"
          leftIcon="ri-download-2-line"
          onClick={handleDownload}
          disabled={isLoading || !blob}
        >
          Download
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invoice Preview"
      size="full"
      footer={footer}
    >
      <div style={{
        width: '100%',
        height: '100%',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--text-muted)'
          }}>
            <i className="ri-loader-4-line spinner-icon" style={{ fontSize: '3rem' }}></i>
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Loading invoice...</p>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: 'var(--danger-color, #ef4444)' }}></i>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-color)' }}>
              Failed to Load Invoice
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              {error}
            </p>
            <Button variant="outline" leftIcon="ri-refresh-line" onClick={fetchInvoice}>
              Retry
            </Button>
          </div>
        )}

        {blobUrl && !isLoading && !error && (
          <iframe
            src={blobUrl}
            title="Invoice Preview"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '60vh',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        )}
      </div>
    </Modal>
  );
}
