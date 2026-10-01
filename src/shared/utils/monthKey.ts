/**
 * Month-key helpers ('YYYY-MM'). Duplicated per repository on purpose — the
 * web and mobile repos share no code.
 */
export const toMonthKey = (date: Date | number = new Date()): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const shiftMonthKey = (monthKey: string, delta: number): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  return toMonthKey(new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1));
};
