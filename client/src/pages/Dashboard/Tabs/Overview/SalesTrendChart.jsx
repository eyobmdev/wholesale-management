import React, { useState } from 'react';
import { useSalesTrend } from '../../services/dashboardService.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatMonthLabel } from '../../utils/formatters.js';

export function SalesTrendChart() {
  const [period, setPeriod] = useState('daily');

  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate = new Date();
  if (period === 'daily') {
    startDate.setDate(today.getDate() - 30);
  } else if (period === 'weekly') {
    startDate.setDate(today.getDate() - 90);
  } else if (period === 'monthly') {
    startDate.setMonth(today.getMonth() - 12);
  }
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data: trendData, isLoading, isError, isFetching } = useSalesTrend(period, startDateStr, endDate);

  // If React Query returns stale data from the previous period while fetching, treat it as loading
  const isDataStale = trendData && trendData.period !== period;
  const showLoading = isLoading || isDataStale;

  const chartData = (trendData?.data || []).map(d => {
    let label = d.date;
    if (period === 'monthly') {
      label = formatMonthLabel(d.date);
    } else {
      const dateObj = new Date(d.date);
      label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return {
      name: label,
      Sales: Number(d.total_sales) / 1000,
      Profit: Number(d.gross_profit) / 1000,
    };
  });

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>Sales & Profit Trend</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {period === 'daily' ? 'Daily view' : period === 'weekly' ? 'Weekly view' : 'Monthly view'} (ETB, thousands)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--search-bg)', padding: '4px', borderRadius: '8px' }}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: period === p ? 'var(--card-bg)' : 'transparent',
                color: period === p ? '#4f46e5' : 'var(--text-muted)',
                border: period === p ? '1px solid var(--card-border)' : 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: period === p ? 600 : 500,
                boxShadow: period === p ? 'var(--shadow-sm)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '220px', width: '100%' }}>
        {showLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="skeleton" style={{ height: '100%', width: '100%', borderRadius: '8px' }}></div>
          </div>
        ) : isError ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ef4444', fontSize: '0.85rem' }}>
            <p>Failed to load chart data.</p>
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span style={{ color: 'var(--text-muted)' }}>No data available for this period.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" key={period}>
            <AreaChart key={`${period}-${chartData.length}`} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                dy={10}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(val) => [`${Number(val).toFixed(0)}K ETB`, ""]}
              />
              <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2} fill="url(#salesGrad)" name="Sales" />
              <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fill="url(#profitGrad)" name="Profit" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function SalesTrendChartSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      padding: '20px',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div className="skeleton" style={{ height: '20px', width: '150px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '14px', width: '200px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '28px', width: '140px', borderRadius: '8px' }}></div>
      </div>
      <div className="skeleton" style={{ height: '220px', width: '100%', borderRadius: '8px' }}></div>
    </div>
  );
}
