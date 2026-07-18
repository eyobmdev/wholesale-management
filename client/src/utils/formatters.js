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
