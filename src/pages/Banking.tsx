import { useEffect, useState } from 'react';
import { Landmark, CheckCircle2, CircleDashed } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { BankAccount, BankTxn } from '../lib/types';
import { inr, num, fmtDate } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, EmptyState, Badge } from '../components/ui';

export default function Banking() {
  const { company } = useCompany();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [txns, setTxns] = useState<BankTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const load = () => {
    if (!company) return;
    apiGet<{ accounts: BankAccount[]; transactions: BankTxn[] }>(`/banking?company_id=${company.id}`)
      .then((d) => { setAccounts(d.accounts); setTxns(d.transactions); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); setSelected(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company]);

  const toggleReconcile = async (t: BankTxn) => {
    setTxns((prev) => prev.map((x) => (x.id === t.id ? { ...x, reconciled: !x.reconciled } : x)));
    try {
      await apiSend('/banking', 'PUT', { id: t.id, reconciled: !t.reconciled });
    } catch {
      load();
    }
  };

  if (loading) return <Loading label="Loading banking…" />;
  if (error) return <ErrorState message={error} />;

  const shown = selected ? txns.filter((t) => t.account_id === selected) : txns;
  const unreconciled = txns.filter((t) => !t.reconciled).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <Card
            key={a.id}
            className={`cursor-pointer p-5 transition ${selected === a.id ? 'ring-2 ring-primary' : 'hover:border-primary/40'}`}
          >
            <button className="w-full text-left" onClick={() => setSelected(selected === a.id ? null : a.id)}>
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Landmark size={18} /></div>
                <Badge>{a.account_type}</Badge>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">{a.bank_name}</h3>
              <p className="text-xs text-muted">{a.account_no} · {a.ifsc}</p>
              <p className="mt-3 font-display text-xl font-semibold text-ink">{inr(a.balance)}</p>
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Transaction Feed"
          subtitle={selected ? 'Filtered to selected account — click the card again to clear' : `All accounts · ${unreconciled} unreconciled`}
        />
        {shown.length === 0 ? (
          <EmptyState message="No transactions." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Reconciled</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 text-ink-soft">{fmtDate(t.date)}</td>
                    <td className="px-5 py-3 text-ink">{t.description}</td>
                    <td className="px-5 py-3">
                      <Badge tone={t.txn_type === 'Credit' ? 'success' : 'danger'}>{t.txn_type}</Badge>
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${t.txn_type === 'Credit' ? 'text-success' : 'text-danger'}`}>
                      {t.txn_type === 'Credit' ? '+' : '−'}{inr(num(t.amount))}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleReconcile(t)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                          t.reconciled
                            ? 'border-success/25 bg-success/10 text-success'
                            : 'border-line bg-cream text-muted hover:border-primary/40'
                        }`}
                      >
                        {t.reconciled ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
                        {t.reconciled ? 'Reconciled' : 'Mark'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
