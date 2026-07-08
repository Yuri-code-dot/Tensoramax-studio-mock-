import { useEffect, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { Invoice, InvoiceItem, Party } from '../lib/types';
import { inr, num, fmtDate, todayISO } from '../lib/format';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, StatusBadge, Badge } from '../components/ui';

export default function Invoices({ kind }: { kind: 'Sales' | 'Purchase' }) {
  const { company } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [form, setForm] = useState({ party: '', date: todayISO(), due_date: todayISO() });
  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', qty: 1, rate: 0, gst: 18 }]);

  const partyType = kind === 'Sales' ? 'Customer' : 'Supplier';

  const load = () => {
    if (!company) { setInvoices([]); setParties([]); setLoading(false); return; }
    Promise.all([
      apiGet<Invoice[]>(`/invoices?company_id=${company.id}&inv_type=${kind}`),
      apiGet<Party[]>(`/parties?company_id=${company.id}&party_type=${partyType}`),
    ])
      .then(([inv, p]) => { setInvoices(inv); setParties(p); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company, kind]);

  const totals = {
    total: invoices.reduce((s, i) => s + num(i.total), 0),
    paid: invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + num(i.total), 0),
    open: invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + num(i.total), 0),
    overdue: invoices.filter((i) => i.status === 'Overdue').length,
  };

  const formSubtotal = items.reduce((s, it) => s + num(it.qty) * num(it.rate), 0);
  const formTax = items.reduce((s, it) => s + num(it.qty) * num(it.rate) * (num(it.gst) / 100), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.party.trim()) { setFormErr(`${partyType} name is required`); return; }
    if (formSubtotal <= 0) { setFormErr('Add at least one line item with quantity and rate'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      const prefix = kind === 'Sales' ? 'INV' : 'PUR';
      await apiSend('/invoices', 'POST', {
        company_id: company.id,
        invoice_no: `${prefix}-${String(invoices.length + 101)}`,
        inv_type: kind,
        party: form.party.trim(),
        date: form.date,
        due_date: form.due_date,
        subtotal: formSubtotal,
        cgst: formTax / 2,
        sgst: formTax / 2,
        igst: 0,
        total: formSubtotal + formTax,
        status: 'Unpaid',
        items: items.filter((it) => it.name.trim()),
      });
      setShowForm(false);
      setForm({ party: '', date: todayISO(), due_date: todayISO() });
      setItems([{ name: '', qty: 1, rate: 0, gst: 18 }]);
      setFormErr('');
      load();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (inv: Invoice) => {
    await apiSend('/invoices', 'PUT', { id: inv.id, status: 'Paid' });
    setDetail(null);
    load();
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await apiSend('/invoices', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      setDetail(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label={`Loading ${kind.toLowerCase()}…`} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: `Total ${kind}`, value: inr(totals.total) },
          { label: 'Collected / Paid', value: inr(totals.paid) },
          { label: 'Outstanding', value: inr(totals.open) },
          { label: 'Overdue Invoices', value: String(totals.overdue) },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{k.label}</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-ink">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={() => { setFormErr(''); setShowForm(true); }}><Plus size={15} /> New {kind === 'Sales' ? 'Invoice' : 'Bill'}</PrimaryButton>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <EmptyState message={`No ${kind.toLowerCase()} records yet — create your first ${kind === 'Sales' ? 'invoice' : 'bill'}.`} />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">{partyType}</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3 text-right">GST</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-primary" onClick={() => setDetail(i)}>{i.invoice_no}</td>
                    <td className="px-5 py-3 text-ink" onClick={() => setDetail(i)}>{i.party}</td>
                    <td className="px-5 py-3 text-ink-soft" onClick={() => setDetail(i)}>{fmtDate(i.date)}</td>
                    <td className="px-5 py-3 text-ink-soft" onClick={() => setDetail(i)}>{fmtDate(i.due_date)}</td>
                    <td className="px-5 py-3 text-right text-ink-soft" onClick={() => setDetail(i)}>{inr(num(i.cgst) + num(i.sgst) + num(i.igst))}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink" onClick={() => setDetail(i)}>{inr(i.total)}</td>
                    <td className="px-5 py-3" onClick={() => setDetail(i)}><StatusBadge status={i.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(i); }} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detail && (
        <Modal title={detail.invoice_no} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink">{detail.party}</p>
                <p className="text-xs text-muted">{fmtDate(detail.date)} · due {fmtDate(detail.due_date)}</p>
              </div>
              <StatusBadge status={detail.status} />
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream text-left text-[11px] uppercase tracking-wide text-muted">
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.items || []).map((it, idx) => (
                    <tr key={idx} className="border-t border-line/60">
                      <td className="px-3 py-2 text-ink">{it.name}</td>
                      <td className="px-3 py-2 text-right text-ink-soft">{it.qty}</td>
                      <td className="px-3 py-2 text-right text-ink-soft">{inr(it.rate)}</td>
                      <td className="px-3 py-2 text-right font-medium text-ink">{inr(num(it.qty) * num(it.rate))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1.5 rounded-lg bg-cream px-4 py-3 text-sm">
              <div className="flex justify-between text-ink-soft"><span>Subtotal</span><span>{inr(detail.subtotal)}</span></div>
              <div className="flex justify-between text-ink-soft"><span>CGST</span><span>{inr(detail.cgst)}</span></div>
              <div className="flex justify-between text-ink-soft"><span>SGST</span><span>{inr(detail.sgst)}</span></div>
              {num(detail.igst) > 0 && <div className="flex justify-between text-ink-soft"><span>IGST</span><span>{inr(detail.igst)}</span></div>}
              <div className="flex justify-between border-t border-line pt-1.5 font-semibold text-ink"><span>Total</span><span>{inr(detail.total)}</span></div>
            </div>
            <div className="flex gap-3">
              {detail.status !== 'Paid' && (
                <PrimaryButton onClick={() => markPaid(detail)} className="flex-1 justify-center">Mark as Paid</PrimaryButton>
              )}
              <button onClick={() => setConfirmDelete(detail)} className="flex items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal title={`New ${kind === 'Sales' ? 'Sales Invoice' : 'Purchase Bill'}`} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label={`${partyType}`} error={formErr}>
              {parties.length > 0 ? (
                <select className={inputCls} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })}>
                  <option value="">Select {partyType.toLowerCase()}…</option>
                  {parties.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              ) : (
                <input className={inputCls} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder={`Type ${partyType.toLowerCase()} name`} />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Due Date"><input type="date" className={inputCls} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Line Items</span>
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input className={`${inputCls} flex-1`} placeholder="Item name" value={it.name} onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                  <input type="number" min="1" className={`${inputCls} w-16`} placeholder="Qty" value={it.qty || ''} onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, qty: Number(e.target.value) } : x)))} />
                  <input type="number" min="0" className={`${inputCls} w-24`} placeholder="Rate" value={it.rate || ''} onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, rate: Number(e.target.value) } : x)))} />
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="rounded-lg p-1.5 text-muted hover:bg-cream"><X size={14} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setItems([...items, { name: '', qty: 1, rate: 0, gst: 18 }])} className="text-xs font-semibold text-primary hover:underline">+ Add line</button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream px-4 py-3 text-sm">
              <Badge>GST 18% · {inr(formTax)}</Badge>
              <span className="font-semibold text-ink">Total {inr(formSubtotal + formTax)}</span>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">{saving ? 'Saving…' : `Save ${kind === 'Sales' ? 'Invoice' : 'Bill'}`}</PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={`Delete ${kind === 'Sales' ? 'Invoice' : 'Bill'}`} onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">Delete <strong className="text-ink">{confirmDelete.invoice_no}</strong> ({inr(confirmDelete.total)})? This cannot be undone.</p>
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
