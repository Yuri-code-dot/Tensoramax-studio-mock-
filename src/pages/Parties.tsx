import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { Party } from '../lib/types';
import { inr, num } from '../lib/format';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge } from '../components/ui';

const emptyForm = { name: '', gstin: '', phone: '', email: '', address: '', balance: '' };

export default function Parties({ kind }: { kind: 'Customer' | 'Supplier' }) {
  const { company } = useCompany();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Party | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!company) { setParties([]); setLoading(false); return; }
    apiGet<Party[]>(`/parties?company_id=${company.id}&party_type=${kind}`)
      .then((d) => { setParties(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company, kind]);

  const filtered = useMemo(
    () => parties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.gstin.toLowerCase().includes(search.toLowerCase())),
    [parties, search],
  );

  const totalBalance = parties.reduce((s, p) => s + num(p.balance), 0);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (p: Party) => {
    setEditing(p);
    setForm({ name: p.name, gstin: p.gstin, phone: p.phone, email: p.email, address: p.address, balance: String(num(p.balance)) });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr(`${kind} name is required`); return; }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { setFormErr('Enter a valid email (or leave blank)'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), gstin: form.gstin, phone: form.phone, email: form.email,
        address: form.address, balance: Number(form.balance) || 0,
      };
      if (editing) await apiSend('/parties', 'PUT', { id: editing.id, ...payload });
      else await apiSend('/parties', 'POST', { company_id: company.id, party_type: kind, ...payload });
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
      await apiSend('/parties', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label={`Loading ${kind.toLowerCase()}s…`} />;
  if (error) return <ErrorState message={error} />;

  const balanceLabel = kind === 'Customer' ? 'Receivable' : 'Payable';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total {kind}s</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{parties.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total {balanceLabel}</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{inr(totalBalance)}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">With GSTIN</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{parties.filter((p) => p.gstin).length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Zero Balance</p><p className="mt-1.5 font-display text-xl font-semibold text-success">{parties.filter((p) => num(p.balance) === 0).length}</p></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder={`Search ${kind.toLowerCase()}s by name or GSTIN…`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> New {kind}</PrimaryButton>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message={parties.length === 0 ? `No ${kind.toLowerCase()}s yet — add your first one.` : 'Nothing matches your search.'} />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">GSTIN</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3 text-right">{balanceLabel}</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark">
                          {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </span>
                        <span className="font-medium text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.gstin || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5 text-xs text-ink-soft">
                        {p.phone && <span className="flex items-center gap-1.5"><Phone size={11} className="text-muted" />{p.phone}</span>}
                        {p.email && <span className="flex items-center gap-1.5"><Mail size={11} className="text-muted" />{p.email}</span>}
                        {!p.phone && !p.email && '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3 max-w-[220px] truncate text-ink-soft">{p.address || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      {num(p.balance) === 0 ? <Badge tone="success">Settled</Badge> : <span className="font-semibold text-ink">{inr(p.balance)}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(p)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
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
        <Modal title={editing ? `Edit — ${editing.name}` : `New ${kind}`} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label={`${kind} Name`} error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sharma Enterprises" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GSTIN (optional)">
                <input className={inputCls} maxLength={15} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} placeholder="27AABCS1429B1ZP" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXX XXXXX" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@business.in" />
              </Field>
              <Field label={`Opening ${balanceLabel} (₹)`}>
                <input type="number" min="0" className={inputCls} value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0" />
              </Field>
            </div>
            <Field label="Address">
              <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, PIN" />
            </Field>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : `Add ${kind}`}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={`Delete ${kind}`} onClose={() => setConfirmDelete(null)}>
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
