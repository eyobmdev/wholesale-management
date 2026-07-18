export const formatCurrency = (amount, currency = 'ETB') => {
  if (amount === undefined || amount === null) return '-';
  
  const num = Number(amount);
  
  // For very large numbers, shorten them for the dashboard tooltips/charts
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ${currency}`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K ${currency}`;
  }
  
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
};

export const formatCurrencyFull = (amount, currency = 'ETB') => {
  if (amount === undefined || amount === null) return '-';
  return `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return '-';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${Number(val).toFixed(1)}%`;
};

export const getHumanReadableDuration = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return '';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 365) {
    const years = Math.round(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  if (diffDays >= 28) {
    const months = Math.round(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (diffDays >= 7) {
    const weeks = Math.round(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

export const formatMonthLabel = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const getTransactionTypeColor = (type) => {
  const map = {
    'sale': 'success',
    'purchase': 'danger',
    'income': 'info',
    'expense': 'warning',
    'factory_payment': 'primary'
  };
  return map[type] || 'secondary';
};

export const getTransactionTypeLabel = (type) => {
  if (!type) return '-';
  const map = {
    'sale': 'Sale',
    'purchase': 'Purchase',
    'income': 'Customer Payment',
    'expense': 'Expense',
    'factory_payment': 'Factory Payment'
  };
  return map[type] || type.replace('_', ' ');
};

export const getBucketUrgencyColor = (label) => {
  if (!label) return 'secondary';
  
  const l = label.toLowerCase();
  if (l.includes('0-30')) return 'info';
  if (l.includes('30-60')) return 'warning';
  if (l.includes('60-90')) return 'danger';
  if (l.includes('90+') || l.includes('90 plus')) return 'danger'; // High urgency
  
  return 'secondary';
};

export const getAlertTypeColor = (type) => {
  if (!type) return 'secondary';
  const l = type.toLowerCase();
  if (l.includes('sold out')) return 'danger';
  if (l.includes('low')) return 'warning';
  return 'primary';
};
