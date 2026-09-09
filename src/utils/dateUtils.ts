export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Format a Date object to YYYY-MM-DD string in local time
 */
export function formatToDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string into a local Date object without timezone offset bugs
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get dynamic today's date key
 */
export function getTodayKey(): string {
  return formatToDateKey(new Date());
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get total days in a given year
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Get Day of the Year (e.g. Day 247 of 365)
 */
export function getDayOfYearInfo(date: Date): { dayNumber: number; totalDays: number } {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayNumber = Math.floor(diff / oneDay);
  const totalDays = getDaysInYear(date.getFullYear());
  return { dayNumber, totalDays };
}

/**
 * Format parts for the main diary page:
 * dayNumber: "04", monthName: "September", weekday: "Friday", year: 2026, dayOfYear: "Day 247 of 365"
 */
export function getDiaryDateDetails(dateKey: string) {
  const date = parseDateKey(dateKey);
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const year = date.getFullYear();
  const { dayNumber, totalDays } = getDayOfYearInfo(date);

  return {
    day,
    month,
    weekday,
    year,
    dayOfYear: dayNumber,
    totalDays,
    formattedLong: `${month} ${date.getDate()}, ${year}`,
    dayOfWeekAndYear: `${weekday}, ${year}`,
  };
}

/**
 * Get the previous date key
 */
export function getPreviousDateKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() - 1);
  return formatToDateKey(date);
}

/**
 * Get the next date key
 */
export function getNextDateKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + 1);
  return formatToDateKey(date);
}

/**
 * Get days in a specific month of a year
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Get starting day of week for a month (0 = Sunday, 1 = Monday...)
 */
export function getFirstDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

/**
 * Extract MM-DD from YYYY-MM-DD
 */
export function getMonthDayString(dateKey: string): string {
  const parts = dateKey.split('-');
  return `${parts[1]}-${parts[2]}`;
}

/**
 * Get user's local timezone name and abbreviation
 * e.g. "India Standard Time (IST)" or "Eastern Standard Time (EST)"
 */
export function getUserTimezoneDetails(): { iana: string; name: string; short: string; fullLabel: string } {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    
    // Get short name (e.g., IST, EST, GMT+5:30)
    const shortFormatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
    const shortParts = shortFormatter.formatToParts(now);
    let short = shortParts.find((p) => p.type === 'timeZoneName')?.value || 'Local';

    // Get long name (e.g., India Standard Time)
    const longFormatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'long' });
    const longParts = longFormatter.formatToParts(now);
    let name = longParts.find((p) => p.type === 'timeZoneName')?.value || iana;

    if (iana === 'Asia/Kolkata' || name.includes('India Standard Time')) {
      short = 'IST';
      name = 'India Standard Time';
    }

    const fullLabel = name !== short ? `${name} (${short})` : name;
    return { iana, name, short, fullLabel };
  } catch {
    return { iana: 'UTC', name: 'UTC', short: 'UTC', fullLabel: 'Universal Time (UTC)' };
  }
}

/**
 * Calculate UTC timestamp in ms given a date string (YYYY-MM-DD), time string (HH:mm), and local context
 */
export function calculateDeliveryTimestamp(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  return date.getTime();
}

/**
 * Generate a cryptographically secure, unpredictable 32-character random token for letter links
 */
export function generateSecureLetterToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return 'ltr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Format a 24h time string (HH:mm) into an elegant 12h display string (e.g., "7:30 PM")
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '12:00 PM';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Calculate countdown remaining until a target timestamp
 */
export function calculateRemainingCountdown(targetTimestamp: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isReady: boolean;
  formatted: string;
} {
  const diff = targetTimestamp - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isReady: true, formatted: 'Ready to deliver' };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  formatted += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  return { days, hours, minutes, seconds, isReady: false, formatted };
}
