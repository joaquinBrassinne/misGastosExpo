export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '$ 0,00';
  
  const parts = Math.abs(amount).toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  
  const sign = amount < 0 ? '-' : '';
  return `${sign}$ ${integerPart},${decimalPart}`;
}

export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$ ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$ ${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

