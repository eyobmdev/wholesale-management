import React from 'react';
import { useStockOverview } from '../../../../services/dashboardService.js';
import { formatCurrency } from '../../../../utils/formatters.js';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './StockOverview.css';

// Colors mapped to status
const STATUS_COLORS = {
  healthy_stock_count: { label: 'Healthy', color: '#10b981' }, // Green
  low_stock_count: { label: 'Low Stock', color: '#f59e0b' },    // Yellow/Orange
  sold_out_count: { label: 'Sold Out', color: '#ef4444' }       // Red
};

// Colors for the stacked bar chart (Purchased, Remaining, Sold)
const BAR_COLORS = {
  purchased: '#e0e7ff', // Very light indigo
  remaining: '#10b981', // Green
  sold: '#4f46e5'       // Deep indigo
};

const getBadgeStyle = (status) => {
  switch (status) {
    case 'available':
      return 'stat-bg-success stat-text-success';
    case 'low_stock':
      return 'stat-bg-info stat-text-info'; // Info acts as orange/warning in our theme sometimes, or we can use custom
    case 'sold_out':
      return 'stat-bg-danger stat-text-danger';
    default:
      return 'stat-bg-primary stat-text-primary';
  }
};

const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-color)' }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Products: <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-color)' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {p.name}: <span style={{ color: p.color, fontWeight: 600 }}>{p.value} bags</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StockOverviewTab() {
  const { data, isLoading, isError } = useStockOverview();

  if (isLoading) {
    return (
      <div className="so-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '16px' }}></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="so-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#ef4444' }}>
          <p>Failed to load stock overview data.</p>
        </div>
      </div>
    );
  }

  const { 
    total_stock_value = 0, 
    total_products = 0, 
    total_batches = 0, 
    sold_out_count = 0, 
    low_stock_count = 0, 
    healthy_stock_count = 0, 
    products = [] 
  } = data || {};

  // Donut Chart Data
  const pieData = [
    { name: STATUS_COLORS.healthy_stock_count.label, value: healthy_stock_count, color: STATUS_COLORS.healthy_stock_count.color },
    { name: STATUS_COLORS.low_stock_count.label, value: low_stock_count, color: STATUS_COLORS.low_stock_count.color },
    { name: STATUS_COLORS.sold_out_count.label, value: sold_out_count, color: STATUS_COLORS.sold_out_count.color }
  ].filter(d => d.value > 0);

  // Bar Chart Data (Top products by volume or just all products if small)
  const barData = products.slice(0, 8).map(p => ({
    name: p.product_name,
    Purchased: p.total_bags_purchased,
    Sold: p.total_bags_sold,
    Remaining: p.total_bags_remaining
  }));

  return (
    <div className="so-page">
      <div className="so-header">
        <h1 className="so-title">Stock Overview</h1>
        <p className="so-subtitle">Complete inventory health by product</p>
      </div>

      {/* 1. Top Stat Cards */}
      <div className="so-summary-row">
        <div className="so-summary-card stat-bg-primary">
          <p className="so-summary-label stat-text-primary">
            <i className="ri-box-3-line"></i> Total Stock Value
          </p>
          <h3 className="so-summary-value stat-text-primary">{formatCurrency(total_stock_value)}</h3>
        </div>
        <div className="so-summary-card stat-bg-success">
          <p className="so-summary-label stat-text-success">
            <i className="ri-check-line"></i> Products
          </p>
          <h3 className="so-summary-value stat-text-success">{total_products}</h3>
        </div>
        <div className="so-summary-card stat-bg-info">
          <p className="so-summary-label stat-text-info">
            <i className="ri-error-warning-line"></i> Low Stock
          </p>
          <h3 className="so-summary-value stat-text-info">{low_stock_count}</h3>
        </div>
        <div className="so-summary-card stat-bg-danger">
          <p className="so-summary-label stat-text-danger">
            <i className="ri-close-circle-line"></i> Sold Out
          </p>
          <h3 className="so-summary-value stat-text-danger">{sold_out_count}</h3>
        </div>
      </div>

      {/* 2. Middle Row (Donut vs Bar Chart) */}
      <div className="so-middle-row">
        
        {/* Left: Stock Health Distribution (Donut Chart) */}
        <div className="so-panel">
          <div className="so-panel-header">
            <h2 className="so-panel-title">Stock Health Distribution</h2>
          </div>
          <div className="so-panel-content" style={{ justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomDonutTooltip />} cursor={{fill: 'transparent'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="so-donut-legend">
                  {pieData.map(entry => (
                    <div key={entry.name} className="so-legend-item">
                      <span className="so-legend-dot" style={{ backgroundColor: entry.color }}></span>
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No stock data available
              </div>
            )}
          </div>
        </div>

        {/* Right: Bags Purchased vs Sold vs Remaining (Horizontal Bar) */}
        <div className="so-panel">
          <div className="so-panel-header">
            <h2 className="so-panel-title">Bags Purchased vs Sold vs Remaining</h2>
            <p className="so-panel-subtitle">Count of bags</p>
          </div>
          <div className="so-panel-content">
            {barData.length > 0 ? (
              <>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--card-border)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={100} />
                      <RechartsTooltip content={<CustomBarTooltip />} cursor={{fill: 'var(--hover-bg)'}} />
                      {/* Note: The screenshot uses overlapping/grouped bars. We will use grouped bars here. */}
                      <Bar dataKey="Purchased" fill={BAR_COLORS.purchased} barSize={6} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Sold" fill={BAR_COLORS.sold} barSize={6} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Remaining" fill={BAR_COLORS.remaining} barSize={6} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="so-bar-legend">
                  <div className="so-legend-item">
                    <span className="so-legend-dot" style={{ backgroundColor: BAR_COLORS.purchased }}></span>
                    <span>Purchased</span>
                  </div>
                  <div className="so-legend-item">
                    <span className="so-legend-dot" style={{ backgroundColor: BAR_COLORS.remaining }}></span>
                    <span>Remaining</span>
                  </div>
                  <div className="so-legend-item">
                    <span className="so-legend-dot" style={{ backgroundColor: BAR_COLORS.sold }}></span>
                    <span>Sold</span>
                  </div>
                </div>
              </>
            ) : (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                 No product data available
               </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom List: Products Detail Table */}
      <div className="so-panel">
        <div className="so-panel-header">
          <h2 className="so-panel-title">Products Detail</h2>
        </div>
        
        <div className="so-table-wrapper">
          <table className="so-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Purchased</th>
                <th style={{ textAlign: 'right' }}>Sold</th>
                <th style={{ textAlign: 'right' }}>Remaining</th>
                <th style={{ textAlign: 'right' }}>Stock Value</th>
                <th style={{ textAlign: 'center' }}>Batches</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No products found.</td>
                </tr>
              ) : (
                products.map((prod, idx) => {
                  const soldPercent = prod.total_bags_purchased > 0 
                    ? Math.round((prod.total_bags_sold / prod.total_bags_purchased) * 100) 
                    : 0;

                  return (
                    <tr key={`${prod.item_code}-${idx}`}>
                      <td>
                        <div className="so-product-name">{prod.product_name}</div>
                        <div className="so-product-code">{prod.item_code}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        {prod.total_bags_purchased}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {prod.total_bags_sold} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>({soldPercent}%)</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: prod.total_bags_remaining === 0 ? '#ef4444' : '#10b981' }}>
                        {prod.total_bags_remaining}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(prod.stock_value)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {prod.batch_count}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`so-badge ${getBadgeStyle(prod.status)}`}>
                          {prod.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
