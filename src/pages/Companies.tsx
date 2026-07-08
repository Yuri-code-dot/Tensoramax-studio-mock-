import { useState } from 'react';
import { CheckCircle2, Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import type { CompanyInput } from '../contexts/CompanyContext';
import type { Company } from '../lib/types';
import { Card, Loading, ErrorState, Badge, Field, inputCls, PrimaryButton, Modal, EmptyState } from '../components/ui';
import { fmtDate } from '../lib/format';

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const emptyForm: CompanyInput = { name: '', gstin: '', pan: '', state: 'Maharashtra', address: '', fy_start: '2024-04-01', fy_end: '2025-03-31' };

export default function Companies() {
  const { companies, company, loading, error, setActive, createCompany, updateCompany, deleteCompany } = useCompany();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyInput>(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) return <Loading label="Loading companies…" />;
  if (error) return <ErrorState message={error} />;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (c: Company) => {
    setEditing(c);
    setForm({ name: c.name, gstin: c.gstin, pan: c.pan, state: c.state, address: c.address, fy_start: c.fy_start, fy_end: c.fy_end });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Company name is required'); return; }
    if (form.gstin && form.gstin.trim().length !== 15) { setFormErr('GSTIN must be 15 characters (or leave blank)'); return; }
    setSaving(true);
    try {
      if (editing) await updateCompany(editing.id, { ...form, name: form.name.trim() });
      else await createCompany({ ...form, name: form.name.trim() });
      setShowForm(false);
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
      await deleteCompany(confirmDelete.id);
      setConfirmDelete(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Create unlimited companies and switch between them — the active company drives all ledgers, vouchers, invoices, parties and reports.
        </p>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> New Company</PrimaryButton>
      </div>

      {companies.length === 0 && (
        <Card><EmptyState message="No companies yet. Create your first company to start your books." /></Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => {
          const active = c.id === company?.id;
          return (
            <Card key={c.id} className={`p-5 transition ${active ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Building2 size={20} />
                </div>
                <div className="flex items-center gap-1.5">
                  {active && <Badge tone="primary">Active</Badge>}
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit company">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setConfirmDelete(c)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete company">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{c.name}</h3>
              <p className="mt-1 text-xs text-muted">{c.address || 'No address on record'}</p>
              <dl className="mt-4 space-y-2 text-[13px]">
                <div className="flex justify-between"><dt className="text-muted">GSTIN</dt><dd className="font-medium text-ink">{c.gstin || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">PAN</dt><dd className="font-medium text-ink">{c.pan || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">State</dt><dd className="font-medium text-ink">{c.state || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Financial Year</dt><dd className="font-medium text-ink">{fmtDate(c.fy_start)} – {fmtDate(c.fy_end)}</dd></div>
              </dl>
              <button
                onClick={() => setActive(c.id)}
                disabled={active}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-cream text-muted' : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                <CheckCircle2 size={15} /> {active ? 'Currently active' : 'Switch to this company'}
              </button>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'Create Company'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Company Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apex Traders Pvt Ltd" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GSTIN (optional)">
                <input className={inputCls} value={form.gstin} maxLength={15} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} placeholder="27AABCS1429B1ZP" />
              </Field>
              <Field label="PAN (optional)">
                <input className={inputCls} value={form.pan} maxLength={10} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="AABCS1429B" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="State">
                <select className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Address">
                <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, PIN" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="FY Start"><input type="date" className={inputCls} value={form.fy_start} onChange={(e) => setForm({ ...form, fy_start: e.target.value })} /></Field>
              <Field label="FY End"><input type="date" className={inputCls} value={form.fy_end} onChange={(e) => setForm({ ...form, fy_end: e.target.value })} /></Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Company'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Company" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              Delete <strong className="text-ink">{confirmDelete.name}</strong> permanently? All of its ledgers, vouchers, invoices, inventory, parties, GST records, banking and payroll data will be removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-cream">Cancel</button>
              <button onClick={doDelete} disabled={saving} className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {saving ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
