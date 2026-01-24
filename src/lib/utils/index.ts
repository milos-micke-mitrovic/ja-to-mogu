export { cn } from './cn';

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string = 'RSD'): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Serbian locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format time to Serbian locale
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get current season based on month
 */
export function getCurrentSeason(): 'LOW' | 'MID' | 'HIGH' {
  const month = new Date().getMonth() + 1;
  if ([7, 8].includes(month)) return 'HIGH';
  if ([5, 6, 9].includes(month)) return 'LOW';
  return 'MID';
}

/**
 * Calculate reservation expiry date (36 hours from now)
 */
export function calculateExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 36);
  return expiry;
}

/**
 * Check if reservation has expired
 */
export function isReservationExpired(expiryDate: Date | string): boolean {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return new Date() > expiry;
}

/**
 * Generate Google Maps URL from coordinates
 */
export function getGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Generate WhatsApp chat link
 */
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Generate Viber chat link
 */
export function getViberLink(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `viber://chat?number=${cleanPhone}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay execution (useful for testing/debugging)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
