import React from 'react';
import { Modal } from './index.jsx';
import { Button } from '../Button/index.jsx';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  danger = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="sm"
    >
      <div style={{ marginBottom: '24px' }}>
        <p>{message}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isConfirming}
        >
          {cancelLabel}
        </Button>
        <Button 
          variant={danger ? 'danger' : 'primary'} 
          onClick={onConfirm}
          isLoading={isConfirming}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
