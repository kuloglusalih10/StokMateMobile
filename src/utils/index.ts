import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const formatDateTimeToISO = (date: Date, time: Date) => {
  const dateObj = dayjs(date);
  const timeObj = dayjs(time);

  const combined = dateObj
    .hour(timeObj.hour())
    .minute(timeObj.minute())
    .second(timeObj.second() || 0);

  return combined.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
};

export const formatToISO = (dateObj: dayjs.Dayjs) => {
  return dateObj.format('YYYY-MM-DD');
};

export const formatDateToYYYYMMDD = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toLocalISOString = (date: Date) => {
  const d = new Date(date);

  const fixedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);

  const timezoneOffset = fixedDate.getTimezoneOffset() * 60000;

  const adjustedDate = new Date(fixedDate.getTime() - timezoneOffset);

  return adjustedDate.toISOString();
};

export const formatDateFromISO = (isoString: string) => {
  const date = new Date(isoString);

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month}/${day}/${year}`;
};

export const parseISOToDayjs = (isoString: string) => {
  return isoString ? dayjs(isoString) : null;
};

export const formatRelativeTime = (isoString: string): string => {
  const now = dayjs();
  const date = dayjs(isoString);
  const diffMinutes = now.diff(date, 'minute');

  if (diffMinutes < 1) return 'Az önce';
  if (diffMinutes < 60) return `${diffMinutes} dakika önce`;

  const diffHours = now.diff(date, 'hour');
  if (diffHours < 24) return `${diffHours} saat önce`;

  const diffDays = now.diff(date, 'day');
  if (diffDays < 7) return `${diffDays} gün önce`;

  const diffWeeks = now.diff(date, 'week');
  if (diffWeeks < 4) return `${diffWeeks} hafta önce`;

  return date.format('DD/MM/YYYY');
};

export const formatPriceFromKurus = (kurus: number) => {
  const lira = kurus / 100;

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(lira);
};

export const hexWithAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${normalized}${value}`;
};
