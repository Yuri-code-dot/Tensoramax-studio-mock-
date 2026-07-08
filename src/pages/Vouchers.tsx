import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { Voucher, Ledger } from '../lib/types';
import { inr, fmtDate, todayISO } from '../lib/format';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, StatusBadge } from '../components/ui';

const TYPES = ['All', 'Payment', 'Receipt', 'Journal', 'Contra', 'Sales', 'Purchase'];
const emptyForm = { voucher_type: 'Payment', date: todayISO(), party: '', debit_ledger: '', credit_ledger: '', amount: '', narration: '' };

export default function Vouchers() {
  const { company } = useCompany();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Voucher | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!company) { setVouchers([]); setLedgers([]); setLoading(false); return; }
    Promise.all([
      apiGet<Voucher[]>(`/vouchers?company_id=${company.id}`),
      apiGet<Ledger[]>(`/ledgers?company_id=${company.id}`),
    ])
      .then(([v, l]) => { setVouchers(v); setLedgers(l); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company]);

  const filtered = filter === 'All' ? vouchers : vouchers.filter((v) => v.voucher_type === filter);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({
      voucher_type: v.voucher_type, date: v.date, party: v.party,
      debit_ledger: v.debit_ledger, credit_ledger: v.credit_ledger,
      amount: String(Number(v.amount)), narration: v.narration,
    });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setFormErr('Enter a valid amount'); return; }
    if (!form.debit_ledger || !form.credit_ledger) { setFormErr('Select both debit and credit ledgers'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiSend('/vouchers', 'PUT', { id: editing.id, ...form, amount: Number(form.amount) });
      } else {
        const prefix = form.voucher_type.slice(0, 3).toUpperCase();
        await apiSend('/vouchers', 'POST', {
          company_id: company.id,
          voucher_no: `${prefix}-${String(vouchers.length + 101)}`,
          ...form,
          amount: Number(form.amount),
        });
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await apiSend('/vouchers', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading vouchers…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === t ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-soft hover:border-primary/40'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto">
          <PrimaryButton onClick={openCreate}><Plus size={15} /> New Voucher</PrimaryButton>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message={vouchers.length === 0 ? 'No vouchers yet — create your first entry.' : 'No vouchers of this type yet.'} />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Voucher No</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Dr Ledger</th>
                  <th className="px-5 py-3">Cr Ledger</th>
                  <th className="px-5 py-3">Narration</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 text-ink-soft">{fmtDate(v.date)}</td>
                    <td className="px-5 py-3 font-medium text-ink">{v.voucher_no}</td>
                    <td className="px-5 py-3"><StatusBadge status={v.voucher_type} /></td>
                    <td className="px-5 py-3 text-ink-soft">{v.debit_ledger}</td>
                    <td className="px-5 py-3 text-ink-soft">{v.credit_ledger}</td>
                    <td className="px-5 py-3 max-w-[180px] truncate text-muted">{v.narration}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(v.amount)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(v)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(v)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.voucher_no}` : 'New Voucher Entry'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Voucher Type">
                <select className={inputCls} value={form.voucher_type} onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}>
                  {TYPES.slice(1).map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="Party (optional)">
              <input className={inputCls} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="e.g. Sharma Enterprises" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Debit Ledger">
                <select className={inputCls} value={form.debit_ledger} onChange={(e) => setForm({ ...form, debit_ledger: e.target.value })}>
                  <option value="">Select…</option>
                  {ledgers.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </Field>
              <Field label="Credit Ledger">
                <select className={inputCls} value={form.credit_ledger} onChange={(e) => setForm({ ...form, credit_ledger: e.target.value })}>
                  <option value="">Select…</option>
                  {ledgers.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (₹)" error={formErr}>
                <input type="number" min="1" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </Field>
              <Field label="Narration">
                <input className={inputCls} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} placeholder="Being amount paid…" />
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Voucher'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Voucher" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">Delete voucher <strong className="text-ink">{confirmDelete.voucher_no}</strong> ({inr(confirmDelete.amount)})? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-cream">Cancel</button>
              <button onClick={doDelete} disabled={saving} className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
