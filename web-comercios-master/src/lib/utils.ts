import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind class deduplication
 *
 * @example
 * cn('px-4 py-2', condition && 'bg-primary-600', 'text-white')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format points with thousands separator
 * @example formatPoints(1000) => "1.000"
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('es-VE');
}

/**
 * Format currency in Venezuelan Bolivares
 * @example formatCurrency(1000) => "Bs. 1.000,00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 * @example truncate('Long text', 10) => "Long text..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate initials from name
 * @example getInitials('Juan Pérez') => "JP"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
