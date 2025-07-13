// Currency and formatting utilities for Astro-BSM Portal

/**
 * Format amount in Nigerian Naira
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show the ₦ symbol
 * @returns {string} Formatted currency string
 */
export const formatNaira = (amount, showSymbol = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '₦0.00' : '0.00';
  }

  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  // Replace NGN with ₦ symbol
  return formatted.replace('NGN', '₦').replace('NGN ', '₦');
};

/**
 * Format amount without currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string
 */
export const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseNaira = (currencyString) => {
  if (typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols and spaces, then parse
  const cleaned = currencyString.replace(/[₦,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate delivery fee in Naira
 * @param {string} deliveryMethod - Delivery method ('standard', 'express', 'overnight')
 * @returns {number} Delivery fee in Naira
 */
export const getDeliveryFee = (deliveryMethod) => {
  switch (deliveryMethod) {
    case 'express': return 5000.00; // ₦5,000
    case 'overnight': return 8000.00; // ₦8,000
    case 'standard': 
    default: return 2500.00; // ₦2,500
  }
};

/**
 * Calculate tax (VAT) for Nigeria
 * @param {number} amount - Amount to calculate tax on
 * @param {number} taxRate - Tax rate (default 7.5% VAT)
 * @returns {number} Tax amount
 */
export const calculateVAT = (amount, taxRate = 0.075) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 0;
  }
  return amount * taxRate;
};

/**
 * Get currency symbol
 * @returns {string} Nigerian Naira symbol
 */
export const getCurrencySymbol = () => '₦';

/**
 * Format large numbers with appropriate suffixes
 * @param {number} amount - Amount to format
 * @returns {string} Formatted string with K, M suffixes
 */
export const formatLargeAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₦0';
  }

  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatNaira(amount);
  }
};

export default {
  formatNaira,
  formatAmount,
  parseNaira,
  getDeliveryFee,
  calculateVAT,
  getCurrencySymbol,
  formatLargeAmount
};
