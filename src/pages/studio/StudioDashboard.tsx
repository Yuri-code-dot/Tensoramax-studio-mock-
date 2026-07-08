import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban, Calculator, Boxes, Database, Rocket, Plus, ArrowRight,
  Activity as ActivityIcon, FileText, Sparkles, Cpu, Users2, HardDrive, Gauge,
} from 'lucide-react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Project, StudioModel, Deployment, Activity } from '../../lib/studioTypes';
import { Card, CardHeader, Loading, ErrorState, StatusBadge } from '../../components/ui';

interface Metric { id: number; metric_key: string; label: string; value: string; change_label: string }

const metricIcon: Record<string, typeof Cpu> = {
  models_hosted: Boxes,
  datasets: Database,
  deployments: Rocket,
  api_requests: Gauge,
  gpu_hours: Cpu,
  monthly_users: Users2,
  storage_used: HardDrive,
  inference_requests: Sparkles,
  workspace_activity: ActivityIcon,
};

// Weekly inference volume (millions) — rendered as an animated bar chart
const inferenceSeries = [
  { label: 'Mon', value: 0.72 }, { label: 'Tue', value: 0.86 }, { label: 'Wed', value: 0.81 },
  { label: 'Thu', value: 0.94 }, { label: 'Fri', value: 1.02 }, { label: 'Sat', value: 0.64 }, { label: 'Sun', value: 0.58 },
];

export default function StudioDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [models, setModels] = useState<StudioModel[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Project[]>('/studio?resource=projects'),
      apiGet<StudioModel[]>('/studio?resource=models'),
      apiGet<Deployment[]>('/studio?resource=deployments'),
      apiGet<Activity[]>('/studio?resource=activity'),
      apiGet<Metric[]>('/studio?resource=metrics').catch(() => [] as Metric[]),
    ])
      .then(([p, m, dep, a, met]) => {
        setProjects(p); setModels(m); setDeployments(dep); setActivity(a); setMetrics(met);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading your Studio…" />;
  if (error) return <ErrorState message={error} />;

  const liveDeploys = deployments.filter((d) => d.status === 'Live').length;
  const name = user?.email?.split('@')[0] ?? 'builder';
  const maxVal = Math.max(...inferenceSeries.map((s) => s.value));
  const headline = metrics.filter((m) => ['api_requests', 'gpu_hours', 'monthly_users', 'storage_used', 'inference_requests'].includes(m.metric_key));

  const quickActions = [
    { label: 'New Project', icon: Plus, to: '/workspace' },
    { label: 'Open AI Studio', icon: Sparkles, to: '/ai-studio' },
    { label: 'Open Accounting', icon: Calculator, to: '/accounting' },
    { label: 'New Invoice', icon: FileText, to: '/accounting/sales' },
    { label: 'Publish Model', icon: Boxes, to: '/models' },
    { label: 'New Deployment', icon: Rocket, to: '/deploy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Welcome back, <span className="capitalize text-primary">{name}</span></h2>
        <p className="mt-1 text-sm text-muted">Build. Train. Deploy. — here's your platform at a glance.</p>
      </div>

      {/* Platform metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {headline.map((m, i) => {
          const Icon = metricIcon[m.metric_key] ?? Gauge;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
              <Card className="h-full p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{m.label}</p>
                  <Icon size={15} className="text-primary" />
                </div>
                <p className="mt-2 font-display text-xl font-semibold text-ink">{m.value}</p>
                <p className="mt-0.5 text-[11px] text-muted">{m.change_label}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Inference chart */}
        <Card className="xl:col-span-2">
          <CardHeader title="Inference Requests" subtitle="This week · millions of requests across model-api" />
          <div className="p-5">
            <div className="flex items-end gap-3 sm:gap-5" style={{ height: 200 }}>
              {inferenceSeries.map((s, i) => (
                <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(s.value / maxVal) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                      className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-primary/70 to-primary"
                      title={`${s.value.toFixed(2)}M requests`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
              <span>Peak: Friday · 1.02M requests</span>
              <Link to="/deploy" className="font-semibold text-primary hover:underline">View endpoints →</Link>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Across every module" />
          <div className="scrollbar-thin max-h-[320px] overflow-y-auto">
            {activity.slice(0, 8).map((a) => (
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

      {/* Quick actions */}
      <Card>
        <CardHeader title="Quick Actions" subtitle="Jump straight into any module" />
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-cream/50 px-3 py-4 text-center transition hover:border-primary/40 hover:bg-primary-soft"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white"><Icon size={16} /></div>
              <span className="text-xs font-semibold text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader title="Projects" subtitle="Across all modules" action={<Link to="/workspace" className="text-xs font-semibold text-primary hover:underline">Open Workspace →</Link>} />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 7).map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="max-w-[320px] truncate text-xs text-muted">{p.description}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{p.module}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-muted">{p.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Module gateway */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: 'AI Studio', d: 'Prompt & compare TXB models', i: Sparkles, to: '/ai-studio', accent: true },
          { t: 'Accounting', d: 'Companies, ledgers, GST & reports', i: Calculator, to: '/accounting' },
          { t: 'Models', d: `${models.length} models · TXB family`, i: Boxes, to: '/models' },
          { t: 'Deploy', d: `${liveDeploys} endpoints live`, i: Rocket, to: '/deploy' },
        ].map(({ t, d, i: I, to, accent }) => (
          <Link key={t} to={to}>
            <Card className={`group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md ${accent ? 'border-primary/40 bg-primary-soft/40' : 'hover:border-primary/40'}`}>
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? 'bg-primary text-white' : 'bg-primary-soft text-primary'}`}><I size={18} /></div>
                <ArrowRight size={15} className="text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-display text-[15px] font-semibold text-ink">{t}</p>
              <p className="mt-0.5 text-xs text-muted">{d}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-4 text-sm text-ink-soft">
        <FolderKanban size={15} className="shrink-0 text-primary" />
        <span><strong className="text-ink">Workspace tip:</strong> every project links directly to its module — keep engineering, data and finance aligned in one place.</span>
        <Link to="/workspace" className="ml-auto shrink-0 text-[13px] font-semibold text-primary hover:underline">Open →</Link>
      </div>
    </div>
  );
}
