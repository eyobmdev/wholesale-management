import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useProductPerformance } from '../../../../services/dashboardService.js';
import { DashboardDateSelector } from '../../components/DashboardDateSelector.jsx';
import { formatCurrency, getHumanReadableDuration } from '../../../../utils/formatters.js';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ProductPerformance.css';

const VELOCITY_COLORS = {
  fast: '#10b981', // green
  medium: '#6366f1', // indigo
  slow: '#f59e0b', // orange
  dead: '#ef4444', // red
  default: '#8b5cf6'
};

const getVelocityColor = (velocity) => VELOCITY_COLORS[velocity?.toLowerCase()] || VELOCITY_COLORS.default;

const formatCompact = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M ETB';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K ETB';
  return value.toLocaleString() + ' ETB';
};

export function ProductPerformanceSkeleton() {
  return (
    <>
      <div className="pp-summary-row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="pp-summary-card">
            <Skeleton height={14} width={100} style={{ marginBottom: 16 }} />
            <Skeleton height={36} width={150} style={{ marginBottom: 8 }} />
            <Skeleton height={12} width={120} />
          </div>
        ))}
      </div>
      <div className="pp-panel">
        <Skeleton height={28} width={250} style={{ marginBottom: 8 }} />
        <Skeleton height={16} width={350} style={{ marginBottom: 24 }} />
        <Skeleton height={300} borderRadius={16} />
      </div>
      <div className="pp-cards-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="pp-product-card">
            <Skeleton height={20} width={180} style={{ marginBottom: 16 }} />
            <Skeleton count={4} height={16} style={{ marginBottom: 8 }} />
          </div>
        ))}
      </div>
      <div className="pp-panel">
        <Skeleton height={24} width={200} style={{ marginBottom: 24 }} />
        <Skeleton count={5} height={40} style={{ marginBottom: 12 }} />
      </div>
    </>
  );
}

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-color)' }}>{data.product_name}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Sell-Through: <span style={{ color: data.color, fontWeight: 700 }}>{Number(data.sell_through_rate).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ProductPerformanceTab() {
  const [period, setPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Calculate Dates
  let startDateStr = '';
  let endDateStr = '';

  if (period !== '') {
    const today = new Date();
    endDateStr = today.toISOString().split('T')[0];
    let startDate = new Date();
    if (period === 'daily') startDate.setDate(today.getDate() - 30);
    if (period === 'monthly') startDate.setMonth(today.getMonth() - 12);
    startDateStr = startDate.toISOString().split('T')[0];
  } else {
    startDateStr = customRange.start;
    endDateStr = customRange.end;
  }

  const { data, isLoading, isError } = useProductPerformance(startDateStr, endDateStr);

  const displayStartDate = data?.start_date || startDateStr || '...';
  const displayEndDate = data?.end_date || endDateStr || '...';

  if (isLoading) {
    return (
      <div className="pp-page">
        <ProductPerformanceSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pp-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#ef4444' }}>
          <p>Failed to load product performance data.</p>
        </div>
      </div>
    );
  }

  const {
    total_products = 0,
    fast_moving_count = 0,
    slow_moving_count = 0,
    dead_stock_count = 0,
    products = []
  } = data || {};

  // Sort products by sell through rate descending for charts
  const sortedProducts = [...products].sort((a, b) => b.sell_through_rate - a.sell_through_rate);
  const chartData = sortedProducts.map(p => ({
    ...p,
    color: getVelocityColor(p.velocity)
  }));

  return (
    <div className="pp-page">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Product Performance</h1>
          <p className="pp-subtitle">Analyze sell-through rates, revenue, and product velocity</p>
        </div>

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

      {/* 1. Stat Cards Row */}
      <div className="pp-summary-row">
        <div className="pp-summary-card stat-bg-primary">
          <p className="pp-summary-label stat-text-primary">
            <i className="ri-box-3-line"></i> Total Products
          </p>
          <h3 className="pp-summary-value stat-text-primary">{total_products}</h3>
        </div>

        <div className="pp-summary-card stat-bg-success">
          <p className="pp-summary-label stat-text-success">
            <i className="ri-flashlight-line"></i> Fast Moving
          </p>
          <h3 className="pp-summary-value stat-text-success">{fast_moving_count}</h3>
        </div>

        <div className="pp-summary-card stat-bg-warning">
          <p className="pp-summary-label stat-text-warning">
            <i className="ri-timer-line"></i> Slow Moving
          </p>
          <h3 className="pp-summary-value stat-text-warning">{slow_moving_count}</h3>
        </div>

        <div className="pp-summary-card stat-bg-danger">
          <p className="pp-summary-label stat-text-danger">
            <i className="ri-close-circle-line"></i> Dead Stock
          </p>
          <h3 className="pp-summary-value stat-text-danger">{dead_stock_count}</h3>
        </div>
      </div>

      {/* 2. Middle Section: Bar Chart */}
      <div className="pp-panel">
        <div className="pp-panel-header">
          <h2 className="pp-panel-title">Sell-Through Rate by Product</h2>
          <p className="pp-panel-subtitle">% of purchased stock that has been sold (100% = sold out)</p>
        </div>
        <div className="pp-panel-content">
          {chartData.length > 0 ? (
            <div style={{ height: Math.max(300, chartData.length * 40) + 'px', width: '100%' }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--card-border)" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis dataKey="product_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={110} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--hover-bg)' }} />
                  <Bar dataKey="sell_through_rate" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
              No performance data available
            </div>
          )}
        </div>
      </div>

      {/* 3. Product Highlight Cards */}
      <div className="pp-cards-grid">
        {sortedProducts.map((prod, idx) => {
          const vColor = getVelocityColor(prod.velocity);
          return (
            <div key={idx} className="pp-product-card">
              <div className="pp-pc-header">
                <div>
                  <h3 className="pp-pc-title">{prod.product_name}</h3>
                  <p className="pp-pc-code">{prod.item_code}</p>
                </div>
                <div className="pp-pc-badges">
                  <span className={`pp-badge badge-velocity-${prod.velocity?.toLowerCase() || 'medium'}`}>
                    {prod.velocity}
                  </span>
                  <span className={`pp-badge badge-status-${prod.status?.toLowerCase() || 'healthy'}`}>
                    {prod.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="pp-pc-progress-container">
                <div className="pp-pc-progress-label">
                  <span>Sell-Through Rate</span>
                  <span style={{ color: vColor, fontWeight: 700 }}>{Number(prod.sell_through_rate).toFixed(1)}%</span>
                </div>
                <div className="pp-pc-progress-bar">
                  <div className="pp-pc-progress-fill" style={{ width: `${Math.min(prod.sell_through_rate, 100)}%`, backgroundColor: vColor }}></div>
                </div>
              </div>

              <div className="pp-pc-metrics">
                <div className="pp-pc-metric-box">
                  <p className="pp-pc-metric-label">Revenue</p>
                  <p className="pp-pc-metric-val val-revenue">{formatCurrency(Number(prod.total_revenue), "ETB")}</p>
                </div>
                <div className="pp-pc-metric-box">
                  <p className="pp-pc-metric-label">Gross Profit</p>
                  <p className="pp-pc-metric-val val-profit">{formatCurrency(Number(prod.gross_profit), "ETB")}</p>
                </div>
                <div className="pp-pc-metric-box">
                  <p className="pp-pc-metric-label">Remaining</p>
                  <p className="pp-pc-metric-val val-remaining">{Number(prod.total_bags_remaining)} bags</p>
                </div>
                <div className="pp-pc-metric-box">
                  <p className="pp-pc-metric-label">Margin</p>
                  <p className="pp-pc-metric-val val-margin">{Number(prod.profit_margin_percent).toFixed(1)}%</p>
                </div>
              </div>

              {prod.avg_days_to_sell && (
                <div className="pp-pc-footer">
                  <i className="ri-line-chart-line"></i> Avg {prod.avg_days_to_sell} days to sell
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Full Table */}
      <div className="pp-panel">
        <div className="pp-panel-header">
          <h2 className="pp-panel-title">Full Product Table</h2>
        </div>
        <div className="pp-table-wrapper">
          <table className="pp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sell-Through</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Margin</th>
                <th>Velocity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((prod, idx) => {
                const vColor = getVelocityColor(prod.velocity);
                return (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{prod.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.item_code}</div>
                    </td>
                    <td>
                      <div className="pp-table-progress">
                        <div className="pp-table-progress-bar">
                          <div className="pp-pc-progress-fill" style={{ width: `${prod.sell_through_rate}%`, backgroundColor: vColor }}></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{prod.sell_through_rate}%</span>
                      </div>
                    </td>
                    <td className="val-revenue" style={{ fontWeight: 600 }}>{formatCompact(prod.total_revenue)}</td>
                    <td className="val-profit" style={{ fontWeight: 600 }}>{formatCompact(prod.gross_profit)}</td>
                    <td className="val-margin" style={{ fontWeight: 600 }}>{prod.profit_margin_percent}%</td>
                    <td>
                      <span className={`pp-badge badge-velocity-${prod.velocity?.toLowerCase() || 'medium'}`}>
                        {prod.velocity}
                      </span>
                    </td>
                    <td>
                      <span className={`pp-badge badge-status-${prod.status?.toLowerCase() || 'healthy'}`}>
                        {prod.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
