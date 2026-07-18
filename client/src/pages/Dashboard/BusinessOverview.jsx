import React from 'react';
import { Card } from '../../components/common/index.js';
import { formatCurrencyFull, formatPercent } from '../../utils/formatters.js';

export function BusinessOverview({ data }) {
  if (!data) return null;

  const { cards, total_customers, active_customers, total_factories, total_products, total_stock_batches } = data;

  const getCardData = (labelMatch) => cards?.find(c => c.label.toLowerCase().includes(labelMatch.toLowerCase()));

  const salesCard = getCardData('sales');
  const profitCard = getCardData('profit');
  const creditCard = getCardData('customer credit');
  const factoryBalCard = getCardData('factory balance');
  const stockCard = getCardData('stock value');

  const sentences = [];

  if (salesCard && salesCard.change_percent !== null) {
    const direction = salesCard.is_positive ? 'increased' : 'decreased';
    sentences.push(`Sales ${direction} ${salesCard.change_percent}% compared to last month.`);
  }

  if (profitCard && profitCard.change_percent !== null) {
    const direction = profitCard.is_positive ? 'increased' : 'decreased';
    sentences.push(`Gross profit ${direction} ${profitCard.change_percent}%.`);
  }

  sentences.push(`You currently have ${total_customers || 0} customers (${active_customers || 0} active).`);
  sentences.push(`You currently have ${total_factories || 0} factories.`);
  sentences.push(`Inventory contains ${total_products || 0} products across ${total_stock_batches || 0} stock batches.`);

  if (creditCard) {
    sentences.push(`Customer credit is ${formatCurrencyFull(creditCard.value, creditCard.currency)}.`);
  }

  if (factoryBalCard) {
    sentences.push(`Factory balance is ${formatCurrencyFull(factoryBalCard.value, factoryBalCard.currency)}.`);
  }

  if (stockCard) {
    sentences.push(`Current stock value is ${formatCurrencyFull(stockCard.value, stockCard.currency)}.`);
  }

  return (
    <Card>
      <Card.Header title="Quick Overview" icon="ri-lightbulb-flash-line" />
      <Card.Body>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          lineHeight: '1.8', 
          color: 'var(--text-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          columnGap: '24px',
          rowGap: '8px'
        }}>
          {sentences.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
}

export function BusinessOverviewSkeleton() {
  return (
    <Card>
      <Card.Header title="Quick Overview" icon="ri-lightbulb-flash-line" />
      <Card.Body>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: '20px', width: '90%' }}></div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
