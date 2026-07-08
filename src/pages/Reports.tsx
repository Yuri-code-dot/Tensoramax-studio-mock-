import { useEffect, useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet } from '../lib/api';
import type { Ledger, Voucher } from '../lib/types';
import { inr, num, fmtDate } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, Badge } from '../components/ui';

const TABS = ['Profit & Loss', 'Balance Sheet', 'Trial Balance', 'Day Book'] as const;

export default function Reports() {
  const { company } = useCompany();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Profit & Loss');

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    Promise.all([
      apiGet<Ledger[]>(`/ledgers?company_id=${company.id}`),
      apiGet<Voucher[]>(`/vouchers?company_id=${company.id}`),
    ])
      .then(([l, v]) => { setLedgers(l); setVouchers(v); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [company]);

  if (loading) return <Loading label="Preparing reports…" />;
  if (error) return <ErrorState message={error} />;

  const sum = (cat: string) => ledgers.filter((l) => l.category === cat).reduce((s, l) => s + num(l.balance), 0);
  const income = sum('Income');
  const expenses = sum('Expenses');
  const assets = sum('Assets');
  const liabilities = sum('Liabilities');
  const netProfit = income - expenses;

  const groupRows = (cat: string) => {
    const groups: Record<string, number> = {};
    ledgers.filter((l) => l.category === cat).forEach((l) => {
      groups[l.group_name] = (groups[l.group_name] || 0) + num(l.balance);
    });
    return Object.entries(groups);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              tab === t ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-soft hover:border-primary/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profit & Loss' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Income" action={<Badge tone="success">{inr(income)}</Badge>} />
            <div className="divide-y divide-line/60 px-5">
              {groupRows('Income').map(([g, v]) => (
                <div key={g} className="flex justify-between py-3 text-sm"><span className="text-ink-soft">{g}</span><span className="font-medium text-ink">{inr(v)}</span></div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Expenses" action={<Badge tone="danger">{inr(expenses)}</Badge>} />
            <div className="divide-y divide-line/60 px-5">
              {groupRows('Expenses').map(([g, v]) => (
                <div key={g} className="flex justify-between py-3 text-sm"><span className="text-ink-soft">{g}</span><span className="font-medium text-ink">{inr(v)}</span></div>
              ))}
            </div>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold text-ink">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
              <p className={`font-display text-2xl font-semibold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>{inr(Math.abs(netProfit))}</p>
            </div>
            <p className="mt-1 text-xs text-muted">Income {inr(income)} − Expenses {inr(expenses)}</p>
          </Card>
        </div>
      )}

      {tab === 'Balance Sheet' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Liabilities & Capital" action={<Badge>{inr(liabilities + Math.max(0, netProfit))}</Badge>} />
            <div className="divide-y divide-line/60 px-5">
              {groupRows('Liabilities').map(([g, v]) => (
                <div key={g} className="flex justify-between py-3 text-sm"><span className="text-ink-soft">{g}</span><span className="font-medium text-ink">{inr(v)}</span></div>
              ))}
              <div className="flex justify-between py-3 text-sm"><span className="text-ink-soft">Profit & Loss A/c</span><span className="font-medium text-ink">{inr(Math.max(0, netProfit))}</span></div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Assets" action={<Badge>{inr(assets)}</Badge>} />
            <div className="divide-y divide-line/60 px-5">
              {groupRows('Assets').map(([g, v]) => (
                <div key={g} className="flex justify-between py-3 text-sm"><span className="text-ink-soft">{g}</span><span className="font-medium text-ink">{inr(v)}</span></div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'Trial Balance' && (
        <Card>
          <CardHeader title="Trial Balance" subtitle="All ledgers with closing balances" />
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Ledger</th>
                  <th className="px-5 py-3">Group</th>
                  <th className="px-5 py-3 text-right">Debit</th>
                  <th className="px-5 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-ink">{l.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{l.group_name}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{l.balance_type === 'Dr' ? inr(l.balance) : '—'}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{l.balance_type === 'Cr' ? inr(l.balance) : '—'}</td>
                  </tr>
                ))}
                <tr className="bg-cream font-semibold text-ink">
                  <td className="px-5 py-3" colSpan={2}>Total</td>
                  <td className="px-5 py-3 text-right">{inr(ledgers.filter((l) => l.balance_type === 'Dr').reduce((s, l) => s + num(l.balance), 0))}</td>
                  <td className="px-5 py-3 text-right">{inr(ledgers.filter((l) => l.balance_type === 'Cr').reduce((s, l) => s + num(l.balance), 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'Day Book' && (
        <Card>
          <CardHeader title="Day Book" subtitle="Chronological register of all vouchers" />
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Voucher</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Particulars</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 text-ink-soft">{fmtDate(v.date)}</td>
                    <td className="px-5 py-3 font-medium text-ink">{v.voucher_no}</td>
                    <td className="px-5 py-3 text-ink-soft">{v.voucher_type}</td>
                    <td className="px-5 py-3 text-ink-soft">{v.debit_ledger} → {v.credit_ledger}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(v.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
