import { format, differenceInDays, parseISO } from 'date-fns';

// Format a date string for display: '15 Jan 2025'
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

// Format date + time: '15 Jan 2025, 10:30 AM'
export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
}

// Calculate number of days between two date strings
export function calcDays(pickup: string, returnDate: string): number {
  return Math.max(differenceInDays(parseISO(returnDate), parseISO(pickup)), 1);
}

// Format a number as currency: 1200 -> '$1,200.00'
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Truncate long text with ellipsis
export function truncate(text: string, maxLen = 100): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

// Get star display for a numeric rating
export function ratingToStars(rating: number): string {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// Return a CSS class for a booking status badge
export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active:    'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

// Build query string from an object: { page:1, city:'Dhaka' } -> '?page=1&city=Dhaka'
export function buildQuery(params: Record<string, any>): string {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  return '?' + new URLSearchParams(clean as Record<string,string>).toString();
}