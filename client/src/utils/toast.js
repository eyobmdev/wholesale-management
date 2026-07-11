import { toast } from 'sonner';

// Global toast utility
export const showToast = {
  success: (message, description) => {
    toast.success(message, {
      description,
      classNames: {
        description: 'toast-description-inherit'
      },
      style: {
        background: '#dcfce7',
        color: '#052e16',
        border: '1px solid #bbf7d0',
      },
    });
  },

  error: (message, description) => {
    toast.error(message, {
      description,
      classNames: {
        description: 'toast-description-inherit'
      },
      style: {
        background: '#fee2e2',
        color: '#450a0a',
        border: '1px solid #fecaca',
      },
    });
  },

  warning: (message, description) => {
    toast.warning(message, {
      description,
      classNames: {
        description: 'toast-description-inherit'
      },
      style: {
        background: '#ffedd5',
        color: '#431407',
        border: '1px solid #fed7aa',
      },
    });
  },

  info: (message, description) => {
    toast.info(message, {
      description,
      classNames: {
        description: 'toast-description-inherit'
      },
      style: {
        background: '#e0f2fe',
        color: '#082f49',
        border: '1px solid #bae6fd',
      },
    });
  },

  loading: (message, description) => {
    const id = toast.loading(message, {
      description,
      style: {
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--card-border)',
      },
    });
    return id; // Returns id so it can be dismissed or updated
  },

  dismiss: (id) => {
    toast.dismiss(id);
  }
};
