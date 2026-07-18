import React from 'react';
import { SummaryCard } from '../../../../components/common/index.js';

const cardIcons = [
  "ri-line-chart-line", 
  "ri-money-dollar-circle-line", 
  "ri-arrow-right-down-line", 
  "ri-bank-card-line", 
  "ri-building-2-line", 
  "ri-box-3-line"
];

const cardColors = [
  "linear-gradient(135deg, #3b82f6, #4f46e5)", // blue to indigo
  "linear-gradient(135deg, #10b981, #0d9488)", // emerald to teal
  "linear-gradient(135deg, #ef4444, #e11d48)", // red to rose
  "linear-gradient(135deg, #f59e0b, #ea580c)", // amber to orange
  "linear-gradient(135deg, #8b5cf6, #9333ea)", // violet to purple
  "linear-gradient(135deg, #06b6d4, #2563eb)", // cyan to blue
];

export function DashboardCards({ cards = [] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <>
      <style>{`
        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (min-width: 640px) {
          .summary-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 768px) {
          .summary-cards-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .summary-cards-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
      <div className="summary-cards-grid">
        {cards.map((card, i) => (
          <div key={card.label} style={{ minWidth: 0, height: '100%' }}>
            <SummaryCard
              label={card.label}
              value={card.value}
              currency={card.currency}
              change_percent={card.change_percent}
              change_direction={card.change_direction}
              is_positive={card.is_positive}
              iconClass={cardIcons[i % cardIcons.length]}
              colorGradient={cardColors[i % cardColors.length]}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function DashboardCardsSkeleton() {
  return (
    <div className="summary-cards-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
      ))}
    </div>
  );
}
