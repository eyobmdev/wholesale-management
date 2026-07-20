import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function MonthlyComparison({ data }) {
  if (!data) return null;

  const chartData = [
    { name: "Sales", "This Month": data.sales.this_month / 1000, "Last Month": data.sales.last_month / 1000 },
    { name: "Profit", "This Month": data.profit.this_month / 1000, "Last Month": data.profit.last_month / 1000 },
    { name: "Expenses", "This Month": data.expenses.this_month / 1000, "Last Month": data.expenses.last_month / 1000 },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>Monthly Comparison</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>This month vs last month</p>
        </div>
      </div>
      <div style={{ height: '220px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(val) => [`${Number(val).toFixed(0)}K ETB`, ""]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="This Month" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Last Month" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyComparisonSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      padding: '20px',
      height: '100%'
    }}>
      <Skeleton height={20} width={150} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width={200} style={{ marginBottom: 24 }} />
      <Skeleton height={200} width="100%" borderRadius={8} />
    </div>
  );
}
