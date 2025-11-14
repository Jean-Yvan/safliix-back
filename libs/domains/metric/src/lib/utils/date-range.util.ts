export function getMonthRange(date: Date, offset = 0) {
  const targetDate = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
