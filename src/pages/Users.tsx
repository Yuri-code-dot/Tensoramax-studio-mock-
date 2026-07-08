import { useEffect, useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { apiGet, apiSend } from '../lib/api';
import type { AppUser } from '../lib/types';
import { Card, CardHeader, Loading, ErrorState, Field, inputCls, PrimaryButton, Modal, Badge, StatusBadge } from '../components/ui';

const ROLES = ['Admin', 'Accountant', 'Viewer'];
const roleTone: Record<string, 'primary' | 'warning' | 'neutral'> = { Admin: 'primary', Accountant: 'warning', Viewer: 'neutral' };

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'Viewer' });

  const load = () => {
    apiGet<AppUser[]>('/users')
      .then((d) => { setUsers(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setFormErr('Enter a valid email address'); return; }
    setSaving(true);
    try {
      await apiSend('/users', 'POST', form);
      setShowForm(false);
      setForm({ name: '', email: '', role: 'Viewer' });
      setFormErr('');
      load();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (u: AppUser, role: string) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
    try { await apiSend('/users', 'PUT', { id: u.id, role }); } catch { load(); }
  };

  const toggleStatus = async (u: AppUser) => {
    const status = u.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status } : x)));
    try { await apiSend('/users', 'PUT', { id: u.id, status }); } catch { load(); }
  };

  if (loading) return <Loading label="Loading users…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted">
          Control who can access your books. Admins manage everything, Accountants can create entries, Viewers get read-only access.
        </p>
        <PrimaryButton onClick={() => setShowForm(true)}><Plus size={15} /> Invite User</PrimaryButton>
      </div>

      <Card>
        <CardHeader title="Team Members" subtitle={`${users.length} users`} action={<Badge tone="primary"><ShieldCheck size={11} className="mr-1" /> Role-based access</Badge>} />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark">
                        {u.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </span>
                      <span className="font-medium text-ink">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={roleTone[u.role] || 'neutral'}>{u.role}</Badge>
                      <select
                        className="rounded-md border border-line bg-surface px-1.5 py-1 text-xs text-ink-soft outline-none focus:border-primary"
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{u.last_login}</td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => toggleStatus(u)} className="text-xs font-semibold text-primary hover:underline">
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <Modal title="Invite User" onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full Name" error={formErr}>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kavita Deshpande" />
            </Field>
            <Field label="Email Address">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.in" />
            </Field>
            <Field label="Role">
              <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">{saving ? 'Sending…' : 'Send Invite'}</PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
}
