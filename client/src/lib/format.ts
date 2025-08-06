export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `£${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `£${(price / 1000).toFixed(0)}k`;
  }
  return `£${price.toLocaleString()}`;
};

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `£${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `£${(amount / 1000).toFixed(0)}k`;
  }
  if (amount < 0) {
    return `-£${Math.abs(amount).toLocaleString()}`;
  }
  return `£${amount.toLocaleString()}`;
};

export const formatSize = (size: number): string => {
  return `${size} sqm`;
};

export const formatProfit = (profit: number): string => {
  if (profit >= 1000) {
    return `£${(profit / 1000).toFixed(1)}k`;
  }
  return `£${profit.toLocaleString()}`;
};

export const formatPercentage = (value?: number): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(1)}%`;
};

export const formatTimeAgo = (minutes: number): string => {
  if (minutes === 0) {
    return 'just now';
  }
  if (minutes === 1) {
    return '1 minute ago';
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return '1 hour ago';
  }
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return '1 day ago';
  }
  return `${days} days ago`;
};