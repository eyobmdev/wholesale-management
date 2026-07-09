import { toast } from 'sonner';

// Global toast utility
export const showToast = {
  success: (message, description) => {
    toast.success(message, {
      description,
      style: {
        background: 'var(--card-bg)',
        color: '#22c55e', // modern green
        border: '1px solid rgba(34, 197, 94, 0.2)',
      },
    });
  },
  
  error: (message, description) => {
    toast.error(message, {
      description,
      style: {
        background: 'var(--card-bg)',
        color: '#ef4444', // modern red
        border: '1px solid rgba(239, 68, 68, 0.2)',
      },
    });
  },
  
  warning: (message, description) => {
    toast.warning(message, {
      description,
      style: {
        background: 'var(--card-bg)',
        color: '#f59e0b', // modern amber/yellow
        border: '1px solid rgba(245, 158, 11, 0.2)',
      },
    });
  },
  
  info: (message, description) => {
    toast.info(message, {
      description,
      style: {
        background: 'var(--card-bg)',
        color: '#3b82f6', // modern blue
        border: '1px solid rgba(59, 130, 246, 0.2)',
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
