import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Shield, Calendar, Activity as ActivityIcon, Key, Copy, Check, LogOut, Moon, Sun, FolderKanban, Rocket, Boxes } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiGet } from '../../lib/api';
import type { Activity, Project, Deployment } from '../../lib/studioTypes';
import { Card, CardHeader, Badge, Field, inputCls, PrimaryButton } from '../../components/ui';
import { StatSkeleton } from '../../components/Skeletons';
import supabase from '../../lib/supabase';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDisplayName((user?.user_metadata?.display_name as string) || user?.email?.split('@')[0] || '');
    Promise.all([
      apiGet<Activity[]>('/studio?resource=activity').catch(() => []),
      apiGet<Project[]>('/studio?resource=projects').catch(() => []),
      apiGet<Deployment[]>('/studio?resource=deployments').catch(() => []),
    ])
      .then(([a, p, d]) => { setActivity(a); setProjects(p); setDeployments(d); })
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const apiKey = `txb_${(user?.id || 'anonymous').replace(/-/g, '').slice(0, 24)}`;
  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const initials = (displayName || user?.email || 'TX').slice(0, 2).toUpperCase();

  if (loading) return <StatSkeleton count={3} />;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-primary-dark" aria-hidden />
          <div className="flex flex-wrap items-end gap-4 px-6 pb-6">
            <span className="-mt-9 grid h-20 w-20 place-items-center rounded-2xl border-4 border-surface bg-primary text-2xl font-bold text-white shadow-lg">
              {initials}
            </span>
            <div className="min-w-0 flex-1 pt-3">
              <h2 className="truncate font-display text-xl font-semibold capitalize text-ink">{displayName || 'Builder'}</h2>
              <p className="flex items-center gap-1.5 text-sm text-muted"><Mail size={13} /> {user?.email ?? 'Guest session'}</p>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <Badge tone="primary"><Shield size={11} className="mr-1" /> Pro Plan</Badge>
              <Badge><Calendar size={11} className="mr-1" /> Joined {joined}</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Projects', value: projects.length, icon: FolderKanban, to: '/workspace' },
          { label: 'Live Deployments', value: deployments.filter((d) => d.status === 'Live').length, icon: Rocket, to: '/deploy' },
          { label: 'Workspace Events', value: activity.length, icon: ActivityIcon, to: '/dashboard' },
        ].map(({ label, value, icon: Icon, to }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 * (i + 1) }}>
            <Link to={to}>
              <Card className="h-full p-4 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <Icon size={15} className="text-primary" />
                </div>
                <p className="mt-2 font-display text-xl font-semibold text-ink">{value}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account settings */}
        <Card>
          <CardHeader title="Account" subtitle="Profile & preferences" />
          <form onSubmit={saveProfile} className="space-y-4 p-5">
            <Field label="Display Name">
              <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <input className={inputCls} value={user?.email ?? ''} readOnly aria-readonly="true" />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-line bg-cream/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Appearance</p>
                <p className="text-xs text-muted">Currently in {theme} mode</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink transition hover:border-primary/40"
              >
                {theme === 'dark' ? <Sun size={14} className="text-primary" /> : <Moon size={14} className="text-primary" />}
                Switch to {theme === 'dark' ? 'light' : 'dark'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</PrimaryButton>
              {saved && <span className="text-sm font-medium text-success">Saved ✓</span>}
            </div>
          </form>
        </Card>

        {/* API key + session */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="API Key" subtitle="Authenticate SDK & CLI requests" action={<Key size={14} className="text-muted" />} />
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
                <code className="flex-1 truncate font-mono text-[12px] text-ink-soft">{apiKey}••••</code>
                <button onClick={copyKey} className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-ink" aria-label="Copy API key">
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Pass as <code className="text-ink-soft">Authorization: Bearer txb_…</code> — see <Link to="/docs" className="font-semibold text-primary hover:underline">SDKs & CLI docs</Link>.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Session" subtitle="Signed in via Supabase Auth" />
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary"><UserIcon size={16} /></span>
                <div>
                  <p className="text-sm font-medium text-ink">{user ? 'Active session' : 'Guest session'}</p>
                  <p className="text-xs text-muted">{user ? 'Synced across tabs' : 'Sign in to sync your work'}</p>
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2 text-[13px] font-semibold text-danger transition hover:bg-danger/10"
                >
                  <LogOut size={13} /> Sign out
                </button>
              ) : (
                <Link to="/login" className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark">Sign in</Link>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader title="Your Recent Activity" subtitle="Latest events across the workspace" />
        <div className="scrollbar-thin max-h-[300px] overflow-y-auto">
          {activity.slice(0, 6).map((a) => (
            <div key={a.id} className="flex gap-3 border-b border-line/60 px-5 py-3.5 last:border-0">
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <ActivityIcon size={13} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-ink"><span className="font-semibold">{a.actor}</span> {a.action} <span className="font-medium text-primary">{a.target}</span></p>
                <p className="text-[11px] text-muted">{a.module} · {a.created_at}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
