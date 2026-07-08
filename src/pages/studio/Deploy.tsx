import { useEffect, useState } from 'react';
import { Plus, Rocket, Globe, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import type { Deployment } from '../../lib/studioTypes';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, Badge, StatusBadge } from '../../components/ui';

const TARGETS = ['Serverless', 'GPU Endpoint', 'Static Site', 'Container'];
const REGIONS = ['ap-south-1 (Mumbai)', 'us-east-1 (Virginia)', 'eu-west-1 (Ireland)', 'ap-southeast-1 (Singapore)'];
const STATUSES = ['Live', 'Building', 'Stopped', 'Failed'];
const emptyForm = { name: '', target: 'Serverless', region: REGIONS[0], version: 'v1.0.0', status: 'Building' };

export default function Deploy() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deployment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Deployment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    apiGet<Deployment[]>('/studio?resource=deployments')
      .then((d) => { setDeployments(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (d: Deployment) => {
    setEditing(d);
    setForm({ name: d.name, target: d.target, region: d.region, version: d.version, status: d.status });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Deployment name is required'); return; }
    setSaving(true);
    try {
      const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const payload = { ...form, name: form.name.trim(), url: `https://${slug}.tensoramax.app`, deployed_at: now };
      if (editing) await apiSend('/studio', 'PUT', { resource: 'deployments', id: editing.id, ...payload });
      else await apiSend('/studio', 'POST', { resource: 'deployments', ...payload });
      setShowForm(false);
      load();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (d: Deployment) => {
    const status = d.status === 'Live' ? 'Stopped' : 'Live';
    setDeployments((prev) => prev.map((x) => (x.id === d.id ? { ...x, status } : x)));
    try { await apiSend('/studio', 'PUT', { resource: 'deployments', id: d.id, status }); } catch { load(); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await apiSend('/studio', 'DELETE', { resource: 'deployments', id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading deployments…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Deployments</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{deployments.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Live</p><p className="mt-1.5 font-display text-xl font-semibold text-success">{deployments.filter((d) => d.status === 'Live').length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Building</p><p className="mt-1.5 font-display text-xl font-semibold text-primary">{deployments.filter((d) => d.status === 'Building').length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Regions</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{new Set(deployments.map((d) => d.region)).size}</p></Card>
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={openCreate}><Plus size={15} /> New Deployment</PrimaryButton>
      </div>

      {deployments.length === 0 ? (
        <Card><EmptyState message="No deployments yet — ship your first endpoint." /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {deployments.map((d) => (
            <Card key={d.id} className="p-5 transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Rocket size={18} /></div>
                  <div>
                    <h3 className="font-display text-[15px] font-semibold text-ink">{d.name}</h3>
                    <p className="text-xs text-muted">{d.target} · {d.region}</p>
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-cream px-3 py-2">
                <Globe size={13} className="shrink-0 text-primary" />
                <span className="truncate font-mono text-[12px] text-ink-soft">{d.url}</span>
                <Badge>{d.version}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11px] text-muted">Deployed {d.deployed_at}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleStatus(d)} className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:border-primary/40" title={d.status === 'Live' ? 'Stop' : 'Start'}>
                    <RefreshCw size={11} /> {d.status === 'Live' ? 'Stop' : 'Start'}
                  </button>
                  <button onClick={() => openEdit(d)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(d)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'New Deployment'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Deployment Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. billing-api" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Target">
                <select className={inputCls} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                  {TARGETS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Region">
                <select className={inputCls} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Version">
                <input className={inputCls} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="v1.0.0" />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Deploying…' : editing ? 'Save Changes' : 'Deploy'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Deployment" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">Delete <strong className="text-ink">{confirmDelete.name}</strong>? The endpoint will stop serving immediately.</p>
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
