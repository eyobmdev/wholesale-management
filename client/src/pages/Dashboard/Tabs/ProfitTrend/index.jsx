import React, { useState } from 'react';
import { useProfitTrend } from '../../../../services/dashboardService.js';
import { ComposedChart, AreaChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../../utils/formatters.js';
import { DashboardToggle } from '../../components/DashboardToggle.jsx';
import { DashboardDatePicker } from '../../components/DashboardDatePicker.jsx';
import './ProfitTrendTab.css';

export default function ProfitTrendTab() {
  const [period, setPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const isDatePickerDisabled = period !== '';

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
    if (period === 'monthly') startDate.setMonth(today.getMonth() - 12);
    startDateStr = startDate.toISOString().split('T')[0];
  } else {
    // Custom Mode
    fetchPeriod = '';
    startDateStr = customRange.start;
    endDateStr = customRange.end;
  }

  // Fetch Data
  const { data: trendData, isLoading, isError } = useProfitTrend(fetchPeriod, startDateStr, endDateStr);
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
  
  const chartData = rawData.map(d => ({
    name: formatXAxisLabel(d.date),
    originalDate: d.date,
    GrossProfit: Number(d.gross_profit),
    Expenses: Number(d.total_expenses),
    NetProfit: Number(d.net_profit),
    Margin: Number(d.profit_margin_percent)
  }));

  const backendTotals = trendData?.totals || {};
  const totals = {
    GrossProfit: backendTotals.gross_profit || 0,
    Expenses: backendTotals.total_expenses || 0,
    NetProfit: backendTotals.net_profit || 0
  };

  return (
    <div className="profit-trend-page">
      {/* Header & Controls */}
      <div className="profit-trend-header">
        <div>
          <h1 className="profit-trend-title">Profit Trend</h1>
          <p className="profit-trend-subtitle">
            {displayStartDate} &rarr; {displayEndDate} &middot; {displayCurrency}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <DashboardDatePicker 
            startDate={customRange.start} 
            endDate={customRange.end} 
            onChange={setCustomRange} 
            disabled={isDatePickerDisabled}
          />
          <DashboardToggle 
            options={['daily', 'monthly']} 
            value={period} 
            onChange={setPeriod} 
          />
        </div>
      </div>

      {showLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '16px' }}></div>
        </div>
      ) : isError ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#ef4444' }}>
          <p>Failed to load profit trend data.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="profit-trend-cards">
            <div className="pt-card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <p className="pt-card-label" style={{ color: 'var(--text-muted)' }}>Total Gross Profit</p>
              <h3 className="pt-card-value" style={{ color: '#10b981' }}>{formatCurrency(totals.GrossProfit)}</h3>
            </div>
            <div className="pt-card" style={{ backgroundColor: 'rgba(225, 29, 72, 0.05)', borderColor: 'rgba(225, 29, 72, 0.2)' }}>
              <p className="pt-card-label" style={{ color: 'var(--text-muted)' }}>Total Expenses</p>
              <h3 className="pt-card-value" style={{ color: '#e11d48' }}>{formatCurrency(totals.Expenses)}</h3>
            </div>
            <div className="pt-card" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              <p className="pt-card-label" style={{ color: 'var(--text-muted)' }}>Total Net Profit</p>
              <h3 className="pt-card-value" style={{ color: '#6366f1' }}>{formatCurrency(totals.NetProfit)}</h3>
            </div>
          </div>

          {/* Gross Profit vs Expenses vs Net Profit (Composed Chart) */}
          <div className="pt-section">
            <h2 className="pt-section-title">Gross Profit vs Expenses vs Net Profit</h2>
            <p className="pt-section-subtitle">ETB in thousands</p>
            
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  
                  {/* Left Y-Axis for Currency */}
                  <YAxis 
                    yAxisId="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} 
                  />
                  
                  {/* Right Y-Axis for Percentage */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                    tickFormatter={(v) => `${v.toFixed(0)}%`} 
                  />

                  <Tooltip 
                    cursor={{ fill: 'var(--hover-bg)' }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid var(--card-border)", fontSize: 12, backgroundColor: 'var(--card-bg)' }}
                    formatter={(val, name) => {
                      if (name === 'Margin %') return [`${val.toFixed(1)}%`, name];
                      return [`${formatCurrency(val)}`, name];
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} />
                  
                  {/* Bars plotted to left axis */}
                  <Bar yAxisId="left" dataKey="GrossProfit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar yAxisId="left" dataKey="Expenses" name="Expenses" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={40} />
                  
                  {/* Lines plotted to left and right axes respectively */}
                  <Line yAxisId="left" type="monotone" dataKey="NetProfit" name="Net Profit" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Margin" name="Margin %" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Profit Margin % Area Chart */}
          <div className="pt-section">
            <h2 className="pt-section-title">Net Profit Margin %</h2>
            <p className="pt-section-subtitle">Percentage of revenue</p>
            
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "10px", border: "1px solid var(--card-border)", fontSize: 12, backgroundColor: 'var(--card-bg)' }}
                    formatter={(val) => [`${val.toFixed(1)}%`, "Margin"]}
                  />
                  <Area type="monotone" dataKey="Margin" stroke="#f59e0b" strokeWidth={2} fill="url(#colorMargin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Period Breakdown Table */}
          <div className="pt-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 className="pt-section-title">Period Details</h2>
            </div>
            <div style={{ overflowX: 'auto', padding: '16px 0' }}>
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Gross Profit</th>
                    <th>Expenses</th>
                    <th>Net Profit</th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => {
                    let badgeClass = 'pt-badge-green';
                    if (row.Margin < 20) badgeClass = 'pt-badge-yellow';
                    if (row.Margin < 10) badgeClass = 'pt-badge-red';
                    
                    return (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-color)' }}>{row.name}</td>
                        <td style={{ color: '#10b981' }}>{formatCurrency(row.GrossProfit)}</td>
                        <td style={{ color: '#e11d48' }}>{formatCurrency(row.Expenses)}</td>
                        <td style={{ color: '#6366f1' }}>{formatCurrency(row.NetProfit)}</td>
                        <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                          <span className={`pt-badge ${badgeClass}`}>
                            {row.Margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {chartData.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No profit data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
