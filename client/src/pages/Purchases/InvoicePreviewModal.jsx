import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api.js';
import { Modal, Button } from '../../components/common/index.js';
import { showToast } from '../../utils/toast.js';

export default function InvoicePreviewModal({ isOpen, onClose, purchaseId, shippingCode }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Share menu state
  const [shareUrl, setShareUrl] = useState(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isFetchingShareLink, setIsFetchingShareLink] = useState(false);
  const [shareLinkError, setShareLinkError] = useState(null);
  const shareMenuRef = useRef(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    };
    if (isShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareMenuOpen]);

  // Cleanup blob URL on close
  const handleClose = useCallback(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    setBlob(null);
    setError(null);
    setIsLoading(false);
    
    // Reset share state
    setShareUrl(null);
    setIsShareMenuOpen(false);
    setIsFetchingShareLink(false);
    setShareLinkError(null);
    
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

  const getShareUrl = async () => {
    if (shareUrl) return shareUrl; // use cached
    setIsFetchingShareLink(true);
    setShareLinkError(null);
    try {
      const response = await api.get(`/purchases/${purchaseId}/invoice/share-link/`);
      if (response && response.share_url) {
        setShareUrl(response.share_url);
        return response.share_url;
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Failed to get share link:', err);
      setShareLinkError('Could not generate share link. Please try again.');
      return null;
    } finally {
      setIsFetchingShareLink(false);
    }
  };

  const handleShareOption = async (platform) => {
    const url = await getShareUrl();
    if (!url) return; // error state is handled in UI

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
        setIsShareMenuOpen(false);
        break;
      case 'telegram':
        window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}`, "_blank");
        setIsShareMenuOpen(false);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent("Invoice")}&body=${encodeURIComponent(url)}`;
        setIsShareMenuOpen(false);
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(url)}`;
        setIsShareMenuOpen(false);
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          showToast.success('Link Copied!', 'The invoice link has been copied to your clipboard.');
        } catch (err) {
          showToast.error('Copy Failed', 'Could not copy link to clipboard.');
        }
        setIsShareMenuOpen(false);
        break;
      default:
        setIsShareMenuOpen(false);
    }
  };

  const footer = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
        
        <div style={{ position: 'relative' }} ref={shareMenuRef}>
          <Button
            variant="outline"
            leftIcon="ri-share-forward-line"
            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
            disabled={isLoading || !blob}
          >
            Share
          </Button>

          {isShareMenuOpen && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '8px',
              minWidth: '200px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {isFetchingShareLink ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="ri-loader-4-line spinner-icon" style={{ display: 'inline-block', marginBottom: '8px' }}></i>
                  <div style={{ fontSize: '0.85rem' }}>Generating link...</div>
                </div>
              ) : shareLinkError ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--danger-color, #ef4444)' }}>
                  <i className="ri-error-warning-line" style={{ display: 'block', fontSize: '1.2rem', marginBottom: '4px' }}></i>
                  <div style={{ fontSize: '0.85rem' }}>{shareLinkError}</div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => handleShareOption('whatsapp')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-color)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="ri-whatsapp-line" style={{ color: '#25D366', fontSize: '1.2rem' }}></i> WhatsApp
                  </button>
                  <button 
                    onClick={() => handleShareOption('telegram')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-color)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="ri-telegram-line" style={{ color: '#0088cc', fontSize: '1.2rem' }}></i> Telegram
                  </button>
                  <button 
                    onClick={() => handleShareOption('email')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-color)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="ri-mail-line" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i> Email
                  </button>
                  <button 
                    onClick={() => handleShareOption('sms')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-color)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="ri-message-3-line" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i> SMS
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'var(--card-border)', margin: '4px 0' }}></div>
                  <button 
                    onClick={() => handleShareOption('copy')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-color)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="ri-links-line" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i> Copy Link
                  </button>
                </>
              )}
            </div>
          )}
        </div>

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
