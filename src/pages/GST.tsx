import { useEffect, useState } from 'react';
import { Landmark, ArrowDownToLine, ArrowUpFromLine, Scale, Plus, Pencil, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { Invoice, GstRecord } from '../lib/types';
import { inr, num, fmtDate, todayISO } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, EmptyState, Badge, StatusBadge, Field, inputCls, PrimaryButton, Modal } from '../components/ui';

const RETURN_TYPES = ['GSTR-1', 'GSTR-3B', 'GSTR-9', 'CMP-08'];
const STATUSES = ['Draft', 'Pending', 'Filed'];
const emptyForm = { period: '', return_type: 'GSTR-1', taxable_value: '', tax_amount: '', itc_claimed: '', status: 'Draft', filed_on: '' };

export default function GST() {
  const { company } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [records, setRecords] = useState<GstRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GstRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<GstRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!company) { setInvoices([]); setRecords([]); setLoading(false); return; }
    Promise.all([
      apiGet<Invoice[]>(`/invoices?company_id=${company.id}`),
      apiGet<GstRecord[]>(`/gst-records?company_id=${company.id}`),
    ])
      .then(([inv, rec]) => { setInvoices(inv); setRecords(rec); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (r: GstRecord) => {
    setEditing(r);
    setForm({
      period: r.period, return_type: r.return_type, taxable_value: String(num(r.taxable_value)),
      tax_amount: String(num(r.tax_amount)), itc_claimed: String(num(r.itc_claimed)),
      status: r.status, filed_on: r.filed_on || '',
    });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.period.trim()) { setFormErr('Period is required (e.g. December 2025)'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      const payload = {
        period: form.period.trim(), return_type: form.return_type,
        taxable_value: Number(form.taxable_value) || 0, tax_amount: Number(form.tax_amount) || 0,
        itc_claimed: Number(form.itc_claimed) || 0, status: form.status,
        filed_on: form.status === 'Filed' ? (form.filed_on || todayISO()) : '',
      };
      if (editing) await apiSend('/gst-records', 'PUT', { id: editing.id, ...payload });
      else await apiSend('/gst-records', 'POST', { company_id: company.id, ...payload });
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
      await apiSend('/gst-records', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading GST data…" />;
  if (error) return <ErrorState message={error} />;

  const sales = invoices.filter((i) => i.inv_type === 'Sales');
  const purchases = invoices.filter((i) => i.inv_type === 'Purchase');
  const tax = (list: Invoice[]) => list.reduce((s, i) => s + num(i.cgst) + num(i.sgst) + num(i.igst), 0);
  const output = tax(sales);
  const input = tax(purchases);
  const net = Math.max(0, output - input);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Output Tax (from Sales)', value: output, icon: ArrowUpFromLine, note: `${sales.length} outward supplies` },
          { label: 'Input Tax Credit (from Purchases)', value: input, icon: ArrowDownToLine, note: `${purchases.length} inward supplies` },
          { label: 'Net Liability', value: net, icon: Scale, note: 'Payable after ITC set-off' },
        ].map(({ label, value, icon: Icon, note }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{inr(value)}</p>
                <p className="mt-1 text-xs text-muted">{note}</p>
              </div>
              <div className="rounded-xl bg-primary-soft p-2.5 text-primary"><Icon size={18} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="GST Return Records"
          subtitle="Track GSTR filings per period"
          action={
            <div className="flex items-center gap-2">
              {company?.gstin && <Badge tone="primary"><Landmark size={11} className="mr-1" /> {company.gstin}</Badge>}
              <PrimaryButton onClick={openCreate}><Plus size={15} /> New Record</PrimaryButton>
            </div>
          }
        />
        {records.length === 0 ? (
          <EmptyState message="No GST records yet — add your first return record." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Return</th>
                  <th className="px-5 py-3 text-right">Taxable Value</th>
                  <th className="px-5 py-3 text-right">Tax Amount</th>
                  <th className="px-5 py-3 text-right">ITC Claimed</th>
                  <th className="px-5 py-3 text-right">Net Payable</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Filed On</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-ink">{r.period}</td>
                    <td className="px-5 py-3"><Badge>{r.return_type}</Badge></td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(r.taxable_value)}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(r.tax_amount)}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(r.itc_claimed)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(Math.max(0, num(r.tax_amount) - num(r.itc_claimed)))}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-muted">{r.filed_on ? fmtDate(r.filed_on) : '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(r)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tax Breakup — Output" subtitle="From sales invoices" />
          <div className="space-y-3 px-5 py-5 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">CGST</span><span className="font-semibold text-ink">{inr(sales.reduce((s, i) => s + num(i.cgst), 0))}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">SGST</span><span className="font-semibold text-ink">{inr(sales.reduce((s, i) => s + num(i.sgst), 0))}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">IGST</span><span className="font-semibold text-ink">{inr(sales.reduce((s, i) => s + num(i.igst), 0))}</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Tax Breakup — Input Credit" subtitle="From purchase bills" />
          <div className="space-y-3 px-5 py-5 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">CGST</span><span className="font-semibold text-ink">{inr(purchases.reduce((s, i) => s + num(i.cgst), 0))}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">SGST</span><span className="font-semibold text-ink">{inr(purchases.reduce((s, i) => s + num(i.sgst), 0))}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">IGST</span><span className="font-semibold text-ink">{inr(purchases.reduce((s, i) => s + num(i.igst), 0))}</span></div>
          </div>
        </Card>
      </div>

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.return_type} ${editing.period}` : 'New GST Record'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Period" error={formErr}>
                <input className={inputCls} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. December 2025" />
              </Field>
              <Field label="Return Type">
                <select className={inputCls} value={form.return_type} onChange={(e) => setForm({ ...form, return_type: e.target.value })}>
                  {RETURN_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Taxable Value (₹)"><input type="number" min="0" className={inputCls} value={form.taxable_value} onChange={(e) => setForm({ ...form, taxable_value: e.target.value })} /></Field>
              <Field label="Tax Amount (₹)"><input type="number" min="0" className={inputCls} value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: e.target.value })} /></Field>
              <Field label="ITC Claimed (₹)"><input type="number" min="0" className={inputCls} value={form.itc_claimed} onChange={(e) => setForm({ ...form, itc_claimed: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              {form.status === 'Filed' && (
                <Field label="Filed On">
                  <input type="date" className={inputCls} value={form.filed_on} onChange={(e) => setForm({ ...form, filed_on: e.target.value })} />
                </Field>
              )}
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Record'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete GST Record" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">Delete <strong className="text-ink">{confirmDelete.return_type} — {confirmDelete.period}</strong>? This cannot be undone.</p>
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
