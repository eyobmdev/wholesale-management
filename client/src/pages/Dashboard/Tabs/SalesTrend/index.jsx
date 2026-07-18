import React, { useState } from 'react';
import { useSalesTrend } from '../../../../services/dashboardService.js';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, getHumanReadableDuration } from '../../../../utils/formatters.js';
import { DashboardDateSelector } from '../../components/DashboardDateSelector.jsx';
import './SalesTrendTab.css';

export default function SalesTrendTab() {
  const [period, setPeriod] = useState('daily');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Calculate Dates and Params
  let fetchPeriod = period;
  let startDateStr = '';
  let endDateStr = '';

  if (period !== '') {
    // Preset Mode
    const today = new Date();
    endDateStr = today.toISOString().split('T')[0];
    let startDate = new Date();
    if (period === 'daily') startDate.setDate(today.getDate() - 30);
    if (period === 'weekly') startDate.setDate(today.getDate() - 90);
    if (period === 'monthly') startDate.setMonth(today.getMonth() - 12);
    startDateStr = startDate.toISOString().split('T')[0];
  } else {
    // Custom Mode
    fetchPeriod = '';
    startDateStr = customRange.start;
    endDateStr = customRange.end;
  }

  // Fetch Data
  const { data: trendData, isLoading, isError } = useSalesTrend(fetchPeriod, startDateStr, endDateStr);
  const isDataStale = trendData && period !== '' && trendData.period !== period;
  const showLoading = isLoading || isDataStale;

  const formatXAxisLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (period === 'monthly') {
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayStartDate = trendData?.start_date || startDateStr || '...';
  const displayEndDate = trendData?.end_date || endDateStr || '...';
  const displayCurrency = trendData?.currency || 'ETB';

  // Map Data
  const rawData = trendData?.data || [];

  const displayData = rawData;

  const chartData = displayData.map(d => ({
    name: formatXAxisLabel(d.date),
    originalDate: d.date,
    Sales: Number(d.total_sales),
    Cost: Number(d.total_cost),
    Profit: Number(d.gross_profit),
    Invoices: Number(d.num_sales),
    Items: Number(d.num_items_sold)
  }));

  // Use totals from backend if available, otherwise calculate fallback
  const backendTotals = trendData?.totals || {};
  const totals = {
    Sales: backendTotals.total_sales || 0,
    Cost: backendTotals.total_cost || 0,
    Profit: backendTotals.gross_profit || 0,
    Invoices: backendTotals.num_sales || 0,
    Items: backendTotals.num_items_sold || 0
  };

  return (
    <div className="sales-trend-page">
      {/* Header & Controls */}
      <div className="sales-trend-header">
        <div>
          <h1 className="sales-trend-title">Sales Trend</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <DashboardDateSelector 
              period={period}
              startDate={customRange.start}
              endDate={customRange.end}
              displayDuration={getHumanReadableDuration(displayStartDate, displayEndDate)}
              onChange={(val) => {
                setPeriod(val.period);
                setCustomRange({ start: val.start, end: val.end });
              }}
              options={['daily', 'weekly', 'monthly']}
            />
            <span className="sales-trend-subtitle" style={{ margin: 0 }}>&middot; {displayCurrency}</span>
          </div>
        </div>
      </div>

      {showLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '16px' }}></div>
        </div>
      ) : isError ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#ef4444' }}>
          <p>Failed to load sales trend data.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="sales-trend-cards">
            <div className="st-card stat-bg-primary">
              <h3 className="st-card-value stat-text-primary">{formatCurrency(totals.Sales)}</h3>
              <p className="st-card-label" style={{ color: 'var(--text-muted)' }}>Total Sales</p>
            </div>
            <div className="st-card stat-bg-danger">
              <h3 className="st-card-value stat-text-danger">{formatCurrency(totals.Cost)}</h3>
              <p className="st-card-label" style={{ color: 'var(--text-muted)' }}>Total Cost</p>
            </div>
            <div className="st-card stat-bg-success">
              <h3 className="st-card-value stat-text-success">{formatCurrency(totals.Profit)}</h3>
              <p className="st-card-label" style={{ color: 'var(--text-muted)' }}>Gross Profit</p>
            </div>
            <div className="st-card stat-bg-info">
              <h3 className="st-card-value stat-text-info">{totals.Invoices.toLocaleString()}</h3>
              <p className="st-card-label" style={{ color: 'var(--text-muted)' }}># Invoices</p>
            </div>
            <div className="st-card stat-bg-purple">
              <h3 className="st-card-value stat-text-purple">{totals.Items.toLocaleString()}</h3>
              <p className="st-card-label" style={{ color: 'var(--text-muted)' }}>Items Sold</p>
            </div>
          </div>

          {/* Revenue, Cost & Gross Profit Area Chart */}
          <div className="st-section">
            <h2 className="st-section-title">Revenue, Cost & Gross Profit</h2>
            <p className="st-section-subtitle">ETB in thousands</p>

            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid var(--card-border)", fontSize: 12, backgroundColor: 'var(--card-bg)' }}
                    formatter={(val) => [`${formatCurrency(val)}`, ""]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="Cost" stroke="#e11d48" strokeWidth={2} fill="url(#colorCost)" />
                  <Area type="monotone" dataKey="Profit" name="Gross Profit" stroke="#10b981" strokeWidth={2} fill="url(#colorProfit)" />
                  <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Number of Sales Invoices Bar Chart */}
          <div className="st-section">
            <h2 className="st-section-title">Number of Sales Invoices</h2>
            <p className="st-section-subtitle">Count of invoices per period</p>

            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--hover-bg)' }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid var(--card-border)", fontSize: 12, backgroundColor: 'var(--card-bg)' }}
                    formatter={(val) => [val, "# Sales"]}
                  />
                  <Bar dataKey="Invoices" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Period Breakdown Table */}
          <div className="st-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 className="st-section-title">Period Breakdown</h2>
            </div>
            <div style={{ overflowX: 'auto', padding: '16px 0' }}>
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total Sales</th>
                    <th>Cost</th>
                    <th>Gross Profit</th>
                    <th style={{ textAlign: 'right' }}># Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => {
                    const margin = row.Sales > 0 ? ((row.Profit / row.Sales) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-color)' }}>{row.name}</td>
                        <td style={{ color: '#3b82f6' }}>{formatCurrency(row.Sales)}</td>
                        <td style={{ color: '#e11d48' }}>{formatCurrency(row.Cost)}</td>
                        <td style={{ color: '#10b981' }}>
                          {formatCurrency(row.Profit)} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>({margin}%)</span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-color)' }}>{row.Invoices}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
