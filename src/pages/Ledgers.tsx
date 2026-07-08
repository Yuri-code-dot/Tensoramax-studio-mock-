import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { Ledger } from '../lib/types';
import { inr } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge } from '../components/ui';

const CATEGORIES = ['Assets', 'Liabilities', 'Income', 'Expenses'];
const GROUPS: Record<string, string[]> = {
  Assets: ['Current Assets', 'Fixed Assets', 'Bank Accounts', 'Cash-in-Hand', 'Sundry Debtors'],
  Liabilities: ['Current Liabilities', 'Loans', 'Sundry Creditors', 'Duties & Taxes', 'Capital Account'],
  Income: ['Sales Accounts', 'Direct Income', 'Indirect Income'],
  Expenses: ['Purchase Accounts', 'Direct Expenses', 'Indirect Expenses'],
};

const emptyForm = { name: '', category: 'Assets', group_name: 'Current Assets', opening_balance: '', balance_type: 'Dr' };

export default function Ledgers() {
  const { company } = useCompany();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ledger | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Ledger | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!company) { setLedgers([]); setLoading(false); return; }
    apiGet<Ledger[]>(`/ledgers?company_id=${company.id}`)
      .then((d) => { setLedgers(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company]);

  const filtered = useMemo(
    () => ledgers.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.group_name.toLowerCase().includes(search.toLowerCase())),
    [ledgers, search],
  );

  const byCategory = CATEGORIES.map((cat) => ({ cat, items: filtered.filter((l) => l.category === cat) })).filter((g) => g.items.length);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (l: Ledger) => {
    setEditing(l);
    setForm({ name: l.name, category: l.category, group_name: l.group_name, opening_balance: String(Number(l.opening_balance)), balance_type: l.balance_type });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Ledger name is required'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiSend('/ledgers', 'PUT', {
          id: editing.id, name: form.name.trim(), category: form.category, group_name: form.group_name,
          opening_balance: Number(form.opening_balance) || 0, balance_type: form.balance_type,
        });
      } else {
        await apiSend('/ledgers', 'POST', {
          company_id: company.id, name: form.name.trim(), category: form.category, group_name: form.group_name,
          opening_balance: Number(form.opening_balance) || 0, balance_type: form.balance_type,
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
      await apiSend('/ledgers', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading ledgers…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder="Search ledgers or groups…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> New Ledger</PrimaryButton>
      </div>

      {byCategory.length === 0 && <Card><EmptyState message={ledgers.length === 0 ? 'No ledgers yet — create your first ledger.' : 'No ledgers match your search.'} /></Card>}

      {byCategory.map(({ cat, items }) => (
        <Card key={cat}>
          <CardHeader title={cat} subtitle={`${items.length} ledgers`} action={<Badge>{inr(items.reduce((s, l) => s + Number(l.balance), 0))}</Badge>} />
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Ledger</th>
                  <th className="px-5 py-3">Group</th>
                  <th className="px-5 py-3 text-right">Opening</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                  <th className="px-5 py-3 text-center">Dr/Cr</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-ink">{l.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{l.group_name}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(l.opening_balance)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(l.balance)}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={l.balance_type === 'Dr' ? 'warning' : 'success'}>{l.balance_type}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(l)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(l)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'Create Ledger'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Ledger Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ratan Traders A/c" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, group_name: GROUPS[e.target.value][0] })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Group">
                <select className={inputCls} value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })}>
                  {GROUPS[form.category].map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening Balance (₹)">
                <input type="number" min="0" className={inputCls} value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} placeholder="0" />
              </Field>
              <Field label="Balance Type">
                <select className={inputCls} value={form.balance_type} onChange={(e) => setForm({ ...form, balance_type: e.target.value })}>
                  <option>Dr</option><option>Cr</option>
                </select>
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Ledger'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Ledger" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">Delete <strong className="text-ink">{confirmDelete.name}</strong>? This cannot be undone.</p>
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
