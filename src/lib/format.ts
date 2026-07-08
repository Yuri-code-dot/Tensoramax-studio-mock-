export const inr = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const num = (n: number | string) => Number(n) || 0;

export const fmtDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(m) - 1]} '${y.slice(2)}`;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
