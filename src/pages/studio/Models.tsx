import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Boxes, Download, Pencil, Trash2 } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import type { StudioModel } from '../../lib/studioTypes';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge, StatusBadge } from '../../components/ui';

const TASKS = ['Time Series', 'Vision', 'Text Classification', 'OCR', 'Tabular', 'NLP', 'Recommendation'];
const STATUSES = ['Published', 'Draft', 'Training'];
const emptyForm = { name: '', provider: '', task: 'Tabular', params: '', version: 'v1.0', status: 'Draft' };

export default function Models() {
  const [models, setModels] = useState<StudioModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StudioModel | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StudioModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    apiGet<StudioModel[]>('/studio?resource=models')
      .then((d) => { setModels(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.task.toLowerCase().includes(search.toLowerCase())),
    [models, search],
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (m: StudioModel) => {
    setEditing(m);
    setForm({ name: m.name, provider: m.provider, task: m.task, params: m.params, version: m.version, status: m.status });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Model name is required'); return; }
    setSaving(true);
    try {
      if (editing) await apiSend('/studio', 'PUT', { resource: 'models', id: editing.id, ...form, name: form.name.trim() });
      else await apiSend('/studio', 'POST', { resource: 'models', ...form, name: form.name.trim(), downloads: 0 });
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
      await apiSend('/studio', 'DELETE', { resource: 'models', id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading model hub…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Models</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{models.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Published</p><p className="mt-1.5 font-display text-xl font-semibold text-success">{models.filter((m) => m.status === 'Published').length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Downloads</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{models.reduce((s, m) => s + (Number(m.downloads) || 0), 0).toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Tasks</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{new Set(models.map((m) => m.task)).size}</p></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder="Search models or tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <PrimaryButton onClick={openCreate}><Plus size={15} /> Publish Model</PrimaryButton>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState message={models.length === 0 ? 'No models yet — publish your first one.' : 'No models match.'} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col p-5 transition hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Boxes size={18} /></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(m)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(m)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="mt-3 truncate font-mono text-[14px] font-semibold text-ink">{m.name}</h3>
              <p className="text-xs text-muted">{m.provider || 'community'} · {m.version}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{m.task}</Badge>
                {m.params && <Badge>{m.params} params</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <StatusBadge status={m.status} />
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted"><Download size={11} /> {(Number(m.downloads) || 0).toLocaleString('en-IN')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'Publish Model'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Model Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. tensora-forecast-v3" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Provider / Org">
                <input className={inputCls} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g. tensoramax" />
              </Field>
              <Field label="Task">
                <select className={inputCls} value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })}>
                  {TASKS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Parameters">
                <input className={inputCls} value={form.params} onChange={(e) => setForm({ ...form, params: e.target.value })} placeholder="124M" />
              </Field>
              <Field label="Version">
                <input className={inputCls} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="v1.0" />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Publish Model'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Model" onClose={() => setConfirmDelete(null)}>
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
