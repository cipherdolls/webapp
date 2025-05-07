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
export const formatDate = (dateString: Date | string) => {
  const date = new Date(dateString);
  return moment(date).format('DD MMM YYYY,HH:mm');
};
