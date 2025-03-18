import moment from 'moment';

export function isNewDay(previous: Date | string | undefined, current: Date | string): boolean {
  if (!previous) return true;
  return !moment(current).isSame(moment(previous), 'day');
}

export function formatTime(timestamp: Date | string): string {
  return moment(timestamp).local().format('HH:mm');
}

export function formatDayMonth(timestamp: Date | string): string {
  return moment(timestamp).local().format('MMMM Do');
}