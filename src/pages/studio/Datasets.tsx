import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Database, Download, Pencil, Trash2 } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import type { Dataset } from '../../lib/studioTypes';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge } from '../../components/ui';

const FORMATS = ['CSV', 'Parquet', 'JSON', 'JSONL', 'Arrow'];
const LICENSES = ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'CC0', 'Proprietary'];
const emptyForm = { name: '', format: 'CSV', rows_count: '', size_label: '', license: 'MIT' };

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Dataset | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dataset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    apiGet<Dataset[]>('/studio?resource=datasets')
      .then((d) => { setDatasets(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.format.toLowerCase().includes(search.toLowerCase())),
    [datasets, search],
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (d: Dataset) => {
    setEditing(d);
    setForm({ name: d.name, format: d.format, rows_count: String(Number(d.rows_count) || 0), size_label: d.size_label, license: d.license });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Dataset name is required'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), format: form.format, rows_count: Number(form.rows_count) || 0, size_label: form.size_label, license: form.license };
      if (editing) await apiSend('/studio', 'PUT', { resource: 'datasets', id: editing.id, ...payload });
      else await apiSend('/studio', 'POST', { resource: 'datasets', ...payload, downloads: 0 });
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
      await apiSend('/studio', 'DELETE', { resource: 'datasets', id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading dataset hub…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Datasets</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{datasets.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total Rows</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{datasets.reduce((s, d) => s + (Number(d.rows_count) || 0), 0).toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Downloads</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{datasets.reduce((s, d) => s + (Number(d.downloads) || 0), 0).toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Formats</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{new Set(datasets.map((d) => d.format)).size}</p></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder="Search datasets…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> Upload Dataset</PrimaryButton>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message={datasets.length === 0 ? 'No datasets yet — upload your first one.' : 'No datasets match.'} />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Dataset</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3 text-right">Rows</th>
                  <th className="px-5 py-3 text-right">Size</th>
                  <th className="px-5 py-3">License</th>
                  <th className="px-5 py-3 text-right">Downloads</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary"><Database size={14} /></div>
                        <span className="font-mono text-[13px] font-semibold text-ink">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge>{d.format}</Badge></td>
                    <td className="px-5 py-3 text-right text-ink-soft">{(Number(d.rows_count) || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{d.size_label || '—'}</td>
                    <td className="px-5 py-3 text-ink-soft">{d.license}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted"><Download size={11} /> {(Number(d.downloads) || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(d)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(d)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
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
        <Modal title={editing ? `Edit — ${editing.name}` : 'Upload Dataset'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Dataset Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. indian-gst-invoices" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Format">
                <select className={inputCls} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="License">
                <select className={inputCls} value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })}>
                  {LICENSES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Row Count">
                <input type="number" min="0" className={inputCls} value={form.rows_count} onChange={(e) => setForm({ ...form, rows_count: e.target.value })} placeholder="850000" />
              </Field>
              <Field label="Size">
                <input className={inputCls} value={form.size_label} onChange={(e) => setForm({ ...form, size_label: e.target.value })} placeholder="410 MB" />
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Upload Dataset'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Dataset" onClose={() => setConfirmDelete(null)}>
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
