import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Calculator, Boxes, Database, Rocket, Pencil, Trash2 } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import type { Project } from '../../lib/studioTypes';
import { Card, Loading, ErrorState, EmptyState, Field, inputCls, PrimaryButton, Modal, StatusBadge } from '../../components/ui';

const MODULES = ['Accounting', 'Models', 'Datasets', 'Deploy', 'General'];
const STATUSES = ['Active', 'Paused', 'Archived'];
const moduleIcon: Record<string, typeof Calculator> = { Accounting: Calculator, Models: Boxes, Datasets: Database, Deploy: Rocket, General: FolderKanban };
const moduleLink: Record<string, string> = { Accounting: '/accounting', Models: '/models', Datasets: '/datasets', Deploy: '/deploy', General: '/workspace' };
const emptyForm = { name: '', description: '', module: 'General', status: 'Active' };

export default function Workspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = () => {
    apiGet<Project[]>('/studio?resource=projects')
      .then((d) => { setProjects(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErr(''); setShowForm(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, module: p.module, status: p.status });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Project name is required'); return; }
    setSaving(true);
    try {
      const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (editing) await apiSend('/studio', 'PUT', { resource: 'projects', id: editing.id, ...form, name: form.name.trim(), updated_at: now });
      else await apiSend('/studio', 'POST', { resource: 'projects', ...form, name: form.name.trim(), updated_at: now });
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
      await apiSend('/studio', 'DELETE', { resource: 'projects', id: confirmDelete.id });
      setConfirmDelete(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading workspace…" />;
  if (error) return <ErrorState message={error} />;

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.module === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...MODULES].map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${filter === m ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-soft hover:border-primary/40'}`}
          >
            {m}
          </button>
        ))}
        <div className="ml-auto">
          <PrimaryButton onClick={openCreate}><Plus size={15} /> New Project</PrimaryButton>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState message={projects.length === 0 ? 'No projects yet — create your first one.' : 'No projects in this module.'} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const Icon = moduleIcon[p.module] || FolderKanban;
            return (
              <Card key={p.id} className="flex flex-col p-5 transition hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={18} /></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-ink" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(p)} className="rounded-lg p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="mt-3 font-display text-[15px] font-semibold text-ink">{p.name}</h3>
                <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{p.description || 'No description.'}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-[11px] text-muted">{p.updated_at}</span>
                  </div>
                  <Link to={moduleLink[p.module] || '/workspace'} className="text-xs font-semibold text-primary hover:underline">{p.module} →</Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? `Edit — ${editing.name}` : 'New Project'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Project Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q4 Financial Close" />
            </Field>
            <Field label="Description">
              <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Module">
                <select className={inputCls} value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
                  {MODULES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Project'}
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Project" onClose={() => setConfirmDelete(null)}>
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
