import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet, apiSend } from '../lib/api';
import type { StockItem } from '../lib/types';
import { inr, num } from '../lib/format';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge } from '../components/ui';

const emptyForm = { name: '', hsn: '', category: 'General', unit: 'Nos', quantity: '', rate: '', reorder_level: '', gst_rate: '18' };

export default function Inventory() {
  const { company } = useCompany();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StockItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!company) { setItems([]); setLoading(false); return; }
    apiGet<StockItem[]>(`/inventory?company_id=${company.id}`)
      .then((d) => { setItems(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company]);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.hsn.includes(search) || i.category.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const stockValue = items.reduce((s, i) => s + num(i.quantity) * num(i.rate), 0);
  const lowStock = items.filter((i) => num(i.quantity) <= num(i.reorder_level));

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (i: StockItem) => {
    setEditing(i);
    setForm({
      name: i.name, hsn: i.hsn, category: i.category, unit: i.unit,
      quantity: String(num(i.quantity)), rate: String(num(i.rate)),
      reorder_level: String(num(i.reorder_level)), gst_rate: String(num(i.gst_rate)),
    });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Item name is required'); return; }
    if (!company) { setFormErr('Create a company first'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), hsn: form.hsn, category: form.category, unit: form.unit,
        quantity: Number(form.quantity) || 0, rate: Number(form.rate) || 0,
        reorder_level: Number(form.reorder_level) || 0, gst_rate: Number(form.gst_rate) || 18,
      };
      if (editing) await apiSend('/inventory', 'PUT', { id: editing.id, ...payload });
      else await apiSend('/inventory', 'POST', { company_id: company.id, ...payload });
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
      await apiSend('/inventory', 'DELETE', { id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading inventory…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Stock Items</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{items.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Stock Value</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{inr(stockValue)}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Low Stock</p><p className="mt-1.5 font-display text-xl font-semibold text-danger">{lowStock.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Categories</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{new Set(items.map((i) => i.category)).size}</p></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder="Search item, HSN or category…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> New Item</PrimaryButton>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message={items.length === 0 ? 'No stock items yet — add your first item.' : 'No stock items match.'} />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">HSN</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Value</th>
                  <th className="px-5 py-3 text-center">GST</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const low = num(i.quantity) <= num(i.reorder_level);
                  return (
                    <tr key={i.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                      <td className="px-5 py-3 font-medium text-ink">{i.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{i.hsn}</td>
                      <td className="px-5 py-3 text-ink-soft">{i.category}</td>
                      <td className="px-5 py-3 text-right text-ink">{num(i.quantity)} {i.unit}</td>
                      <td className="px-5 py-3 text-right text-ink-soft">{inr(i.rate)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">{inr(num(i.quantity) * num(i.rate))}</td>
                      <td className="px-5 py-3 text-center text-ink-soft">{num(i.gst_rate)}%</td>
                      <td className="px-5 py-3">
                        {low ? (
                          <Badge tone="danger"><AlertTriangle size={11} className="mr-1" /> Low</Badge>
                        ) : (
                          <Badge tone="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(i)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => setConfirmDelete(i)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'New Stock Item'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Item Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Copper Wire 2.5mm" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="HSN Code"><input className={inputCls} value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} placeholder="8544" /></Field>
              <Field label="Category"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Quantity"><input type="number" min="0" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
              <Field label="Unit">
                <select className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {['Nos', 'Pcs', 'Kg', 'Mtr', 'Ltr', 'Box', 'Set'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Rate (₹)"><input type="number" min="0" className={inputCls} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reorder Level"><input type="number" min="0" className={inputCls} value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} /></Field>
              <Field label="GST Rate (%)">
                <select className={inputCls} value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}>
                  {['0', '5', '12', '18', '28'].map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Item'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Stock Item" onClose={() => setConfirmDelete(null)}>
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
