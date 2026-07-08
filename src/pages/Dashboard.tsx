import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, ShoppingCart, Landmark } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet } from '../lib/api';
import type { Invoice, Voucher, BankAccount } from '../lib/types';
import { inr, num, fmtDate, monthLabel } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, StatusBadge } from '../components/ui';

interface BankingRes { accounts: BankAccount[]; transactions: unknown[] }

export default function Dashboard() {
  const { company } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    Promise.all([
      apiGet<Invoice[]>(`/invoices?company_id=${company.id}`),
      apiGet<Voucher[]>(`/vouchers?company_id=${company.id}`),
      apiGet<BankingRes>(`/banking?company_id=${company.id}`),
    ])
      .then(([inv, vch, bank]) => {
        setInvoices(inv);
        setVouchers(vch);
        setAccounts(bank.accounts);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [company]);

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} />;

  const sales = invoices.filter((i) => i.inv_type === 'Sales');
  const purchases = invoices.filter((i) => i.inv_type === 'Purchase');
  const receivables = sales.filter((i) => i.status !== 'Paid').reduce((s, i) => s + num(i.total), 0);
  const payables = purchases.filter((i) => i.status !== 'Paid').reduce((s, i) => s + num(i.total), 0);
  const cashBank = accounts.reduce((s, a) => s + num(a.balance), 0);
  const totalSales = sales.reduce((s, i) => s + num(i.total), 0);
  const totalPurchases = purchases.reduce((s, i) => s + num(i.total), 0);
  const outputTax = sales.reduce((s, i) => s + num(i.cgst) + num(i.sgst) + num(i.igst), 0);
  const inputTax = purchases.reduce((s, i) => s + num(i.cgst) + num(i.sgst) + num(i.igst), 0);

  // monthly series
  const months: Record<string, { sales: number; purchases: number }> = {};
  invoices.forEach((i) => {
    const key = (i.date || '').slice(0, 7);
    if (!key) return;
    months[key] = months[key] || { sales: 0, purchases: 0 };
    if (i.inv_type === 'Sales') months[key].sales += num(i.total);
    else months[key].purchases += num(i.total);
  });
  const series = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxVal = Math.max(1, ...series.flatMap(([, v]) => [v.sales, v.purchases]));

  const kpis = [
    { label: 'Receivables', value: receivables, icon: ArrowDownRight, note: `${sales.filter((i) => i.status !== 'Paid').length} open invoices`, tone: 'text-primary' },
    { label: 'Payables', value: payables, icon: ArrowUpRight, note: `${purchases.filter((i) => i.status !== 'Paid').length} open bills`, tone: 'text-danger' },
    { label: 'Cash & Bank', value: cashBank, icon: Wallet, note: `${accounts.length} accounts`, tone: 'text-success' },
    { label: 'Sales (FY)', value: totalSales, icon: TrendingUp, note: `${sales.length} invoices`, tone: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, note, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{inr(value)}</p>
                <p className="mt-1 text-xs text-muted">{note}</p>
              </div>
              <div className={`rounded-xl bg-cream p-2.5 ${tone}`}>
                <Icon size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Sales vs Purchases" subtitle="Last 6 months" />
          <div className="px-5 py-5">
            <div className="flex items-end gap-3 sm:gap-5" style={{ height: 220 }}>
              {series.map(([key, v]) => (
                <div key={key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center gap-1.5">
                    <div className="w-full max-w-[26px] rounded-t-md bg-primary" style={{ height: `${(v.sales / maxVal) * 100}%` }} title={`Sales ${inr(v.sales)}`} />
                    <div className="w-full max-w-[26px] rounded-t-md bg-ink/25" style={{ height: `${(v.purchases / maxVal) * 100}%` }} title={`Purchases ${inr(v.purchases)}`} />
                  </div>
                  <span className="text-[10px] font-medium text-muted">{monthLabel(key)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-5 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Sales</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-ink/25" /> Purchases</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="GST Snapshot" subtitle="Current period" action={<Link to="/accounting/gst" className="text-xs font-semibold text-primary hover:underline">View →</Link>} />
          <div className="space-y-4 px-5 py-5">
            {[
              { label: 'Output Tax (Sales)', value: outputTax, icon: TrendingUp },
              { label: 'Input Credit (Purchases)', value: inputTax, icon: ShoppingCart },
              { label: 'Net GST Payable', value: Math.max(0, outputTax - inputTax), icon: Landmark },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-cream px-4 py-3">
                <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <Icon size={15} className="text-primary" /> {label}
                </div>
                <span className="font-semibold text-ink">{inr(value)}</span>
              </div>
            ))}
            <p className="text-xs text-muted">Net purchases this FY: {inr(totalPurchases)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Vouchers" action={<Link to="/accounting/vouchers" className="text-xs font-semibold text-primary hover:underline">All vouchers →</Link>} />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Voucher</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Party / Narration</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.slice(0, 8).map((v) => (
                <tr key={v.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3 text-ink-soft">{fmtDate(v.date)}</td>
                  <td className="px-5 py-3 font-medium text-ink">{v.voucher_no}</td>
                  <td className="px-5 py-3"><StatusBadge status={v.voucher_type} /></td>
                  <td className="px-5 py-3 text-ink-soft">{v.party || v.narration}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{inr(v.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
