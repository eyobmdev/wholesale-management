import React, { useState } from 'react';
import { usePaymentMethods } from '../../../../services/dashboardService.js';
import { DashboardDateSelector } from '../../components/DashboardDateSelector.jsx';
import { formatCurrency, getHumanReadableDuration } from '../../../../utils/formatters.js';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import './PaymentMethods.css';

export function PaymentMethodsSkeleton() {
  return (
    <>
      <div className="pm-panel pm-top-section">
        <div className="pm-panel-header">
          <Skeleton height={28} width={300} style={{ marginBottom: 8 }} />
          <Skeleton height={14} width={200} />
        </div>
        <div className="pm-panel-content">
          <Skeleton height={300} borderRadius={16} />
        </div>
      </div>
      <div className="pm-bottom-section">
        {[1, 2, 3].map(i => (
          <div key={i} className="pm-panel" style={{ flex: 1, minWidth: '300px' }}>
            <div className="pm-panel-header">
              <Skeleton height={24} width={200} />
            </div>
            <div className="pm-panel-content">
              <Skeleton height={220} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton height={40} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Pre-defined modern colors for payment methods
const METHOD_COLORS = {
  cbe: '#6366f1', // Indigo
  cash: '#10b981', // Green
  telebirr: '#f59e0b', // Orange
  awash: '#ef4444', // Red
  default: '#8b5cf6' // Violet
};

const getMethodColor = (methodStr) => {
  if (!methodStr) return METHOD_COLORS.default;
  const key = methodStr.toLowerCase().replace(' ', '_');
  if (key.includes('cbe')) return METHOD_COLORS.cbe;
  if (key.includes('cash')) return METHOD_COLORS.cash;
  if (key.includes('telebirr')) return METHOD_COLORS.telebirr;
  if (key.includes('awash')) return METHOD_COLORS.awash;
  return METHOD_COLORS[key] || METHOD_COLORS.default;
};

const formatMethodName = (methodStr) => {
  if (!methodStr) return 'Unknown';
  if (methodStr.toLowerCase() === 'cbe') return 'CBE Transfer';
  return methodStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatCompactETB = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M ETB';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K ETB';
  }
  return value.toLocaleString() + ' ETB';
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-color)' }}>{data.formattedName}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Total Volume: <span style={{ color: data.color, fontWeight: 700 }}>{formatCurrency(data.volume)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-color)' }}>{data.formattedName}</p>
        <p style={{ margin: '0 0 2px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Amount: <span style={{ color: data.color, fontWeight: 600 }}>{formatCurrency(data.total_amount)}</span>
        </p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Count: <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>{data.count}</span> tx
        </p>
      </div>
    );
  }
  return null;
};

const DonutLegend = ({ data }) => {
  return (
    <div className="pm-donut-legend">
      {data.map((item, idx) => (
        <div key={idx} className="pm-legend-row">
          <div className="pm-legend-left">
            <span className="pm-legend-dot" style={{ backgroundColor: item.color }}></span>
            <span>{item.formattedName}</span>
          </div>
          <div className="pm-legend-right">
            <span className="pm-legend-amount">{formatCompactETB(item.total_amount)}</span>
            <span className="pm-legend-stats">{item.count} tx &middot; {item.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PaymentMethodsTab() {
  const [period, setPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Calculate Dates
  let startDateStr = '';
  let endDateStr = '';

  if (period !== '') {
    // Preset Mode
    const today = new Date();
    endDateStr = today.toISOString().split('T')[0];
    let startDate = new Date();
    if (period === 'daily') startDate.setDate(today.getDate() - 30);
    if (period === 'monthly') startDate.setMonth(today.getMonth() - 12);
    startDateStr = startDate.toISOString().split('T')[0];
  } else {
    // Custom Mode
    startDateStr = customRange.start;
    endDateStr = customRange.end;
  }

  const { data, isLoading, isError } = usePaymentMethods(startDateStr, endDateStr);

  const displayStartDate = data?.start_date || startDateStr || '...';
  const displayEndDate = data?.end_date || endDateStr || '...';

  if (isLoading) {
    return (
      <div className="pm-page">
        <PaymentMethodsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pm-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#ef4444' }}>
          <p>Failed to load payment methods data.</p>
        </div>
      </div>
    );
  }

  const {
    income_by_method = [],
    factory_payments_by_method = [],
    expenses_by_method = []
  } = data || {};

  // 1. Compute Aggregated Total Volume for Top Bar Chart
  const combinedVolume = {};

  const processArray = (arr) => {
    if (!arr) return;
    arr.forEach(item => {
      const method = item.payment_method;
      if (!combinedVolume[method]) combinedVolume[method] = 0;
      combinedVolume[method] += item.total_amount;
    });
  };

  processArray(income_by_method);
  processArray(factory_payments_by_method);
  processArray(expenses_by_method);

  const barData = Object.keys(combinedVolume).map(method => ({
    methodKey: method,
    formattedName: formatMethodName(method),
    color: getMethodColor(method),
    volume: combinedVolume[method]
  })).sort((a, b) => b.volume - a.volume);

  // 2. Format data for the 3 Donut Charts
  const processDonutData = (arr) => {
    return (arr || []).map(item => ({
      ...item,
      formattedName: formatMethodName(item.payment_method),
      color: getMethodColor(item.payment_method)
    }));
  };

  const incomeData = processDonutData(income_by_method);
  const factoryData = processDonutData(factory_payments_by_method);
  const expensesData = processDonutData(expenses_by_method);

  return (
    <div className="pm-page">
      <div className="pm-header">
        <div>
          <h1 className="pm-title">Payment Method Distribution</h1>
          <p className="pm-subtitle">How payments are made across all transaction types</p>
        </div>
        <div style={{ marginTop: '4px' }}>
          <DashboardDateSelector
            period={period}
            startDate={customRange.start}
            endDate={customRange.end}
            displayDuration={getHumanReadableDuration(displayStartDate, displayEndDate)}
            onChange={(val) => {
              setPeriod(val.period);
              setCustomRange({ start: val.start, end: val.end });
            }}
            options={['daily', 'monthly']}
          />
        </div>
      </div>

      {/* Top Section: Aggregated Bar Chart */}
      <div className="pm-panel pm-top-section">
        <div className="pm-panel-header">
          <h2 className="pm-panel-title">Total Volume by Payment Method</h2>
          <p className="pm-panel-subtitle">ETB in thousands (combined income + payments + expenses)</p>
        </div>
        <div className="pm-panel-content">
          {barData.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="formattedName" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)' }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
              No transaction data for this period
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Three Donut Charts */}
      <div className="pm-bottom-section">

        {/* 1. Customer Income */}
        <div className="pm-panel">
          <div className="pm-panel-header">
            <h2 className="pm-panel-title">Customer Income by Method</h2>
          </div>
          <div className="pm-panel-content">
            {incomeData.length > 0 ? (
              <>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="total_amount"
                        stroke="none"
                      >
                        {incomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomDonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DonutLegend data={incomeData} />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', minHeight: '220px' }}>
                No income data
              </div>
            )}
          </div>
        </div>

        {/* 2. Factory Payments */}
        <div className="pm-panel">
          <div className="pm-panel-header">
            <h2 className="pm-panel-title">Factory Payments by Method</h2>
          </div>
          <div className="pm-panel-content">
            {factoryData.length > 0 ? (
              <>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={factoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="total_amount"
                        stroke="none"
                      >
                        {factoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomDonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DonutLegend data={factoryData} />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', minHeight: '220px' }}>
                No factory payments data
              </div>
            )}
          </div>
        </div>

        {/* 3. Expenses */}
        <div className="pm-panel">
          <div className="pm-panel-header">
            <h2 className="pm-panel-title">Expenses by Method</h2>
          </div>
          <div className="pm-panel-content">
            {expensesData.length > 0 ? (
              <>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="total_amount"
                        stroke="none"
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomDonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DonutLegend data={expensesData} />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', minHeight: '220px' }}>
                No expenses data
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
