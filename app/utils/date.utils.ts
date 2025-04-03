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
export const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
